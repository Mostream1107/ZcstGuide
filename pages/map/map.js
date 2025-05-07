// pages/map/map.js
var map = require('../../data/map')
var media = require('../../data/media')
const app = getApp()

// 引入LRU历史记录管理模块
var lruHistory = require('../../data/lru-history')

// 引入个性化推荐系统模块
var recommendation = require('../../data/recommendation-system')

// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min')

// 实例化API核心类
var qqmapsdk = new QQMapWX({
    key: map.mapKey // 必填
});

Page({

    /**
     * 页面的初始数据
     */
    data: {
        scrollLeft: 0,

        category: 1,
        site: 0,

        // 图片
        location: media.location,
        use: media.use,
        restore: media.restore,

        exchange: media.exchange,
        map_bottom: media.map_bottom,


        // 自定义图层、地图、学校 边界
        groundoverlay: map.groundoverlay,
        boundary: map.boundary,
        school_boundary: map.school_boundary,

        // 默认地点
        default_point: map.default_point,

        // 地点数据
        site_data: map.site_data,

        // 地图相关属性
        latitude: map.latitude,
        longitude: map.longitude,
        scale: map.scale,
        minscale: map.minscale,
        showLocation: map.showLocation,
        enablepoi: map.enablepoi,
        markers: [],
        polyline: [],
        // 闭合多边形
        // polygons: [{
        //   points: [],
        //   fillColor: "#d5dff233",
        //   strokeColor: "#789cff",
        //   strokeWidth: 2,
        //   zIndex: 1
        // }],
        points: map.points ? map.points : [],

        mylocationmarker: "",

        duration: 0,
        distance: 0,
        steps: [],

        card: "",

        // 起点、终点的坐标和名称
        start: {
            name: "",
            latitude: "",
            longitude: "",
        },
        end: {
            name: "",
            latitude: "",
            longitude: "",
        },

        // dialog会话框属性
        dialogShow_site: false,
        dialogShow_category: false,
        dialogShow_road: false,
        dialogShow_history: false, // 历史记录对话框
        buttons: [{
            text: '设为起点'
        }, {
            text: '设为终点'
        }],
        button: [{
            text: '关闭'
        }],
        historyButtons: [{
            text: '清空历史'
        }, {
            text: '关闭'
        }],

        static: {
            currentTarget: {
                id: 0,
            }
        },
        isAtSchool: false,

        // 历史记录相关
        historyList: [], // 地点历史记录列表
        routeHistoryList: [], // 路线历史记录列表
        activeHistoryTab: 'locations', // 当前激活的历史记录标签页('locations'或'routes')

        // 热门地点推荐相关
        showPopularLocations: false, // 是否显示热门地点推荐
        popularLocations: [], // 热门地点列表

        // 个性化推荐相关
        showPersonalizedRecommendations: false, // 是否显示个性化推荐
        personalizedRecommendations: [], // 个性化推荐地点列表

        // 基于时间的推荐相关
        showTimeBasedRecommendations: false, // 是否显示基于时间的推荐
        timeBasedRecommendations: [], // 基于时间的推荐地点列表

        // 推荐系统相关
        currentTimePeriod: '', // 当前时间段
        timePeriodText: '', // 时间段中文描述
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let map_bottom = this.data.map_bottom
        if (map_bottom == null || map_bottom == '') {
            let polygons = [{
                points: this.data.points,
                fillColor: "#d5dff233",
                strokeColor: "#789cff",
                strokeWidth: 2,
                zIndex: 1
            }]
            this.setData({
                polygons: polygons,
            })
        }

        this.map()
        this.location()

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
        const get_start = wx.getStorageSync('start')
        const get_end = wx.getStorageSync('end')
        console.log("get_start", get_start)
        console.log("get_end", get_end)
        if (get_start) {
            var start = {
                name: get_start.name,
                latitude: get_start.latitude,
                longitude: get_start.longitude,
            }
            this.setData({
                start: start
            })
            wx.clearStorageSync()
        }
        if (get_end) {
            var end = {
                name: get_end.name,
                latitude: get_end.latitude,
                longitude: get_end.longitude,
            }
            this.setData({
                end: end
            })
            wx.clearStorageSync()
        }

        // 加载历史记录
        this.loadHistoryList();

        // 更新热门地点
        this.loadPopularLocations();

        // 更新个性化推荐
        this.loadPersonalizedRecommendations();

        // 更新基于时间的推荐
        this.loadTimeBasedRecommendations();

        // 更新当前时间段
        this.updateTimePeriod();
    },

    // 加载历史记录
    loadHistoryList() {
        // 加载地点历史
        const historyManager = app.globalData.historyManager;
        if (historyManager) {
            const historyList = historyManager.getAllHistory();

            // 确保LRU缓存和普通历史记录的同步
            this.syncHistoryWithLRU(historyList);

            this.setData({
                historyList: historyList
            });
        }

        // 加载路线历史
        const routeHistoryManager = app.globalData.routeHistoryManager;
        if (routeHistoryManager) {
            const routeHistoryList = routeHistoryManager.getAllRoutes();
            this.setData({
                routeHistoryList: routeHistoryList
            });
        }
    },

    // 同步普通历史记录与LRU缓存
    syncHistoryWithLRU(historyList) {
        if (!historyList || historyList.length === 0) return;

        // 将普通历史记录中的项目也添加到LRU缓存中，但不增加频率计数
        for (const item of historyList) {
            if (item && item.name) {
                lruHistory.addToHistory(item, false);
            }
        }
    },

    // 显示历史记录对话框
    showHistory() {
        this.loadHistoryList();
        this.setData({
            dialogShow_history: true,
            activeHistoryTab: 'locations' // 默认显示地点历史标签页
        });
    },

    // 切换历史记录标签页
    switchHistoryTab(e) {
        const tab = e.currentTarget.dataset.tab;
        this.setData({
            activeHistoryTab: tab
        });
    },

    // 处理历史记录对话框按钮点击
    handleHistoryDialog(e) {
        const index = e.detail.index;
        if (index === 0) {
            // 清空历史
            if (this.data.activeHistoryTab === 'locations') {
                // 清空地点历史（同时清空LRU缓存和普通历史记录）
                lruHistory.clearHistory();
                app.globalData.historyManager.clearHistory();
                this.setData({
                    historyList: [],
                    popularLocations: [],
                    showPopularLocations: false
                });

                // 保存修改后的状态
                wx.setStorageSync('lru_history_cache', []);
                wx.setStorageSync('lru_location_details', []);
                wx.setStorageSync('lru_frequency_map', []);
                wx.setStorageSync('lru_visit_time', []);
                wx.setStorageSync('location_history', []);

                wx.showToast({
                    title: '地点历史已清空',
                    icon: 'success'
                });
            } else {
                // 清空路线历史
                app.globalData.routeHistoryManager.clearRouteHistory();
                this.setData({
                    routeHistoryList: []
                });

                // 保存修改后的状态
                wx.setStorageSync('route_history', []);

                wx.showToast({
                    title: '路线历史已清空',
                    icon: 'success'
                });
            }
            // 保持对话框打开状态
            this.setData({
                dialogShow_history: true
            });
        } else {
            // 关闭对话框
            this.setData({
                dialogShow_history: false
            });
        }
    },

    // 从历史记录中选择地点
    selectHistoryItem(e) {
        const index = e.currentTarget.dataset.index;
        const item = this.data.historyList[index];

        // 显示地点卡片
        this.setData({
            dialogShow_history: false,
            dialogShow_site: true,
            card: item
        });
    },

    // 从历史记录中选择路线
    selectRouteHistoryItem(e) {
        const index = e.currentTarget.dataset.index;
        const routeItem = this.data.routeHistoryList[index];

        // 设置起点和终点，然后关闭对话框
        this.setData({
            dialogShow_history: false,
            start: routeItem.start,
            end: routeItem.end
        });

        // 自动计算并显示路线
        this.processNavigation(routeItem.start, routeItem.end);

        wx.showToast({
            title: '已重新加载路线',
            icon: 'success'
        });
    },

    // 初始化地图
    map() {
        var that = this
        this.mapCtx = wx.createMapContext('map')
        this.mapCtx.addGroundOverlay({
            id: 0,
            src: that.data.map_bottom,
            bounds: {
                southwest: { //西南角
                    latitude: this.data.groundoverlay.southwest_latitude,
                    longitude: this.data.groundoverlay.southwest_longitude,
                },
                northeast: { //东北角
                    latitude: this.data.groundoverlay.northeast_latitude,
                    longitude: this.data.groundoverlay.northeast_longitude,
                }
            },
            opacity: this.data.groundoverlay.opacity, //图层透明度
            success(res) {
                // console.log('wp', res)
            },
            fail(err) {
                // console.log('err', err)
            }
        })
        this.mapCtx.setBoundary({
            southwest: { //西南角
                latitude: this.data.boundary.southwest_latitude,
                longitude: this.data.boundary.southwest_longitude,
            },
            northeast: { //东北角
                latitude: this.data.boundary.northeast_latitude,
                longitude: this.data.boundary.northeast_longitude,
            }
        })
        this.mapCtx.initMarkerCluster({
            enableDefaultStyle: true, //启用默认的聚合样式
            zoomOnClick: false, //点击已经聚合的标记点时是否实现聚合分离，点击后，标记点出现在屏幕边缘
            gridSize: 30, //聚合算法的可聚合距离
            complete(res) {
                // console.log('initMarkerCluster', res)
            }
        })
    },

    // 定位
    location() {
        var that = this
        var school_boundary = this.data.school_boundary
        var default_point = that.data.default_point
        var static_category = this.data.static
        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                var nowlatitude = res.latitude
                var nowlongitude = res.longitude
                console.log("当前位置坐标", nowlatitude, nowlongitude)
                if (nowlatitude > school_boundary.south && nowlatitude < school_boundary.north && nowlongitude > school_boundary.west && nowlongitude < school_boundary.east) {
                    that.setData({
                        isAtSchool: true
                    })

                    let point = {
                        name: "当前位置",
                        latitude: nowlatitude,
                        longitude: nowlongitude,
                    }
                    that.set_default_point(point)
                } else {
                    that.setData({
                        isAtSchool: false
                    })

                    that.set_default_point(default_point)
                    wx.showToast({
                        title: '当前位置不在校区内\n默认位置设为' + that.data.default_point.name,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail: function(err) {
                that.setData({
                    isAtSchool: false
                })

                that.set_default_point(default_point)
                wx.showToast({
                    title: '请不要频繁定位\n5秒后再试试吧',
                    icon: 'none',
                    duration: 2000
                })
            },
            complete: function(err) {
                that.changeCategory(static_category)
            }
        })
    },

    set_default_point(default_point) {
        this.setData({
            mylocationmarker: {
                id: 0,
                // iconPath: "",
                latitude: default_point.latitude,
                longitude: default_point.longitude,
                width: 25,
                height: 37,
                callout: {
                    content: " " + default_point.name + " ",
                    display: 'ALWAYS',
                    padding: 5,
                    borderRadius: 10
                },
                joinCluster: true,
            },
            start: {
                name: default_point.name,
                latitude: default_point.latitude,
                longitude: default_point.longitude,
            }
        })
    },

    // 交换起点与终点
    exchange() {
        if (this.data.end.name != "") {
            let start = this.data.start
            let end = this.data.end
            if (start.latitude == end.latitude && start.longitude == end.longitude) {
                wx.showToast({
                    title: '起点和终点不能相同',
                    icon: 'none',
                    duration: 2000
                })
            } else {
                this.setData({
                    end: start,
                    start: end
                })
                this.formSubmit()
            }
        } else {
            wx.showToast({
                title: '请选择终点！',
                icon: 'none',
                duration: 2000
            })
        }
    },

    // 点击地图标记点时触发事件
    markertap(e) {
        if (this.data.polyline.length == 0) {
            // console.log(e.markerId)
            if (e.markerId == 0) {
                var site = this.data.default_point
            } else {
                var site = this.data.site_data[this.data.category].list[e.markerId - 1]
            }
            this.setData({
                dialogShow_site: true,
                card: site,
            })

            // 添加到历史记录
            if (site && site.name && site !== this.data.default_point) {
                // 添加地点类别信息
                site.category = this.data.site_data[this.data.category].name;

                // 使用LRU历史记录管理模块记录访问 - 增加频率计数
                lruHistory.addToHistory(site, true);

                // 同时使用原始历史记录管理器 - 不增加频率计数
                const historyManager = app.globalData.historyManager;
                if (historyManager) {
                    historyManager.addToHistory(site);
                }

                // 更新热门地点推荐和历史记录列表
                this.loadPopularLocations();
                this.loadHistoryList();
            }
        }
    },

    // 底部按钮（路线详情和地点类型）
    clickButton() {
        if (this.data.polyline.length == 0) {
            this.setData({
                dialogShow_category: true
            })
        } else {
            this.setData({
                dialogShow_road: true
            })
        }
    },

    // mpdialog "关闭" 按钮点击事件
    mapmarker_close() {
        this.setData({
            dialogShow_category: false,
            dialogShow_road: false,
        })
    },

    // 预览图片
    lookPhoto(e) {
        console.log("点击了图片", e.target.dataset.src)
        var url = e.target.dataset.src
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: [url] // 需要预览的图片http链接列表
        })
    },

    // mpdialog "设为起点"和"设为终点" 按钮点击事件
    mapmarker_choose(e) {
        this.setData({
            dialogShow_site: false,
        })
        var choose = e.detail.item.text
        var card = {
            name: this.data.card.name,
            latitude: this.data.card.latitude,
            longitude: this.data.card.longitude,
        }
        console.log("选择地点", card)
        if (choose == "设为起点") {
            this.setData({
                start: card
            })
        } else {
            this.setData({
                end: card,
            })

            // 设为终点时，将地点添加到历史记录
            if (card && card.name) {
                // 尝试获取地点的更多信息
                const categoryInfo = this.getCategoryInfoForLocation(card);
                if (categoryInfo) {
                    card.category = categoryInfo.categoryName;
                    if (categoryInfo.siteInfo) {
                        card.aliases = categoryInfo.siteInfo.aliases;
                        card.desc = categoryInfo.siteInfo.desc;
                    }
                }

                // 使用LRU历史记录管理模块记录访问 - 不增加频率计数，避免重复计数
                // 因为在processNavigation方法中会再次记录终点
                lruHistory.addToHistory(card, false);

                // 同时使用原始历史记录管理器 - 不增加频率计数
                const historyManager = app.globalData.historyManager;
                if (historyManager) {
                    historyManager.addToHistory(card);
                }

                // 更新热门地点推荐和历史记录列表
                this.loadPopularLocations();
                this.loadHistoryList();
            }
        }
    },

    // 获取地点所属的类别信息
    getCategoryInfoForLocation(location) {
        if (!location || !location.name) return null;

        for (let i = 0; i < this.data.site_data.length; i++) {
            const category = this.data.site_data[i];
            for (let j = 0; j < category.list.length; j++) {
                const site = category.list[j];
                if (site.name === location.name &&
                    site.latitude === location.latitude &&
                    site.longitude === location.longitude) {
                    return {
                        categoryId: category.id,
                        categoryName: category.name,
                        siteInfo: site
                    };
                }
            }
        }
        return null;
    },

    // 切换地点类型
    changeCategory(e) {
        console.log("地点类型", e.currentTarget.id)
        var category = e.currentTarget.id
        let scrollLeft = (category - 1) * 60
        this.setData({
            scrollLeft: scrollLeft,
            category: e.currentTarget.id,
            polyline: []
        })

        let site_list = this.data.site_data[this.data.category].list
        console.log("当前地点类型", site_list)
        let markers = []
            // 不在学校且当前地点类型下存在默认地点
        let judege = site_list.some((item) => item._id == this.data.default_point._id)
        if (!this.data.isAtSchool && !judege) {
            markers.push(this.data.mylocationmarker)
        }
        for (let i = 0; i < site_list.length; i++) {
            let la = site_list[i].latitude
            let lo = site_list[i].longitude
            let name = site_list[i].name
            let m = {
                id: i + 1,
                latitude: la,
                longitude: lo,
                iconPath: "https://3gimg.qq.com/lightmap/xcx/demoCenter/images/Marker3_Activated@3x.png",
                width: 30,
                height: 30,
                callout: {
                    content: " " + name + " ",
                    display: 'ALWAYS',
                    padding: 5,
                    borderRadius: 10
                },
                joinCluster: true,
            }
            markers.push(m)
        }
        console.log("当前marker点", markers)
        this.setData({
            markers: markers
        })
        this.includePoints(markers)
    },

    // 缩放视野以包含所有给定的坐标点
    includePoints(markers) {
        this.mapCtx = wx.createMapContext('map')
        this.mapCtx.includePoints({
            padding: [100, 60, 60, 60],
            points: markers,
        })
    },

    // "还原" 按钮
    restore() {
        let e = {
            currentTarget: {
                id: this.data.category
            }
        }
        this.changeCategory(e)
    },

    // 跳转至搜索页
    tosearch(e) {
        wx.navigateTo({
            url: '../map/search/search?id=' + e.currentTarget.dataset.search_id,
        })
    },

    // 跳转至使用说明页
    toinstruction() {
        wx.navigateTo({
            url: '../../pages/map/instruction/instruction',
        })
    },

    // 触发表单提交事件，调用接口
    formSubmit() {
        var _this = this;

        if (this.data.end.name != "") {
            let start = this.data.start
            let end = this.data.end
            if (start.latitude == end.latitude && start.longitude == end.longitude) {
                wx.showToast({
                    title: '起点和终点不能相同',
                    icon: 'none',
                    duration: 2000
                })
            } else {
                // 获取当前时间
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const currentTime = hours * 60 + minutes; // 转换为分钟计数

                // 检查是否需要显示提醒
                let showReminder = false;
                let reminderTitle = '';
                let reminderContent = '';

                // 检查目的地类型
                const endName = end.name;
                const endCategory = _this.getLocationCategory(endName);

                // 根据不同地点类型和时间段显示不同提醒
                switch (endCategory) {
                    case 'dormitory': // 宿舍公寓
                        if (currentTime >= 23 * 60 + 30 || currentTime < 6 * 60) {
                            showReminder = true;
                            reminderTitle = '门禁提醒';
                            reminderContent = '当前为宿舍门禁时间（23:30-次日6:00），宿舍楼已关闭，请合理安排时间！';
                        }
                        break;
                    case 'express': // 快递点
                        if (currentTime >= 20 * 60 || currentTime < 10 * 60) {
                            showReminder = true;
                            reminderTitle = '营业时间提醒';
                            reminderContent = '当前快递点已关闭（20:00-次日10:00），请在其他时间前往取件！';
                        }
                        break;
                    case 'gate': // 校门
                        if (currentTime >= 23 * 60 + 30 || currentTime < 6 * 60) {
                            showReminder = true;
                            reminderTitle = '门禁提醒';
                            reminderContent = '当前为校门门禁时间（23:30-次日6:00），校门已关闭，请合理安排时间！';
                        }
                        break;
                    case 'building': // 楼宇
                        if (currentTime >= 8 * 60 && currentTime < 22 * 60) {
                            showReminder = true;
                            reminderTitle = '上课提醒';
                            reminderContent = '现在是上课时间，请保持安静，认真学习！';
                        }
                        break;
                    case 'library': // 图书馆
                        showReminder = true;
                        reminderTitle = '图书馆提醒';
                        reminderContent = '请保持安静，不要打扰到其他同学学习！';
                        break;
                    case 'canteen': // 饭堂
                        if (currentTime >= 11 * 60 + 30 && currentTime <= 13 * 60 + 30) {
                            showReminder = true;
                            reminderTitle = '用餐高峰期提醒';
                            reminderContent = '当前为用餐高峰时段，' + endName + '可能人数较多，请合理安排就餐时间！';
                        }
                        break;
                }

                // 如果需要显示提醒
                if (showReminder) {
                    wx.showModal({
                        title: reminderTitle,
                        content: reminderContent,
                        showCancel: false,
                        confirmText: '我知道了',
                        success: (res) => {
                            if (res.confirm) {
                                _this.processNavigation(start, end);
                            }
                        }
                    });
                } else {
                    _this.processNavigation(start, end);
                }
            }
        } else {
            wx.showToast({
                title: '请选择终点！',
                icon: 'none',
                duration: 2000
            })
        }
    },

    // 获取地点类型
    getLocationCategory(locationName) {
        // 宿舍公寓
        if (locationName.includes('园') || locationName.includes('宿舍')) {
            return 'dormitory';
        }
        // 快递点
        if (locationName.includes('快递')) {
            return 'express';
        }
        // 校门
        if (locationName.includes('门')) {
            return 'gate';
        }
        // 楼宇
        if (locationName.includes('楼') || locationName.includes('院')) {
            return 'building';
        }
        // 图书馆
        if (locationName.includes('图书馆')) {
            return 'library';
        }
        // 饭堂
        if (locationName.includes('饭堂') || locationName.includes('食堂')) {
            return 'canteen';
        }
        return 'other';
    },

    // 处理导航路线计算
    processNavigation(start, end) {
        var _this = this;

        // 将导航终点添加到地点历史记录
        if (end && end.name) {
            // 尝试获取地点的更多信息
            const categoryInfo = this.getCategoryInfoForLocation(end);
            if (categoryInfo) {
                end.category = categoryInfo.categoryName;
                if (categoryInfo.siteInfo) {
                    end.aliases = categoryInfo.siteInfo.aliases;
                    end.desc = categoryInfo.siteInfo.desc;
                }
            }

            // 使用LRU历史记录管理模块记录访问 - 这里是真正需要增加频率计数的地方
            lruHistory.addToHistory(end, true);

            // 同时使用原始历史记录管理器 - 不增加频率计数
            const historyManager = app.globalData.historyManager;
            if (historyManager) {
                historyManager.addToHistory(end);
            }

            // 更新热门地点推荐和历史记录列表
            this.loadPopularLocations();
            this.loadHistoryList();
        }

        // 将起点和终点对添加到路线历史记录
        const routeHistoryManager = app.globalData.routeHistoryManager;
        if (routeHistoryManager && start && end && start.name && end.name) {
            // 获取起点和终点的类别信息
            const startCategoryInfo = this.getCategoryInfoForLocation(start);
            if (startCategoryInfo) {
                start.category = startCategoryInfo.categoryName;
            }

            const endCategoryInfo = this.getCategoryInfoForLocation(end);
            if (endCategoryInfo) {
                end.category = endCategoryInfo.categoryName;
            }

            // 添加到路线历史
            routeHistoryManager.addRouteToHistory(start, end);
        }

        //原有的导航处理代码
        //调用距离计算接口
        qqmapsdk.direction({
            mode: 'walking', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
            //from参数不填默认当前地址
            from: start.latitude + "," + start.longitude,
            to: end.latitude + "," + end.longitude,
            success: function(res) {
                console.log("接口返回的数据", res);
                var ret = res;
                var duration = ret.result.routes[0].duration;
                var distance = ret.result.routes[0].distance;
                console.log("时间", duration, "距离", distance)
                var coors = ret.result.routes[0].polyline,
                    pl = [{
                        latitude: start.latitude,
                        longitude: start.longitude
                    }];
                //坐标解压（返回的点串坐标，通过前向差分进行压缩）
                var kr = 1000000;
                for (var i = 2; i < coors.length; i++) {
                    coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
                }
                //将解压后的坐标放入点串数组pl中
                for (var i = 0; i < coors.length; i += 2) {
                    pl.push({
                        latitude: coors[i],
                        longitude: coors[i + 1]
                    })
                }
                pl.push({
                    latitude: end.latitude,
                    longitude: end.longitude
                })
                console.log("路线", pl)
                    //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
                _this.setData({
                    polyline: [{
                        points: pl,
                        color: '#58c16c',
                        width: 10,
                        borderColor: '#2f693c',
                        borderWidth: 2,
                        arrowLine: true
                    }],
                    steps: ret.result.routes[0].steps,
                    distance: distance,
                    duration: duration
                })
                _this.includePoints(pl)
                _this.moveAlong()

            },
            fail: function(error) {
                // console.error(error);
            },
            complete: function(res) {
                // console.log(res);
            }
        });

        this.setData({
            markers: [{
                    id: 0,
                    latitude: start.latitude,
                    longitude: start.longitude,
                    iconPath: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png",
                    width: 25,
                    height: 37,
                    callout: {
                        content: " " + start.name + " ",
                        display: 'ALWAYS',
                        padding: 5,
                        borderRadius: 10
                    },
                },
                {
                    id: 1,
                    latitude: end.latitude,
                    longitude: end.longitude,
                    iconPath: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png",
                    width: 25,
                    height: 37,
                    callout: {
                        content: " " + end.name + " ",
                        display: 'ALWAYS',
                        padding: 5,
                        borderRadius: 10
                    },
                },
                {
                    id: 2,
                    latitude: start.latitude,
                    longitude: start.longitude,
                    iconPath: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/car.png",
                    width: 30,
                    height: 30,
                    callout: {
                        content: " 移动中 ",
                        display: 'ALWAYS',
                        padding: 5,
                        borderRadius: 10
                    },
                }
            ],
        })
    },

    // 轨迹回放    
    moveAlong() {
        var that = this
        var markers = this.data.markers
        var points = this.data.polyline[0].points
        this.mapCtx = wx.createMapContext('map')
        this.mapCtx.moveAlong({
            markerId: 2,
            path: points,
            duration: 4000,
            autoRotate: true,
            success: function(res) {
                markers.pop()
                that.setData({
                    markers: markers
                })
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

    // 切换热门地点区域显示状态
    togglePopularLocations() {
        this.setData({
            showPopularLocations: !this.data.showPopularLocations
        });
    },

    // 选择热门地点
    selectPopularLocation(e) {
        const location = e.currentTarget.dataset.location;
        if (location) {
            // 显示地点卡片
            this.setData({
                dialogShow_site: true,
                card: location
            });

            // 更新LRU缓存中的访问频率
            lruHistory.addToHistory(location);
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
            const personalizedRecommendations = recommendation.getPersonalizedRecommendations(allLocations, historyList, 5);

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

    // 选择个性化推荐地点
    selectPersonalizedRecommendation(e) {
        const location = e.currentTarget.dataset.location;
        if (location) {
            // 显示地点卡片
            this.setData({
                dialogShow_site: true,
                card: location
            });

            // 更新LRU缓存中的访问频率
            lruHistory.addToHistory(location);

            // 重新加载推荐
            this.loadPersonalizedRecommendations();
        }
    },

    // 选择基于时间的推荐地点
    selectTimeBasedRecommendation(e) {
        const location = e.currentTarget.dataset.location;
        if (location) {
            // 显示地点卡片
            this.setData({
                dialogShow_site: true,
                card: location
            });

            // 更新LRU缓存中的访问频率
            lruHistory.addToHistory(location);

            // 重新加载推荐
            this.loadTimeBasedRecommendations();
        }
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
    },

    /**
     * 更新当前时间段及其文本描述
     */
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
})