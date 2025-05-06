// pages/home/pano/pano.js
var media = require('../../../data/media')
var wxPano = requirePlugin("wxPano")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        more: media.more,
        judge: media.judge,
        text: media.text,
        show: true,
        name: "sport_tianjing",
        panolist: [{
            name: "sport_zhishan",
            src: "https://s21.ax1x.com/2025/04/28/pE7Mj1J.jpg",

        }, {
            name: "sport_tianjing",
            src: 'https://s21.ax1x.com/2025/04/28/pE7QDCF.jpg',

        }],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        wxPano.onReady = function() { //wxPano初始化完成后会触发此事件

        }
        wxPano.config({
            panolist: this.data.panolist,
            request: wx.request,
            loader: "GLLoader",
            entryname: "sport_zhishan"
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    covertap: function() {
        var panoId = wxPano.getPanoInfo().panoId
        var panolist = this.data.panolist
        var name = panolist[(panoId + 1) % panolist.length].name

        wxPano.navigateMethod({
            type: "pano",
            entryname: name
        });
    },
    setCameraLookAt: function() {
        wxPano.setCameraLookAt({
            x: 0.5,
            y: 0.5
        })
    },

    getPanoInfo: function() {
        // console.log('wxPano.getPanoInfo()',wxPano.getPanoInfo())
        var panoId = wxPano.getPanoInfo().panoId
        console.log(panoId)
        var modal = this.data.panolist[panoId].infospots[0].modal
        console.log(modal)

        wx.showModal({
            title: modal.title,
            content: modal.content,
        })
    },

})