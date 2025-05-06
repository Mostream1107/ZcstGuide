/**
 * 基于哈希表的搜索索引
 * 用于优化地点搜索功能
 */

const map = require('./map');

/**
 * 搜索索引类
 * 使用多种哈希表索引地点信息，支持精确匹配、别名查询和关键词搜索
 */
class SearchIndex {
    constructor() {
        // 精确匹配索引: 地点名称 -> 地点信息
        this.exactMatchIndex = new Map();

        // 别名索引: 别名 -> 地点信息数组
        this.aliasIndex = new Map();

        // 关键词索引: 关键词 -> 地点信息数组
        this.keywordIndex = new Map();

        // 拼音首字母索引：拼音首字母 -> 地点信息数组 (可以后续扩展)
        this.pinyinIndex = new Map();

        // 常见的别名映射: 如"四教" -> "第四教学楼"
        this.commonAliasMap = new Map([
            ["一教", "第一教学楼"],
            ["二教", "第二教学楼"],
            ["三教", "第三教学楼"],
            ["1教", "第一教学楼"],
            ["2教", "第二教学楼"],
            ["3教", "第三教学楼"],
            ["明德", "明德楼"],
            ["博文", "博文楼"],
            ["至善", "至善楼"],
            ["敏学", "敏学楼"],
            ["实验楼", "敏学楼"],
            ["图书馆", "图书馆借还区"],
            ["主图", "图书馆借还区"],
            ["东门", "东门"],
            ["正门", "东门"],
            ["北门", "北门"],
            ["后门", "北门"],
            ["宿舍楼", "公寓"],
            ["公寓楼", "公寓"],
            ["一食堂", "第一饭堂"],
            ["二食堂", "第二饭堂"],
            ["三食堂", "第三饭堂"],
            ["1饭堂", "第一饭堂"],
            ["2饭堂", "第二饭堂"],
            ["3饭堂", "第三饭堂"]
        ]);

        // 初始化索引
        this.buildIndex();
    }

    /**
     * 构建搜索索引
     * 从map.js中读取地点数据并建立索引
     */
    buildIndex() {
        const siteData = map.site_data;

        // 遍历所有类别和地点
        for (const category of siteData) {
            for (const location of category.list) {
                this.indexLocation(location, category.name);
            }
        }

        console.log(`搜索索引构建完成: ${this.exactMatchIndex.size} 个地点`);
    }

    /**
     * 为单个地点建立索引
     * @param {Object} location 地点信息
     * @param {String} categoryName 类别名称
     */
    indexLocation(location, categoryName) {
        // 为地点添加类别信息
        const locationWithCategory = {...location, category: categoryName };

        // 1. 精确匹配索引
        this.exactMatchIndex.set(location.name, locationWithCategory);

        // 2. 别名索引
        if (location.aliases) {
            // 处理多个别名（如果是以逗号或空格分隔的多个别名）
            const aliases = location.aliases.split(/[,，、\s]+/).filter(alias => alias.trim() !== '');

            for (const alias of aliases) {
                if (!this.aliasIndex.has(alias)) {
                    this.aliasIndex.set(alias, []);
                }
                this.aliasIndex.get(alias).push(locationWithCategory);
            }
        }

        // 3. 关键词索引（将地点名称和描述拆分为关键词）
        const nameKeywords = this.extractKeywords(location.name);
        const descKeywords = location.desc ? this.extractKeywords(location.desc) : [];
        const allKeywords = [...new Set([...nameKeywords, ...descKeywords])];

        for (const keyword of allKeywords) {
            if (keyword.length < 2) continue; // 忽略单字关键词，减少噪音

            if (!this.keywordIndex.has(keyword)) {
                this.keywordIndex.set(keyword, []);
            }
            this.keywordIndex.get(keyword).push(locationWithCategory);
        }
    }

    /**
     * 从文本中提取关键词
     * @param {String} text 文本内容
     * @returns {Array} 关键词数组
     */
    extractKeywords(text) {
        if (!text) return [];

        // 简单实现：按照常见分隔符分割文本
        // 实际应用中可以使用更复杂的分词算法
        return text.split(/[,，、\s\n]+/)
            .map(word => word.trim())
            .filter(word => word.length > 0);
    }

    /**
     * 搜索地点
     * @param {String} query 搜索关键词
     * @returns {Array} 匹配的地点信息数组
     */
    search(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        query = query.trim();
        const results = new Map(); // 使用Map去重

        // 1. 检查是否有常见别名映射
        const mappedQuery = this.commonAliasMap.get(query);
        if (mappedQuery) {
            query = mappedQuery; // 替换为标准名称
        }

        // 2. 精确匹配（优先级最高）
        if (this.exactMatchIndex.has(query)) {
            const location = this.exactMatchIndex.get(query);
            results.set(location.id, {...location, matchType: 'exact' });
        }

        // 3. 别名匹配（优先级次之）
        if (this.aliasIndex.has(query)) {
            for (const location of this.aliasIndex.get(query)) {
                if (!results.has(location.id)) {
                    results.set(location.id, {...location, matchType: 'alias' });
                }
            }
        }

        // 4. 部分匹配（名称或别名包含查询词）
        for (const [name, location] of this.exactMatchIndex.entries()) {
            if (name.includes(query) && !results.has(location.id)) {
                results.set(location.id, {...location, matchType: 'partial' });
            }
        }

        for (const [alias, locations] of this.aliasIndex.entries()) {
            if (alias.includes(query)) {
                for (const location of locations) {
                    if (!results.has(location.id)) {
                        results.set(location.id, {...location, matchType: 'partialAlias' });
                    }
                }
            }
        }

        // 5. 关键词匹配（最低优先级）
        const queryKeywords = this.extractKeywords(query);
        for (const keyword of queryKeywords) {
            if (keyword.length < 2) continue;

            if (this.keywordIndex.has(keyword)) {
                for (const location of this.keywordIndex.get(keyword)) {
                    if (!results.has(location.id)) {
                        results.set(location.id, {...location, matchType: 'keyword' });
                    }
                }
            }
        }

        // 将Map转为数组并按匹配类型排序
        return Array.from(results.values()).sort((a, b) => {
            // 按匹配类型排序
            const typeOrder = {
                'exact': 1,
                'alias': 2,
                'partial': 3,
                'partialAlias': 4,
                'keyword': 5
            };
            return typeOrder[a.matchType] - typeOrder[b.matchType];
        });
    }
}

// 创建搜索索引实例
const searchIndex = new SearchIndex();

module.exports = {
    searchIndex,
    // 提供搜索方法
    search: (query) => searchIndex.search(query)
};