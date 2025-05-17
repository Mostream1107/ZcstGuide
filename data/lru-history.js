/**
 * 基于LRU算法的历史记录管理模块
 * 利用Map的插入顺序特性实现LRU缓存
 * 增加访问频率统计和热门地点推荐功能
 */

/**
 * LRU历史记录缓存类
 * 基于Map数据结构实现，保持插入顺序，自动淘汰最久未使用的记录
 */
class LRUHistoryCache {
    constructor(capacity = 20) {
        this.capacity = capacity; // 缓存容量
        
        this.cache = new Map(); // 主缓存，保持插入顺序
        this.frequencyMap = new Map(); // 记录每个地点的访问频率
        this.locationDetails = new Map(); // 存储地点详细信息
        this.lastVisitTime = new Map(); // 记录上次访问时间
    }

    /**
     * 添加或更新缓存中的地点
     * @param {String} key - 地点的唯一标识符
     * @param {Object} locationData - 地点的详细信息
     * @param {Boolean} incrementFrequency - 是否增加访问频率计数，默认为true
     * @returns {Object} 添加的地点信息
     */
    put(key, locationData, incrementFrequency = true) {
        // 确保key存在
        if (!key) return null;

        // 如果缓存中已存在，先删除旧记录(Map会保持插入顺序)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        // 将新记录放入缓存顶部(Map会将新插入的项放在迭代顺序的末尾)
        this.cache.set(key, key);

        // 更新地点详细信息
        this.locationDetails.set(key, locationData || { name: key });

        // 更新访问频率（如果启用）
        if (incrementFrequency) {
            const currentFreq = this.frequencyMap.get(key) || 0;
            this.frequencyMap.set(key, currentFreq + 1);
        }

        // 更新最近访问时间
        this.lastVisitTime.set(key, Date.now());

        // 如果超出容量，删除最旧的项(迭代顺序中的第一个)
        if (this.cache.size > this.capacity) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            // 注意：我们保留了频率信息，这样即使被淘汰出LRU缓存，热门地点仍能被推荐
        }

        // 保存到本地存储
        this.saveToStorage();

