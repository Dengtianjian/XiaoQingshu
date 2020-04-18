// pages/school/feedback_school/feedback_school.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  addSchool(e){
    let formValue=e.detail.value;
    if(formValue.schoolName==""){
      wx.showToast({
        icon:"none",
        title:"❌请输入学校名称"
      });
      return;
    }
    wx.showToast({
      icon:"none",
      title:"已收到您的反馈，非常感谢！🙇‍"
    });
    setTimeout(()=>{
      wx.hideToast();
      wx.switchTab({
        url:"/pages/index/index"
      });
    },1000);
  }
})