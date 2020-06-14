// miniprogram/pages/class/invite_join/invite_join.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";

const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    classId:null,
    classInfo: null,
    userInfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let _classid = options.classid;

    this.setData({
      classId:_classid
    });

    let isJoined=await Cloud.cfunction("User","checkJoined",{
      _classid
    }).then(res=>{
      if(res.length>0){
        return true;
      }else{
        return false;
      }
    });

    if(isJoined){
      Prompt.toast("😀您已是该班级同学了",{
        switchTab:"/pages/class/index/index"
      })
      return ;
    }

    let userInfo = await App.getUserInfo().then((res) => {
      this.setData({
        userInfo: res,
      });
      return res;
    });

    if (userInfo["isLogin"]) {
      this.getClassInfo();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let students = this.data.classInfo.students;
    let albumCount = this.data.classInfo.album_count;
    let title = `已经有 ${students} 位同学👬加入同学录啦。还有 ${albumCount} 张同学们的丑照🤭在里面`;
    let path =
      "/pages/class/invite_join/invite_join?classid=" + this.data.classInfo._id;
    return {
      title,
      path,
    };
  },

  async getClassInfo(){
    wx.showLoading({
      title:"获取班级信息中"
    });
    await Cloud.cfunction("Class", "getClassByClassId", {
      _classid:this.data.classId,
    })
      .then((res) => {
        this.setData({
          classInfo: res,
        });
        wx.hideLoading();
      })
      .catch((res) => {
        Prompt.codeToast(res.error, res.code, {
          404: {
            404001: "班级不存在喔，请联系一下班级管理员😭",
          },
        });
        return;
      });
  },

  /* 同意加入班级 */
  agreeJoinClass() {
    let classInfo = this.data.classInfo;
    wx.showLoading({
      title: "📝登记信息中",
      mask: true,
    });
   
    Cloud.cfunction("Class", "inviteAgreeJoinClass", {
      _classid: classInfo["_id"],
      _schoolid: classInfo["_schoolid"],
    })
      .then((res) => {
        wx.hideLoading();
        Prompt.toast(
          `加入成功，欢迎加入 ${classInfo["profession"]}${classInfo["number"]}班这个小家庭`,
          {
            duration: 2000,
            switchTab: "/pages/class/index/index",
          }
        );
      })
      .catch((res) => {
        wx.hideLoading();
        Prompt.codeToast(res.error, res.code, {
          404: {
            404001: {
              title: "😟抱歉，班级不存在或者审核中，请联系班级管理员",
              switchTab: "/pages/class/index/index",
            },
          },
          409: {
            409001: {
              title: `您已在 ${classInfo["profession"]}${classInfo["number"]}班里了，请勿重复加入`,
              switchTab: "/pages/class/index/index",
              duration: 3000,
            },
          },
        });
      });
  },
  async userLogin(e){
    wx.showLoading({
      title:"登录中"
    });
    await App.getUserInfo().then(res=>{
      this.setData({
        userInfo:res
      },()=>{
        this.getClassInfo();
      });
      wx.hideLoading();
    })
  }
});
