/**
 * 个人化兴趣地点推荐系统
 * 基于用户历史访问记录分析兴趣偏好，推荐相关地点
 * 结合散列表、堆和加权图数据结构实现个性化推荐
 */

// 引入LRU历史记录模块
const lruHistory = require('./lru-history');

/**
 * 推荐系统类
 * 使用散列表存储用户对不同类别的兴趣度
 * 使用优先队列（数组+排序模拟）实现推荐排序
 */
class RecommendationSystem {
    constructor() {
        // 用户兴趣模型 - 类别 => 权重
        this.categoryInterests = new Map();

        // 时间衰减因子 - 决定历史访问随时间的权重衰减程度
        this.timeDecayFactor = 0.5;

        // 时间段权重 - 不同时段对类别的权重提升
        this.timeBasedWeights = {
            'morning': ['教学楼', '图书馆', '食堂'],
            'noon': ['食堂', '休闲娱乐', '超市'],
            'afternoon': ['教学楼', '图书馆', '运动场'],
            'evening': ['食堂', '宿舍', '超市'],
            'night': ['宿舍', '图书馆', '小吃街']
        };

        // 已推荐过的地点集合，避免重复推荐
        this.recommendedLocations = new Set();

        // 上次更新兴趣模型的时间
        this.lastUpdateTime = 0;
    }

    /**
     * 更新用户兴趣模型
     * @param {Array} historyLocations - 用户历史访问的地点
     */
    updateInterestModel(historyLocations) {
        // 如果最近10分钟内更新过，则跳过
        const now = Date.now();
        if (now - this.lastUpdateTime < 10 * 60 * 1000) {
            return;
        }

        // 重置兴趣模型
        this.categoryInterests.clear();

        // 按访问时间排序，最近访问的排在前面
        historyLocations.sort((a, b) => (b.lastVisit || 0) - (a.lastVisit || 0));

        // 计算每个类别的兴趣权重
        historyLocations.forEach((location, index) => {
            if (!location.category) return;

            // 计算时间衰减权重 - 最近访问的权重更高
            const recencyWeight = Math.pow(1 - this.timeDecayFactor, index);

            // 计算频率权重 - 访问频率越高权重越大
            const frequencyWeight = location.frequency || 1;

            // 计算地点类别的总权重
            const weight = recencyWeight * frequencyWeight;

            // 更新类别权重
            const currentWeight = this.categoryInterests.get(location.category) || 0;
            this.categoryInterests.set(location.category, currentWeight + weight);
        });

        // 更新时间戳
        this.lastUpdateTime = now;

        console.log('用户兴趣模型已更新:', Object.fromEntries(this.categoryInterests));
    }

