// pages/class/class.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenClassmateInfoPopup:true,
    classmateInfoPopupData:null,
    scrollTop:0,
    statistics:[
      {
        title:"人数",
        count:23
      },{
        title:"人数",
        count:23
      },{
        title:"人数",
        count:23
      }
    ]
  },
  onPageScroll(e){
    this.setData({
      scrollTop:e.scrollTop
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      fontColor:"#ffffff",
      backgroundColor:"#000000"
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showClassmateInfo(e){
    let dataset=e.currentTarget.dataset;
    let index=dataset.index;
    this.setData({
      hiddenClassmateInfoPopup:false,
      classmateInfoPopupData:{
        avatar:"http://t9.baidu.com/it/u=1589763659,2716552399&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1587449931&t=5a4adaac66cdeb2f07ff7a0247f58d15",
        relaname:"蔡同学",
        age:18,
        phoneNumber:1888999966,
        office:"扫地专员"
      }
    })
  },
  hiddenClassmateInfoPopup(){
    this.setData({
      hiddenClassmateInfoPopup:true,
    })
  }
})