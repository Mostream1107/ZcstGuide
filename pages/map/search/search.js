// pages/map/search/search.js
var map = require('../../../data/map')
var media = require('../../../data/media')
var searchIndex = require('../../../data/search-index') // 引入搜索索引模块

Page({

    /**
     * 页面的初始数据
     */
    data: {
        content: null,
        search_id: 0,
        site_data: map.site_data,
        // result: [],
        historyStorage: [], //历史搜索缓存

        historyStorageShow: false,

        //图标
        delete: media.delete,
        searchIcon: media.searchIcon,
        history: media.history,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options.id)
        this.setData({
            search_id: options.id
        })

        // 历史搜索
        let that = this;
        //that.searchtype = options.searchtype;
        wx.getStorage({
            key: 'historyStorage',
            success: function(res) {
                //console.log(res.data)
                that.setData({
                    historyStorageShow: true,
                    historyStorage: res.data
                })
            }
        })
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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    // 获取输入框的内容
    getContent(e) {
        this.setData({
            content: e.detail.value
        })
    },

    //保存历史搜索
    saveHistory() {
        var content = this.data.content
        var historyStorage = this.data.historyStorage
            // 判断历史记录是否超过10条
        if (historyStorage.length < 10) {
            // 判断历史记录中有没有搜索过的词条
            if (!historyStorage.includes(content)) {
                historyStorage.unshift(content); //未存在
            } else { //已存在
                let i = historyStorage.indexOf(content);
                historyStorage.splice(i, 1)
                historyStorage.unshift(content);
            }
        } else {
            // 判断历史记录中有没有搜索过的词条
            if (!historyStorage.includes(content)) {
                historyStorage.splice(9, 1) //删除最早的一个元素
                historyStorage.unshift(content); //未存在  
            }
            //有搜索记录，删除之前的旧记录，将新搜索值重新push到数组首位
            else { //已存在
                let i = historyStorage.indexOf(content);
                historyStorage.splice(i, 1)
                historyStorage.unshift(content);
            }
        }

        //储存搜索记录
        wx: wx.setStorage({
            key: 'historyStorage',
            data: historyStorage
        })
    },

    // 搜索
    goSearch() {
        console.log(this.data.content)
        var content = this.data.content
        var historyStorage = this.data.historyStorage

        if (content != "" && content != null) {
            this.saveHistory()
        }

        //加载搜索历史
        let that = this;
        wx.getStorage({
            key: 'historyStorage',
            success: function(res) {
                //console.log(res.data)
                that.setData({
                    historyStorageShow: true,
                    historyStorage: res.data
                })
            }
        })

        if (content) {
            // 使用哈希表搜索索引进行搜索
            const searchResults = searchIndex.search(content);

            if (searchResults && searchResults.length > 0) {
                this.setData({
                    result: searchResults
                });
            } else {
                // 如果哈希表搜索没有结果，尝试使用原始搜索方法作为备选
                var site_data = this.data.site_data;
                var result = [];

                for (let i = 0; i < site_data.length; i++) {
                    for (let j = 0; j < site_data[i].list.length; j++) {
                        var data = site_data[i].list[j]
                        if (data.name.match(content) || data.aliases.match(content)) {
                            result.push(data)
                        }
                    }
                }

                this.setData({
                    result: result
                });

                if (result.length == 0) {
                    wx.showToast({
                        icon: 'none',
                        title: '未找到结果',
                    });
                }
            }
        } else {
            wx.showToast({
                icon: 'error',
                title: '请输入内容',
            });
        }
    },

    //通过历史记录搜素
    goHistorySearch(e) {
        var contents = e.currentTarget.dataset.postname
            // console.log(contents)
        this.setData({
            content: contents
        })

        this.goSearch()
    },

    // 返回地图页并通过缓存传递参数
    tapback(e) {
        console.log(e)
        var data = e.currentTarget.dataset
        let search_id = this.data.search_id
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; // 上一个页面
        if (search_id == 1) {
            // 直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
            prevPage.setData({
                start: data,
            });
        } else {
            prevPage.setData({
                end: data
            });
        }
        wx.navigateBack({})
    },

    // 清除搜索历史记录
    remove: function() {
        var _this = this
        wx.showModal({
            content: '确认清除所有历史记录?',
            success: function(res) {
                if (res.confirm) {
                    wx: wx.removeStorage({
                        key: 'historyStorage',
                        success: function(res) {
                            _this.setData({
                                historyStorage: []
                            })
                            wx.setStorageSync("historyStorage", [])
                        },
                    })
                }
                else {
                    console.log("点击取消")
                }
            },
        })
    }
})