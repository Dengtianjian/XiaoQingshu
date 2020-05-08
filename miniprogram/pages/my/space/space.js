import Cloud from "../../../source/js/cloud.js";
import Utils from "../../../source/js/utils";
import Prompt from "../../../source/js/prompt";
import Pagination from "../../../source/js/pagination";
const App = getApp();
Page({
  PostPagination:null,
  /**
   * 页面的初始数据
   */
  data: {
    pageScrollTop: 0,
    userInfo: null,
    currentUser: {
      isLogin: false,
    },
    posts:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let _userid = options.userid;
    _userid="oKXC25L4s6Y8r97Jf54o37c6Xoc4";
    if(_userid==undefined){
      Prompt.toast("抱歉，该用户不存在",{
        switchTab:"/pages/my/index/index"
      });
      return;
    }
    this.PostPagination=new Pagination(this,"posts");

    wx.showLoading({
      title:"加载中",
      mask:true
    });
    await Cloud.cfunction("User", "getUserProfile", {
      _userid,
    })
      .then((res) => {
        console.log(res);
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
      await App.getUserInfo().then(res=>{
        this.setData({
          currentUser:res
        })
      });
      this.getUserPost();
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
  onReachBottom: function () {
    if(this.PostPagination.isFinished()==false||this.PostPagination.isLoading()==false){
      this.getUserPost();
    }
  },

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
  getUserPost(){
    if(this.PostPagination.isFinished()||this.PostPagination.isLoading()){
      return;
    }
    this.PostPagination.setLoading(true);
    Cloud.cfunction("Post","getPostByUser",{
      page:this.PostPagination.getPage(),
      limit:this.PostPagination.limit,
      userid:this.data.userInfo['_userid']
    }).then(res=>{
      if(res.length<this.PostPagination.limit){
        this.PostPagination.setFinished(true);
      }
      this.PostPagination.insert(res);
      this.PostPagination.setLoading(false);
    });
  }
});
