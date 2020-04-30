import Cloud from "../../../source/js/cloud.js";
import Utils from "../../../source/js/utils";
import Prompt from "../../../source/js/prompt";
// miniprogram/pages/my/space/space.js
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageScrollTop: 0,
    userInfo: null,
    currentUser: {
      isLogin: false,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _userid = options.userid;
    if(_userid==undefined){
      Prompt.toast("抱歉，该用户不存在",{
        switchTab:"/pages/my/index/index"
      });
      return;
    }

    wx.showLoading({
      title:"加载中",
      mask:true
    });
    Cloud.cfunction("User", "getUserProfile", {
      _userid,
    })
      .then((res) => {
        if (res["birthday"]) {
          res["age"] = Utils.computedAge(res["birthday"]);
          // if(res['gender']){
          //   res["oldAge"]=Urils.computedOldAge(res["age"],res['gender']);
          // }
        }
        this.setData({
          userInfo: res,
        },()=>{
          wx.hideLoading();
        });

      })
      .catch((res) => {
        wx.hideLoading();
        Prompt.codeToast(res.error, res.code, {
          404: {
            404001: {
              title: "抱歉，该用户不存",
              switchTab: "/pages/my/index/index",
            },
          },
        });
      });
    App.getUserInfo().then((res) => {
      this.setData({
        currentUser: res,
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  onPageScroll(e) {
    this.setData({
      pageScrollTop: e.scrollTop,
    });
  },
  getUser() {
    Cloud.cfunction("User", "getUserProfile", {
      _userid:"oKXC25L4s6Y8r97Jf54o37c6Xoc4",
    }).then((res) => {
      console.log(res);
    });
  },
});