    /**
     * 获取当前时间段
     * @returns {String} 时间段名称
     */
    getCurrentTimePeriod() {
        const hour = new Date().getHours();

        if (hour >= 6 && hour < 9) return 'morning';
        if (hour >= 9 && hour < 14) return 'noon';
        if (hour >= 14 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * 重置已推荐地点集合
     */
    resetRecommendedLocations() {
        this.recommendedLocations.clear();
    }

    /**
     * 计算地点的推荐分数
     * @param {Object} location - 地点对象
     * @param {Array} visitedLocationNames - 已访问过的地点名称数组
     * @returns {Number} 推荐分数
     */
    calculateRecommendationScore(location, visitedLocationNames) {
        if (!location || !location.category) return 0;

        // 基础分数 - 类别兴趣
        let score = this.categoryInterests.get(location.category) || 0;

        // 如果是已访问过的地点，降低分数
        if (visitedLocationNames.includes(location.name)) {
            score *= 0.5;
        }

        // 当前时间段加成
        const currentPeriod = this.getCurrentTimePeriod();
        const preferredCategories = this.timeBasedWeights[currentPeriod] || [];

        if (preferredCategories.includes(location.category)) {
            score *= 1.5;
        }

        return score;
    }

    /**
     * 获取个性化推荐地点
     * @param {Array} allLocations - 所有可推荐的地点
     * @param {Array} historyLocations - 用户历史访问的地点
     * @param {Number} count - 推荐数量
     * @returns {Array} 推荐地点数组
     */
    getRecommendedLocations(allLocations, historyLocations, count = 5) {
        // 更新用户兴趣模型
        this.updateInterestModel(historyLocations);

        // 如果历史记录太少，无法构建有效的兴趣模型，则返回热门地点
        if (historyLocations.length < 3 || this.categoryInterests.size === 0) {
            return lruHistory.getPopularLocations(count);
        }

        // 已访问过的地点名称集合
        const visitedLocationNames = historyLocations.map(loc => loc.name);

        // 候选推荐地点 - 过滤掉已推荐过的
        const candidates = allLocations.filter(loc =>
            !this.recommendedLocations.has(loc.name) &&
            !visitedLocationNames.includes(loc.name)
        );

        // 如果没有足够的候选地点，重置推荐记录
        if (candidates.length < count) {
            this.resetRecommendedLocations();
        }

        // 为每个候选地点计算推荐分数
        const scoredLocations = candidates.map(location => ({
            ...location,
            recommendScore: this.calculateRecommendationScore(location, visitedLocationNames)
        }));

        // 按推荐分数排序
        scoredLocations.sort((a, b) => b.recommendScore - a.recommendScore);

        // 获取推荐结果
        const recommendations = scoredLocations.slice(0, count);

        // 记录已推荐的地点
        recommendations.forEach(loc => {
            this.recommendedLocations.add(loc.name);
        });

        return recommendations;
    }

    /**
     * 获取基于当前时间的地点推荐
     * @param {Array} allLocations - 所有可推荐的地点
     * @param {Number} count - 推荐数量
     * @returns {Array} 推荐地点数组
     */
    getTimeBasedRecommendations(allLocations, count = 3) {
        const currentPeriod = this.getCurrentTimePeriod();
        const preferredCategories = this.timeBasedWeights[currentPeriod] || [];

        // 根据当前时间段筛选合适的地点
        const matchingLocations = allLocations.filter(loc =>
            loc.category && preferredCategories.includes(loc.category)
        );

        // 随机选择推荐地点，避免每次都推荐相同的地点
        return this.getRandomSample(matchingLocations, count);
    }

    /**
     * 从数组中随机取样
     * @param {Array} array - 输入数组
     * @param {Number} count - 取样数量
     * @returns {Array} 取样结果
     */
    getRandomSample(array, count) {
        const sample = [];
        const arrayCopy = [...array];

        // 取样数量不能超过数组长度
        count = Math.min(count, arrayCopy.length);

        // 随机取样
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * arrayCopy.length);
            sample.push(arrayCopy[randomIndex]);
            arrayCopy.splice(randomIndex, 1);
        }

        return sample;
    }
}

// 创建推荐系统实例
const recommendationSystem = new RecommendationSystem();

module.exports = {
    recommendationSystem,

    /**
     * 获取个性化推荐地点
     * @param {Array} allLocations - 所有可推荐的地点
     * @param {Array} historyLocations - 用户历史访问的地点
     * @param {Number} count - 推荐数量
     * @returns {Array} 推荐地点数组
     */
    getPersonalizedRecommendations(allLocations, historyLocations, count = 5) {
        return recommendationSystem.getRecommendedLocations(allLocations, historyLocations, count);
    },

    /**
     * 获取基于当前时间的地点推荐
     * @param {Array} allLocations - 所有可推荐的地点
     * @param {Number} count - 推荐数量
     * @returns {Array} 推荐地点数组
     */
    getTimeBasedRecommendations(allLocations, count = 3) {
        return recommendationSystem.getTimeBasedRecommendations(allLocations, count);
    },

    /**
     * 重置推荐状态
     */
    resetRecommendationState() {
        recommendationSystem.resetRecommendedLocations();
    }
};