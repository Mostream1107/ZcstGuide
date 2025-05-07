// pages/map/search/search.js
var map = require('../../../data/map')
var media = require('../../../data/media')
var searchIndex = require('../../../data/search-index') // 引入搜索索引模块

// 引入LRU历史记录管理模块
var lruHistory = require('../../../data/lru-history')

// 引入个性化推荐系统模块
var recommendation = require('../../../data/recommendation-system')

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

        // 热门地点相关
        showPopularLocations: true, // 默认显示热门地点
        popularLocations: [], // 热门地点列表

        // 个性化推荐相关
        showPersonalizedRecommendations: true, // 默认显示个性化推荐
        personalizedRecommendations: [], // 个性化推荐地点列表

        // 基于时间的推荐相关
        showTimeBasedRecommendations: true, // 默认显示基于时间的推荐
        timeBasedRecommendations: [], // 基于时间的推荐地点列表

        // 推荐系统相关
        currentTimePeriod: '', // 当前时间段
        timePeriodText: '', // 时间段中文描述
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

        // 加载热门地点
        this.loadPopularLocations()

        // 加载个性化推荐
        this.loadPersonalizedRecommendations()

        // 加载基于时间的推荐
        this.loadTimeBasedRecommendations()

        // 更新当前时间段
        this.updateTimePeriod()
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
        // 加载热门地点
        this.loadPopularLocations()

        // 加载个性化推荐
        this.loadPersonalizedRecommendations()

        // 加载基于时间的推荐
        this.loadTimeBasedRecommendations()
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
                end: data,
            });
        }
        wx.setStorageSync(search_id == 1 ? 'start' : 'end', data)
        wx.navigateBack({
            delta: 1
        })
    },

    remove() {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '确认清空全部搜索历史吗？',
            success(res) {
                if (res.confirm) {
                    wx.removeStorage({
                        key: 'historyStorage',
                        success(res) {
                            console.log('移除成功')
                            that.setData({
                                historyStorage: [],
                            })
                        }
                    })
                }
            }
        })
    },

    // 加载热门地点推荐
    loadPopularLocations() {
        try {
            // 获取热门地点列表（从LRU缓存中获取）
            const popularLocations = lruHistory.getPopularLocations(5);

            // 如果有热门地点，显示推荐区域
            if (popularLocations && popularLocations.length > 0) {
                this.setData({
                    popularLocations: popularLocations,
                    showPopularLocations: true
                });
            } else {
                this.setData({
                    showPopularLocations: false
                });
            }
        } catch (error) {
            console.error('加载热门地点失败:', error);
            this.setData({
                showPopularLocations: false
            });
        }
    },

    // 加载个性化推荐地点
    loadPersonalizedRecommendations() {
        try {
            // 获取历史记录
            const historyList = lruHistory.getHistoryList();

            // 获取所有地点数据
            const allLocations = this.getAllLocationData();

            // 获取个性化推荐
            const personalizedRecommendations = recommendation.getPersonalizedRecommendations(allLocations, historyList, 3);

            // 如果有推荐结果，显示推荐区域
            if (personalizedRecommendations && personalizedRecommendations.length > 0) {
                this.setData({
                    personalizedRecommendations: personalizedRecommendations,
                    showPersonalizedRecommendations: true
                });
            } else {
                this.setData({
                    showPersonalizedRecommendations: false
                });
            }
        } catch (error) {
            console.error('加载个性化推荐失败:', error);
            this.setData({
                showPersonalizedRecommendations: false
            });
        }
    },

    // 加载基于时间的推荐地点
    loadTimeBasedRecommendations() {
        try {
            // 获取所有地点数据
            const allLocations = this.getAllLocationData();

            // 获取基于时间的推荐
            const timeBasedRecommendations = recommendation.getTimeBasedRecommendations(allLocations, 3);

            // 如果有推荐结果，显示推荐区域
            if (timeBasedRecommendations && timeBasedRecommendations.length > 0) {
                this.setData({
                    timeBasedRecommendations: timeBasedRecommendations,
                    showTimeBasedRecommendations: true
                });
            } else {
                this.setData({
                    showTimeBasedRecommendations: false
                });
            }
        } catch (error) {
            console.error('加载基于时间的推荐失败:', error);
            this.setData({
                showTimeBasedRecommendations: false
            });
        }
    },

    // 收集所有地点数据
    getAllLocationData() {
        const allLocations = [];

        // 遍历所有地点类别
        this.data.site_data.forEach(category => {
            if (category && category.list && Array.isArray(category.list)) {
                // 为每个地点添加类别信息
                const locationsWithCategory = category.list.map(loc => ({
                    ...loc,
                    category: category.name
                }));

                // 添加到总地点列表
                allLocations.push(...locationsWithCategory);
            }
        });

        return allLocations;
    },

    // 更新当前时间段及其文本描述
    updateTimePeriod() {
        const hour = new Date().getHours();
        let period = '';
        let text = '';

        if (hour >= 6 && hour < 9) {
            period = 'morning';
            text = '早上好！开始新的一天';
        } else if (hour >= 9 && hour < 14) {
            period = 'noon';
            text = '中午好！该吃午饭了';
        } else if (hour >= 14 && hour < 18) {
            period = 'afternoon';
            text = '下午好！学习工作加油';
        } else if (hour >= 18 && hour < 22) {
            period = 'evening';
            text = '晚上好！享受美好夜晚';
        } else {
            period = 'night';
            text = '夜深了，注意休息';
        }

        this.setData({
            currentTimePeriod: period,
            timePeriodText: text
        });
    },

    // 切换热门地点区域显示状态
    togglePopularLocations() {
        this.setData({
            showPopularLocations: !this.data.showPopularLocations
        });
    },

    // 切换个性化推荐区域显示状态
    togglePersonalizedRecommendations() {
        this.setData({
            showPersonalizedRecommendations: !this.data.showPersonalizedRecommendations
        });
    },

    // 切换基于时间的推荐区域显示状态
    toggleTimeBasedRecommendations() {
        this.setData({
            showTimeBasedRecommendations: !this.data.showTimeBasedRecommendations
        });
    },

    // 选择热门地点
    selectPopularLocation(e) {
        const location = e.currentTarget.dataset.location;
        if (location) {
            // 更新LRU缓存中的访问频率
            lruHistory.addToHistory(location);

            // 直接返回并设置为目标地点
            this.setSelectedLocation(location);
        }
    },

    // 选择个性化推荐地点
    selectPersonalizedRecommendation(e) {
        const location = e.currentTarget.dataset.location;
        if (location) {
            // 更新LRU缓存中的访问频率
            lruHistory.addToHistory(location);

            // 直接返回并设置为目标地点
            this.setSelectedLocation(location);
        }
    },

    // 选择基于时间的推荐地点
    selectTimeBasedRecommendation(e) {
        const location = e.currentTarget.dataset.location;
        if (location) {
            // 更新LRU缓存中的访问频率
            lruHistory.addToHistory(location);

            // 直接返回并设置为目标地点
            this.setSelectedLocation(location);
        }
    },

    // 设置选中的地点并返回
    setSelectedLocation(location) {
        const data = {
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude
        };

        let search_id = this.data.search_id;
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; // 上一个页面

        if (search_id == 1) {
            prevPage.setData({
                start: data,
            });
        } else {
            prevPage.setData({
                end: data,
            });
        }

        wx.setStorageSync(search_id == 1 ? 'start' : 'end', data);
        wx.navigateBack({
            delta: 1
        });
    },

    // 刷新推荐数据
    refreshRecommendations() {
        // 重置推荐状态
        recommendation.resetRecommendationState();

        // 重新加载各类推荐
        this.loadPersonalizedRecommendations();
        this.loadTimeBasedRecommendations();

        wx.showToast({
            title: '推荐已更新',
            icon: 'success',
            duration: 1500
        });
    }
})