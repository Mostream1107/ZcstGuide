// pages/home/home.js
var media = require('../../data/media')
var map = require('../../data/map')
var school = require('../../data/school')
var data = require('../../data/data')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        miniprogram_name: data.miniprogram_name,
        school_information: school.school_information,
        AppID: school.AppID,

        laba: media.laba,
        school_logo: media.school_logo,

        function_buttons: media.function_buttons,

        school_icon: media.school_icon,
        book: media.book,
        academic: media.academic,

        wave: media.wave,

        label: media.label,

        school: media.school,
        information: media.information,
        notes: media.notes,
        admin: media.admin,
        contact: media.contact,
        guanwei: media.guanwei,
        weather: media.weather,

        APIKEY: data.weatherKey,
        CAIYUN_KEY: data.caiyunWeatherKey, // 彩云天气API密钥
        school_location: parseFloat(map.longitude).toFixed(6) + "," + parseFloat(map.latitude).toFixed(6),

        background: media.swiper_background,

        indicatorDots: true, //是否显示面板指示点
        indicatorColor: "white", //指示点颜色
        activeColor: "#2adce2", //当前选中的指示点颜色
        autoplay: true, //是否自动切换
        circular: true, //是否采用衔接滑动
        interval: 3500, //间隔时间
        duration: 1500, //滑动时间

        dialogShow: false,
        buttons: [{
            text: '关闭'
        }],

        // 天气相关
        isLoading: false,
        loadError: false,
        weatherData: null, // 存储天气数据

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getWeather()
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
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    /**
     * 用户点击右上角分享到朋友圈
     */
    onShareTimeline: function(res) {

    },

    //图片比例
    imgHeight: function(e) {
        var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
        var imgh = e.detail.height; //图片高度
        var imgw = e.detail.width; //图片宽度
        var swiperH = winWid * imgh / imgw + "px" //等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
        this.setData({
            Height: swiperH //设置高度
        })
    },

    // 跳转到学校官网
    toschool() {
        wx.navigateTo({
            url: '../school/webview/webview?url=https://www.zcst.edu.cn/',
        })
    },

    // 跳转到图书馆
    tolibrary() {
        wx.navigateTo({
            url: '../school/webview/webview?url=https://library.zcst.edu.cn/',
        })
    },

    // 跳转到教务系统
    toacademic() {
        wx.navigateTo({
            url: '../school/webview/webview?url=https://jw.zcst.edu.cn/xtgl/login_slogin.html',
        })
    },

    // 获取天气 - 使用彩云天气API
    getWeather() {
        var that = this;

        // 设置加载状态
        that.setData({
            isLoading: true,
            loadError: false
        });

        // 使用固定的天气数据，避免API频率限制问题
        const mockWeatherData = {
            temperature: 26,
            humidity: 0.68,
            pressure: 100800,
            wind: {
                direction: 45,
                speed: 3.5
            },
            skycon: "PARTLY_CLOUDY_DAY"
        };

        // 构建与界面兼容的天气数据对象
        const now = {
            temp: Math.round(mockWeatherData.temperature), // 温度
            windDir: that.getWindDirection(mockWeatherData.wind.direction), // 风向
            windScale: that.getWindScale(mockWeatherData.wind.speed), // 风力等级
            humidity: Math.round(mockWeatherData.humidity * 100), // 湿度百分比
            pressure: Math.round(mockWeatherData.pressure / 100), // 气压 (hPa)
            icon: that.getWeatherIcon(mockWeatherData.skycon) // 天气图标代码
        };

        that.setData({
            now: now,
            weatherData: mockWeatherData, // 保存原始数据以备后用
            isLoading: false,
            loadError: false
        });

        // 如果未来需要恢复API调用，可以取消注释以下代码
        /*
        // 解析经纬度
        const location = this.data.school_location.split(',');
        const longitude = location[0]; // 经度
        const latitude = location[1];  // 纬度
        
        // 构建彩云天气API请求URL
        const url = `https://api.caiyunapp.com/v2.6/${this.data.CAIYUN_KEY}/${longitude},${latitude}/realtime`;
        
        wx.request({
            url: url,
            success(res) {
                if (res.statusCode === 200) {
                    const result = res.data;
                    if (result.status === 'ok' && result.result) {
                        // 处理返回的天气数据
                        const weatherData = result.result;
                        
                        // 构建与界面兼容的天气数据对象
                        const now = {
                            temp: Math.round(weatherData.temperature), // 温度
                            windDir: that.getWindDirection(weatherData.wind.direction), // 风向
                            windScale: that.getWindScale(weatherData.wind.speed), // 风力等级
                            humidity: Math.round(weatherData.humidity * 100), // 湿度百分比
                            pressure: Math.round(weatherData.pressure / 100), // 气压 (hPa)
                            icon: that.getWeatherIcon(weatherData.skycon) // 天气图标代码
                        };
                        
                        that.setData({
                            now: now,
                            weatherData: weatherData, // 保存原始数据以备后用
                            isLoading: false,
                            loadError: false
                        });
                    } else {
                        that.setData({
                            isLoading: false,
                            loadError: true
                        });
                        wx.showToast({
                            title: '获取天气数据失败',
                            icon: 'none',
                            duration: 2000
                        });
                        console.error('彩云天气API响应错误:', result);
                    }
                } else {
                    that.setData({
                        isLoading: false,
                        loadError: true
                    });
                    wx.showToast({
                        title: '获取天气HTTP错误: ' + res.statusCode,
                        icon: 'none',
                        duration: 2000
                    });
                    console.error('获取天气HTTP错误:', res);
                }
            },
            fail(err) {
                that.setData({
                    isLoading: false,
                    loadError: true
                });
                console.error('获取天气网络请求失败：', err);
                wx.showToast({
                    title: '获取天气信息失败: 网络错误',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
        */
    },

    // 将彩云天气skycon转换为对应的天气图标代码
    getWeatherIcon(skycon) {
        // 彩云天气skycon代码转换为类似于和风天气的图标代码
        const iconMap = {
            'CLEAR_DAY': '100', // 晴天
            'CLEAR_NIGHT': '150', // 晴夜
            'PARTLY_CLOUDY_DAY': '101', // 多云(白天)
            'PARTLY_CLOUDY_NIGHT': '151', // 多云(夜间)
            'CLOUDY': '104', // 阴
            'LIGHT_HAZE': '503', // 轻度雾霾
            'MODERATE_HAZE': '504', // 中度雾霾
            'HEAVY_HAZE': '505', // 重度雾霾
            'LIGHT_RAIN': '300', // 小雨
            'MODERATE_RAIN': '301', // 中雨
            'HEAVY_RAIN': '302', // 大雨
            'STORM_RAIN': '304', // 暴雨
            'FOG': '501', // 雾
            'LIGHT_SNOW': '400', // 小雪
            'MODERATE_SNOW': '401', // 中雪
            'HEAVY_SNOW': '402', // 大雪
            'STORM_SNOW': '403', // 暴雪
            'DUST': '503', // 浮尘
            'SAND': '503', // 沙尘
            'WIND': '200' // 大风
        };

        return iconMap[skycon] || '999'; // 默认返回999表示未知
    },

    // 根据风向角度获取风向名称
    getWindDirection(direction) {
        // 将0-360度的风向转换为对应的方向名称
        const directions = [
            '北风', '东北风', '东风', '东南风',
            '南风', '西南风', '西风', '西北风', '北风'
        ];

        const index = Math.round(direction / 45) % 8;
        return directions[index];
    },

    // 根据风速获取风力等级
    getWindScale(speed) {
        // 将风速(m/s)转换为风力等级
        if (speed < 0.3) return '0';
        if (speed < 1.6) return '1';
        if (speed < 3.4) return '2';
        if (speed < 5.5) return '3';
        if (speed < 8.0) return '4';
        if (speed < 10.8) return '5';
        if (speed < 13.9) return '6';
        if (speed < 17.2) return '7';
        if (speed < 20.8) return '8';
        if (speed < 24.5) return '9';
        if (speed < 28.5) return '10';
        if (speed < 32.7) return '11';
        return '12';
    },

    // 重试获取天气
    retryGetWeather() {
        this.getWeather();
    },

    //点击图片可查看
    lookPhoto(e) {
        console.log("点击了图片", e.target.dataset.src)
        var url = e.target.dataset.src
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: this.data.background // 需要预览的图片http链接列表
        })
    },

    // 跳转到地图页
    map() {
        wx.switchTab({
            url: '../map/map',
        })
    },

    // 跳转到校园页
    school() {
        wx.switchTab({
            url: '../school/school',
        })
    },

    // 跳转到地点汇总页
    site() {
        // wx.switchTab({
        //   url: '../site/site',
        // })
        wx.navigateTo({
            url: '../home/pano/pano',
        })
    },

    // 友情链接
    link() {
        this.setData({
            dialogShow: true,
        })
    },

    // 关闭 mp-dialog 会话框
    mapmarker(e) {
        this.setData({
            dialogShow: false,
        })
    },

    // 学校简介
    tointroduction() {
        wx.navigateTo({
            url: '../home/introduction/introduction',
        })
    },
})