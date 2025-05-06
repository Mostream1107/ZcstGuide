// app.js
const history = require('./data/history');
const lruHistory = require('./data/lru-history');

App({
    /**
     * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
     */
    onLaunch: function() {
        // 初始化历史记录管理器
        this.globalData.historyManager = new history.HistoryManager();
        this.globalData.historyManager.loadFromStorage();

        // 初始化路线历史记录管理器
        this.globalData.routeHistoryManager = new history.RouteHistoryManager();
        this.globalData.routeHistoryManager.loadFromStorage();

        // 初始化LRU历史记录缓存
        // lruHistory模块自带初始化功能，无需额外初始化
        this.globalData.lruHistoryCache = lruHistory.historyCache;
    },

    /**
     * 全局的初始数据
     */
    globalData: {
        userInfo: null,
        historyManager: null, // 历史记录管理器实例
        routeHistoryManager: null, // 路线历史记录管理器实例
        lruHistoryCache: null // LRU历史记录缓存实例
    }
})