        return locationData;
    }

    /**
     * 获取缓存中的地点，并将其移到最近使用位置
     * @param {String} key - 地点的唯一标识符
     * @param {Boolean} incrementFrequency - 是否增加访问频率计数，默认为true
     * @returns {Object} 地点信息，如果不存在则返回null
     */
    get(key, incrementFrequency = true) {
        if (!this.cache.has(key)) return null;

        // 从缓存中获取值
        const value = this.locationDetails.get(key);

        // 更新位置（删除后重新添加，使其成为最新项）
        this.cache.delete(key);
        this.cache.set(key, key);

        // 更新访问频率（如果启用）
        if (incrementFrequency) {
            const currentFreq = this.frequencyMap.get(key) || 0;
            this.frequencyMap.set(key, currentFreq + 1);
        }

        // 更新最近访问时间
        this.lastVisitTime.set(key, Date.now());

        // 保存到本地存储
        this.saveToStorage();

        return value;
    }

    /**
     * 获取所有历史记录，按最近使用顺序排序
     * @returns {Array} 历史记录数组
     */
    getAllHistory() {
        // 将Map转换为数组，并按照从新到旧的顺序排列
        const result = [];
        const nameSet = new Set(); // 用于去重的地点名称集合

        // 倒序遍历，保持最新访问的记录在前面
        Array.from(this.cache.keys()).reverse().forEach(key => {
            if (this.locationDetails.has(key)) {
                const locationData = this.locationDetails.get(key);

                // 去重：如果该地点名称已经存在，则跳过
                if (nameSet.has(locationData.name)) {
                    return;
                }

                // 添加地点名称到集合中用于去重
                nameSet.add(locationData.name);

                result.push({
                    ...locationData,
                    frequency: this.frequencyMap.get(key) || 0,
                    lastVisit: this.lastVisitTime.get(key) || 0
                });
            }
        });
        return result;
    }

    /**
     * 获取热门地点，按访问频率排序
     * @param {Number} count - 返回的热门地点数量
     * @returns {Array} 热门地点数组
     */
    getPopularLocations(count = 5) {
        // 实现去重
        const nameMap = new Map(); // 用于去重，保存每个地点名称对应的最高频率

        // 遍历所有频率数据
        Array.from(this.frequencyMap.entries())
            // 只包含仍在缓存中且有详细信息的地点
            .filter(([key]) => this.cache.has(key) && this.locationDetails.has(key))
            .forEach(([key, frequency]) => {
                const locationData = this.locationDetails.get(key);

                // 如果该名称的地点已存在，且当前频率更高，则更新
                if (!nameMap.has(locationData.name) || nameMap.get(locationData.name).frequency < frequency) {
                    nameMap.set(locationData.name, {
                        key,
                        frequency,
                        locationData
                    });
                }
            });

        // 将去重后的地点按频率排序
        return Array.from(nameMap.values())
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, count)
            .map(item => {
                return {
                    ...item.locationData,
                    frequency: item.frequency,
                    lastVisit: this.lastVisitTime.get(item.key) || 0
                };
            });
    }

    /**
     * 获取最近一周内访问的地点，按频率排序
     * @param {Number} count - 返回的地点数量
     * @returns {Array} 最近访问的地点数组
     */
    getRecentPopularLocations(count = 5) {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // 一周前的时间戳
        const nameMap = new Map(); // 用于去重

        // 筛选出最近一周访问过的地点
        Array.from(this.lastVisitTime.entries())
            .filter(([key, time]) => time > oneWeekAgo && this.cache.has(key) && this.locationDetails.has(key))
            .forEach(([key, time]) => {
                const frequency = this.frequencyMap.get(key) || 0;
                const locationData = this.locationDetails.get(key);

                // 如果该名称的地点已存在，根据频率和时间决定是否更新
                if (!nameMap.has(locationData.name)) {
                    nameMap.set(locationData.name, {
                        key,
                        frequency,
                        time,
                        locationData
                    });
                } else {
                    const existing = nameMap.get(locationData.name);

                    // 频率更高或频率相同但更近访问的优先
                    if (frequency > existing.frequency ||
                        (frequency === existing.frequency && time > existing.time)) {
                        nameMap.set(locationData.name, {
                            key,
                            frequency,
                            time,
                            locationData
                        });
                    }
                }
            });

        // 按频率排序，相同频率按时间排序
        return Array.from(nameMap.values())
            .sort((a, b) => {
                if (b.frequency !== a.frequency) return b.frequency - a.frequency;
                return b.time - a.time;
            })
            .slice(0, count)
            .map(item => {
                return {
                    ...item.locationData,
                    frequency: item.frequency,
                    lastVisit: item.time
                };
            });
    }

    /**
     * 清空历史记录
     */
    clear() {
        this.cache.clear();
        // 清空频率统计和访问时间
        this.frequencyMap.clear();
        this.lastVisitTime.clear();
        this.locationDetails.clear();
        this.saveToStorage();
    }

    /**
     * 获取缓存大小
     */
    size() {
        return this.cache.size;
    }

    /**
     * 将数据保存到本地存储
     */
    saveToStorage() {
        try {
            // 保存LRU缓存
            const cacheData = Array.from(this.cache.entries());
            wx.setStorageSync('lru_history_cache', cacheData);

            // 保存地点详情
            const detailsData = Array.from(this.locationDetails.entries());
            wx.setStorageSync('lru_location_details', detailsData);

            // 保存访问频率
            const frequencyData = Array.from(this.frequencyMap.entries());
            wx.setStorageSync('lru_frequency_map', frequencyData);

            // 保存访问时间
            const timeData = Array.from(this.lastVisitTime.entries());
            wx.setStorageSync('lru_visit_time', timeData);
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    }

    /**
     * 从本地存储加载数据
     */
    loadFromStorage() {
        try {
            // 加载LRU缓存
            const cacheData = wx.getStorageSync('lru_history_cache');
            if (cacheData && cacheData.length) {
                this.cache = new Map(cacheData);
            }

            // 加载地点详情
            const detailsData = wx.getStorageSync('lru_location_details');
            if (detailsData && detailsData.length) {
                this.locationDetails = new Map(detailsData);
            }

            // 加载访问频率
            const frequencyData = wx.getStorageSync('lru_frequency_map');
            if (frequencyData && frequencyData.length) {
                this.frequencyMap = new Map(frequencyData);
            }

            // 加载访问时间
            const timeData = wx.getStorageSync('lru_visit_time');
            if (timeData && timeData.length) {
                this.lastVisitTime = new Map(timeData);
            }

            // 数据清理：移除缓存中不存在的地点详情、频率和时间数据
            this.cleanStorageData();

            // 名称去重：确保相同名称的地点只保留一个
            this.removeDuplicateNames();
        } catch (e) {
            console.error('加载历史记录失败:', e);
        }
    }

    /**
     * 清理存储数据，移除不在缓存中的条目
     */
    cleanStorageData() {
        const validKeys = new Set(this.cache.keys());

        // 清理locationDetails中无效的键
        for (const key of this.locationDetails.keys()) {
            if (!validKeys.has(key)) {
                this.locationDetails.delete(key);
            }
        }

        // 清理frequencyMap中无效的键
        for (const key of this.frequencyMap.keys()) {
            if (!validKeys.has(key)) {
                this.frequencyMap.delete(key);
            }
        }

        // 清理lastVisitTime中无效的键
        for (const key of this.lastVisitTime.keys()) {
            if (!validKeys.has(key)) {
                this.lastVisitTime.delete(key);
            }
        }
    }

    /**
     * 移除重复的地点名称，仅保留访问频率最高的一个
     */
    removeDuplicateNames() {
        const nameMap = new Map(); // 名称 -> {key, frequency}

        // 查找重复的名称
        for (const key of this.cache.keys()) {
            const locationData = this.locationDetails.get(key);
            if (!locationData) continue;

            const name = locationData.name;
            const frequency = this.frequencyMap.get(key) || 0;

            if (!nameMap.has(name) || nameMap.get(name).frequency < frequency) {
                nameMap.set(name, { key, frequency });
            }
        }

        // 标记要删除的键
        const keysToDelete = new Set();
        for (const key of this.cache.keys()) {
            const locationData = this.locationDetails.get(key);
            if (!locationData) continue;

            const name = locationData.name;
            if (nameMap.get(name).key !== key) {
                keysToDelete.add(key);
            }
        }

        // 删除重复的键
        for (const key of keysToDelete) {
            this.cache.delete(key);
            this.locationDetails.delete(key);
            this.frequencyMap.delete(key);
            this.lastVisitTime.delete(key);
        }

        // 如果有删除操作，保存更新后的数据
        if (keysToDelete.size > 0) {
            console.log(`已移除${keysToDelete.size}个重复地点`);
            this.saveToStorage();
        }
    }
}

