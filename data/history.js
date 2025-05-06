/**
 * 历史记录管理类 - 基于有限队列数据结构实现
 * 用于记录用户访问的地点历史，保留最近的N条记录
 */
module.exports = {
    /**
     * 历史记录管理器，最大容量为10条记录
     * 采用有限队列结构：最新访问的地点在队列头部（数组头部），最旧的在队列尾部（数组尾部）
     */
    HistoryManager: class {
        constructor(maxSize = 10) {
            this.historyQueue = []; // 固定容量队列存储历史记录
            this.maxSize = maxSize; // 最大记录数量
        }

        /**
         * 添加一个地点到历史记录队列
         * @param {Object} location 地点信息对象，包含id、name、latitude、longitude等属性
         */
        addToHistory(location) {
            // 如果是空地点或缺少必要信息，不记录
            if (!location || !location.name || !location.latitude || !location.longitude) {
                return;
            }

            // 为地点添加唯一标识（如果没有id）
            const locationId = location.id || `${location.name}_${location.latitude}_${location.longitude}`;

            // 检查地点是否已在历史记录中 - 通过名称匹配即可
            const existingIndex = this.historyQueue.findIndex(item => item.name === location.name);

            // 如果已存在，先移除旧记录
            if (existingIndex !== -1) {
                this.historyQueue.splice(existingIndex, 1);
            }

            // 将地点信息对象添加到队列头部（数组头部）
            const historyItem = {
                id: locationId,
                name: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date().getTime(), // 记录访问时间
                // 可以添加其他需要记录的信息
                category: location.category || '',
                alias: location.aliases || '',
                desc: location.desc || ''
            };

            this.historyQueue.unshift(historyItem);

            // 如果超过最大容量，移除最旧的记录（队列尾部/数组尾部）
            if (this.historyQueue.length > this.maxSize) {
                this.historyQueue.pop();
            }

            // 将更新后的历史记录保存到本地存储
            this.saveToStorage();
        }

        /**
         * 获取全部历史记录
         * @returns {Array} 历史记录数组，按访问时间从新到旧排序
         */
        getAllHistory() {
            return this.historyQueue;
        }

        /**
         * 获取最近的n条历史记录
         * @param {Number} count 需要获取的记录数量
         * @returns {Array} 最近的n条历史记录
         */
        getRecentHistory(count = 5) {
            return this.historyQueue.slice(0, Math.min(count, this.historyQueue.length));
        }

        /**
         * 清空历史记录
         */
        clearHistory() {
            this.historyQueue = [];
            this.saveToStorage();
        }

        /**
         * 移除特定的历史记录
         * @param {String} locationId 要删除的地点ID
         */
        removeFromHistory(locationId) {
            const index = this.historyQueue.findIndex(item => item.id === locationId);
            if (index !== -1) {
                this.historyQueue.splice(index, 1);
                this.saveToStorage();
            }
        }

        /**
         * 将历史记录保存到本地存储
         */
        saveToStorage() {
            wx.setStorageSync('location_history', this.historyQueue);
        }

        /**
         * 从本地存储加载历史记录
         */
        loadFromStorage() {
            const history = wx.getStorageSync('location_history');
            if (history) {
                this.historyQueue = history;
            }
        }
    },

    /**
     * 路线历史记录管理器，记录起点和终点对
     * 采用有限队列结构存储最近的导航路线历史，保留最近的N条记录
     */
    RouteHistoryManager: class {
        constructor(maxSize = 10) {
            this.routeQueue = []; // 固定容量队列存储路线历史记录
            this.maxSize = maxSize; // 最大记录数量
        }

        /**
         * 添加一个导航路线到历史记录
         * @param {Object} start 起点信息对象，包含name、latitude、longitude等属性
         * @param {Object} end 终点信息对象，包含name、latitude、longitude等属性
         */
        addRouteToHistory(start, end) {
            // 如果起点或终点缺少必要信息，不记录
            if (!start || !end || !start.name || !end.name ||
                !start.latitude || !start.longitude ||
                !end.latitude || !end.longitude) {
                return;
            }

            // 为路线添加唯一标识
            const routeId = `${start.name}_${end.name}_${new Date().getTime()}`;

            // 检查相同路线是否已存在
            const existingIndex = this.routeQueue.findIndex(item =>
                item.start.name === start.name &&
                item.end.name === end.name &&
                item.start.latitude === start.latitude &&
                item.start.longitude === start.longitude &&
                item.end.latitude === end.latitude &&
                item.end.longitude === end.longitude
            );

            // 如果已存在，先移除旧记录
            if (existingIndex !== -1) {
                this.routeQueue.splice(existingIndex, 1);
            }

            // 将路线信息添加到队列头部（数组头部）
            const routeItem = {
                id: routeId,
                start: {
                    name: start.name,
                    latitude: start.latitude,
                    longitude: start.longitude,
                    category: start.category || ''
                },
                end: {
                    name: end.name,
                    latitude: end.latitude,
                    longitude: end.longitude,
                    category: end.category || ''
                },
                timestamp: new Date().getTime(), // 记录导航时间
                isRoute: true // 标记为路线记录
            };

            this.routeQueue.unshift(routeItem);

            // 如果超过最大容量，移除最旧的记录（队列尾部/数组尾部）
            if (this.routeQueue.length > this.maxSize) {
                this.routeQueue.pop();
            }

            // 将更新后的历史记录保存到本地存储
            this.saveToStorage();
        }

        /**
         * 获取全部路线历史记录
         * @returns {Array} 路线历史记录数组，按导航时间从新到旧排序
         */
        getAllRoutes() {
            return this.routeQueue;
        }

        /**
         * 获取最近的n条路线记录
         * @param {Number} count 需要获取的记录数量
         * @returns {Array} 最近的n条路线记录
         */
        getRecentRoutes(count = 5) {
            return this.routeQueue.slice(0, Math.min(count, this.routeQueue.length));
        }

        /**
         * 清空路线历史记录
         */
        clearRouteHistory() {
            this.routeQueue = [];
            this.saveToStorage();
        }

        /**
         * 将路线历史记录保存到本地存储
         */
        saveToStorage() {
            wx.setStorageSync('route_history', this.routeQueue);
        }

        /**
         * 从本地存储加载路线历史记录
         */
        loadFromStorage() {
            const history = wx.getStorageSync('route_history');
            if (history) {
                this.routeQueue = history;
            }
        }
    }
};