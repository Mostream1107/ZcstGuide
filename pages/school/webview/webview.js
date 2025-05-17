// pages/school/webview/webview.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: '', // 要加载的URL
        title: '网页浏览'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.url) {
            let url = decodeURIComponent(options.url);
            this.setData({
                url: url
            });

            // 根据URL设置标题
            if (url.includes('zcst.edu.cn')) {
                if (url.includes('library.')) {
                    this.setData({ title: '图书馆' });
                } else if (url.includes('cwc.')) {
                    this.setData({ title: '财务处' });
                } else if (url.includes('job.')) {
                    this.setData({ title: '就业指导' });
                } else if (url.includes('jw.')) {
                    this.setData({ title: '教务系统' });
                } else {
                    this.setData({ title: '学校官网' });
                }
            }

            // 设置导航栏标题
            wx.setNavigationBarTitle({
                title: this.data.title
            });
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: this.data.title,
            path: '/pages/school/webview/webview?url=' + encodeURIComponent(this.data.url)
        }
    },

    /**
     * webview加载成功
     */
    loadSuccess() {
        console.log('网页加载成功');
    },

    /**
     * webview加载失败
     */
    loadError(e) {
        console.error('网页加载失败', e.detail);
        wx.showToast({
            title: '网页加载失败',
            icon: 'none',
            duration: 2000
        });
    }
})