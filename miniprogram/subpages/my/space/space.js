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
    this.PostPagination=new Pagination(this,"posts");

    wx.showLoading({
      title:"加载中",
      mask:true
    });
    if(_userid==undefined){
      if(App.userInfo.isLogin){
        let userInfo=App.userInfo;
        if (userInfo["birthday"]) {
          userInfo["age"] = Utils.computedAge(userInfo["birthday"]);
        }
        this.setData({
          userInfo,
          currentUser:userInfo
        },()=>{
          wx.hideLoading();
        });
        this.getUserPost();
        return;
      }else{
        Prompt.toast("用户不存在",{
          switchTab:"/pages/my/index/index"
        });
        return;
      }
    }
    await Cloud.cfunction("User", "getUserProfile", {
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
      await App.getUserInfo().then(res=>{
        this.setData({
          currentUser:res
        })
      });
      this.getUserPost();
  },

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
  getUserPost(){
    if(this.PostPagination.isFinished()||this.PostPagination.isLoading()){
      return;
    }
    this.PostPagination.setLoading(true);
    Cloud.cfunction("Post","getPostByUser",{
      page:this.PostPagination.getPage(),
      limit:this.PostPagination.limit,
      userid:this.data.userInfo['_id']
    }).then(res=>{
      if(res.length<this.PostPagination.limit){
        this.PostPagination.setFinished(true);
      }
      this.PostPagination.insert(res);
      this.PostPagination.setLoading(false);
    });
  }
});