// 创建历史记录缓存实例
const historyCache = new LRUHistoryCache();

// 初始加载数据
historyCache.loadFromStorage();

// 检查缓存是否损坏，如果缓存中没有地点但有频率数据，则清空频率数据
if (historyCache.cache.size === 0 && historyCache.frequencyMap.size > 0) {
    console.log('检测到缓存状态异常，重置缓存');
    historyCache.frequencyMap.clear();
    historyCache.lastVisitTime.clear();
    historyCache.locationDetails.clear();
    historyCache.saveToStorage();
}

module.exports = {
    historyCache,

    /**
     * 添加地点到历史记录
     * @param {Object} location - 地点信息
     * @param {Boolean} incrementFrequency - 是否增加访问频率计数，默认为true
     */
    addToHistory(location, incrementFrequency = true) {
        if (!location || !location.name) return;

        // 首先尝试查找是否已存在同名地点
        const existingKey = this.findExistingLocationKey(location.name);
        if (existingKey) {
            // 存在同名地点，更新访问频率和时间
            console.log('地点已存在，更新访问频率：', location.name, '增加计数:', incrementFrequency);
            historyCache.get(existingKey, incrementFrequency);

            // 更新地点详情（可能有更新的信息）
            const existingLocation = historyCache.locationDetails.get(existingKey);
            const updatedLocation = {
                ...existingLocation,
                ...location,
                // 保留原有的频率
                frequency: historyCache.frequencyMap.get(existingKey) || 0,
                lastVisit: Date.now()
            };
            historyCache.locationDetails.set(existingKey, updatedLocation);
            return;
        }

        // 生成唯一标识符
        const key = location.id ||
            `${location.name}_${(location.latitude || 0).toFixed(6)}_${(location.longitude || 0).toFixed(6)}`;

        console.log('添加新的历史记录，key:', key, '增加计数:', incrementFrequency);
        historyCache.put(key, location, incrementFrequency);
    },

    /**
     * 查找是否存在同名地点
     * @param {String} name - 地点名称
     * @returns {String|null} 找到的键名或null
     */
    findExistingLocationKey(name) {
        if (!name) return null;

        // 从缓存中查找同名地点
        for (const [key, value] of historyCache.locationDetails.entries()) {
            if (value.name === name) {
                return key;
            }
        }

        return null;
    },

    /**
     * 获取历史记录列表
     * @returns {Array} 历史记录数组
     */
    getHistoryList() {
        return historyCache.getAllHistory();
    },

    /**
     * 获取热门地点列表
     * @param {Number} count - 返回的热门地点数量
     * @returns {Array} 热门地点数组
     */
    getPopularLocations(count = 5) {
        return historyCache.getPopularLocations(count);
    },

    /**
     * 获取最近热门地点列表
     * @param {Number} count - 返回的地点数量
     * @returns {Array} 最近热门地点数组
     */
    getRecentPopularLocations(count = 5) {
        return historyCache.getRecentPopularLocations(count);
    },

    /**
     * 清空历史记录
     */
    clearHistory() {
        historyCache.clear();
    }
};