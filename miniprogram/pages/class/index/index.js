// pages/class/class.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hiddenClassmateInfoPopup: true,
    classmateInfoPopupData: null,
    scrollTop: 0,
    statistics: [
      {
        title: "人数",
        count: 23,
      },
      {
        title: "人数",
        count: 23,
      },
      {
        title: "人数",
        count: 23,
      },
    ],
    userInfo: null,
    searchClassInfo:null,
    hiddenJoinClassDialog:true,
    newClassmate:{
      hiddenPopup:true
    },
    classInfo:null
  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let userInfo = await App.getUserInfo().then((res) => {
      return res;
    });
    let classInfo=null;
    // userInfo['class']={

    // };
    await Cloud.collection("school_class").where({
      _id:"1d1104975e9d59790095e69d041aec4f"
    }).get().then(res=>{
      if(res['data'].length==0){
        wx.showToast({
          title:"班级不存在或者正在审核中",
          icon:"none"
        });
        return;
      }
      classInfo=res.data[0];
    });
    this.setData({
      userInfo,
      classInfo,
      statistics: [
        {
          title: "人数",
          count: classInfo['members'],
        },
        {
          title: "人数",
          count: 23,
        },
        {
          title: "过去时间",
          count: 23,
        },
      ]
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
  showClassmateInfo(e) {
    let dataset = e.currentTarget.dataset;
    let index = dataset.index;
    this.setData({
      hiddenClassmateInfoPopup: false,
      classmateInfoPopupData: {
        avatar:
          "http://t9.baidu.com/it/u=1589763659,2716552399&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1587449931&t=5a4adaac66cdeb2f07ff7a0247f58d15",
        relaname: "蔡同学",
        age: 18,
        phoneNumber: 1888999966,
        office: "扫地专员",
      },
    });
  },
  hiddenClassmateInfoPopup() {
    this.setData({
      hiddenClassmateInfoPopup: true,
    });
  },
  userLogin(e) {
    if (e.detail.cloudID) {
      let userInfo = {
        isLogin: true,
        cloudId: e.detail.cloudID,
        ...e.detail.userInfo,
      };

      App.userInfo = userInfo;
      this.setData({
        userInfo,
      });
    }
  },
  async searchClass(e) {
    let classId = e.detail.value.class_id;
    if (!classId) {
      wx.showToast({
        title: "请输入班级ID，数字的呢",
        icon: "none",
      });
      return;
    }
    wx.showLoading({
      title:"查询中，请稍等"
    });
    let classInfo = null;
    let schoolInfo = null;
    await wx.cloud
      .database()
      .collection("school_class")
      .where({
        _numberid: parseInt(classId),
      })
      .get()
      .then((res) => {
        if (res.data.length < 1) {
          wx.showToast({
            title: "抱歉，没搜索到相应的班级，请再次确认ID是否正确",
            icon: "none",
          });
          return;
        }
        classInfo = res.data[0];
      });

    let schoolId = classInfo["_schoolid"];
    await wx.cloud
      .database()
      .collection("school")
      .where({
        _id: schoolId,
      })
      .get()
      .then((res) => {
        if (res.data.length < 1) {
          wx.showToast({
            title: "抱歉，班级信息错误，请联系班级管理员",
            icon: "none",
          });
          return;
        }
        schoolInfo = res["data"][0];
      });
      this.setData({
        searchClassInfo:{
          school:schoolInfo,
          class:classInfo
        },
        hiddenJoinClassDialog:false
      });
      wx.hideLoading();
  },
  hiddenJoinClassDialog(){
    this.setData({
      hiddenJoinClassDialog:true
    });
  },
  confirmJoinClass(e){
    let that=this;
    Cloud.cfunction("class","applyJoinClass",{
      classId:this.data.searchClassInfo['class']['_id'],
      schoolId:this.data.searchClassInfo['school']['_id'],
    }).then(res=>{
      Prompt.toast("申请成功",{
        icon:"success"
      });
      this.setData({
        hiddenJoinClassDialog:true
      });
    }).catch(err=>{
      Prompt.codeToast(err.error,err.code,{
        404:{
          404001:"班级信息错误，请联系班级管理员"
        },
        409:{
          409001:{
            title:"您已申请过了，请勿重复申请",
            switchTab:"/pages/index/index",
            success(){
              that.setData({
                hiddenJoinClassDialog:true
              });
            }
          }
        }
      });
    });
  },
  displayNewClassmatePopup(e){
    let flag=e.currentTarget.dataset.flag;
    this.setData({
      "newClassmate.hiddenPopup":flag
    });
  },
  rejectNewClassmateJoin(){

  },
  agreeNewClassmateJoin(){
    Cloud.cfunction("class","agreeNewClassmateJoin",{

    })
  }
});
