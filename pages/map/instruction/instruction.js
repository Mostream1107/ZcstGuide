// pages/map/instruction/instruction.js
var media = require('../../../data/media')
var map = require('../../../data/map')
var lruHistory = require('../../../data/lru-history')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        map: "../" + media.map,
        // 默认地点
        default_point: map.default_point.name,

        // 调试信息
        showDebugInfo: true, // 是否显示调试信息
        expandDebugInfo: false, // 是否展开调试信息
        lruDebugInfo: { // LRU缓存调试信息
            capacity: 0,
            size: 0,
            popularLocations: []
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadLRUDebugInfo();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.loadLRUDebugInfo();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    /**
     * 用户点击右上角分享到朋友圈
     */
    onShareTimeline: function(res) {

    },

    // 跳转至地点汇总页
    tosite() {
        wx.switchTab({
            url: '../../site/site',
        })
    },

    // 跳转至地图页
    tomap() {
        wx.switchTab({
            url: '../../map/map',
        })
    },

    // 加载LRU缓存调试信息
    loadLRUDebugInfo() {
        try {
            const capacity = lruHistory.historyCache.capacity;
            const size = lruHistory.historyCache.size();
            const popularLocations = lruHistory.getPopularLocations(5);

            this.setData({
                'lruDebugInfo.capacity': capacity,
                'lruDebugInfo.size': size,
                'lruDebugInfo.popularLocations': popularLocations
            });
        } catch (error) {
            console.error('加载LRU调试信息失败:', error);
        }
    },

    // 切换调试信息显示状态
    toggleDebugInfo() {
        this.setData({
            expandDebugInfo: !this.data.expandDebugInfo
        });
    },

    // 清空LRU缓存
    clearLRUCache() {
        try {
            lruHistory.clearHistory();
            wx.showToast({
                title: 'LRU缓存已清空',
                icon: 'success'
            });

            // 重新加载调试信息
            this.loadLRUDebugInfo();
        } catch (error) {
            console.error('清空LRU缓存失败:', error);
            wx.showToast({
                title: '操作失败',
                icon: 'error'
            });
        }
    }
})