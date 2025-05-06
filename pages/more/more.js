// pages/more/more.js
var media = require('../../data/media')
var data = require('../../data/data')
Page({
    data: {
        miniprogram_name: data.miniprogram_name,

        avatarUrl: media.avatarUrl,

        green_arrow: media.green_arrow,

        statement: media.statement,
        note: media.note,

        users: media.users,
        contact: media.contact,

        chat: media.chat,
        feedback: media.feedback,

        share: media.share,
        miniprogramming_ma: media.miniprogramming_ma,
    },

    onLoad: function () {},

    // 用户点击右上角分享
    onShareAppMessage() {},

    // 用户点击右上角分享到朋友圈
    onShareTimeline: function (res) {},

    // 软件声明
    tostatement() {
        wx.navigateTo({
            url: '../../pages/more/statement/statement',
        })
    },
    // 联系作者
    contact() {
        wx.showModal({
            title: '联系作者',
            content: '如果遇到什么问题\n请点击确认与我联系',
            success: (res => {
                if (res.confirm == true) {
                    wx.previewImage({
                        current: this.data.contact, // 当前显示图片的http链接
                        urls: [this.data.contact] // 需要预览的图片http链接列表
                    })
                }
            }),
            fail(res) {
                console.log('fail')
            }
        })
    },
    
    // 分享
    share() {
        wx.showModal({
            title: '推荐给好友',
            content: '点击确认即可查看小程序码\n长按小程序码即可转发给好友',
            success: (res => {
                if (res.confirm == true) {
                    wx.previewImage({
                        current: this.data.miniprogramming_ma, // 当前显示图片的http链接
                        urls: [this.data.miniprogramming_ma] // 需要预览的图片http链接列表
                    })
                }
            }),
            fail(res) {
                console.log('fail')
            }
        })
    }
})