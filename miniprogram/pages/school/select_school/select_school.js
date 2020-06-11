// pages/school/select_school/select_school.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";

const App=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    keywords: "",
    schools: [],
    hotSchools: [],
    feedbackSchoolName: "",
    hideFeedbackSchool: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (App.userInfo.isLogin == false) {
      Prompt.toast("登录后才能加入学校的呢", {
        navigateBack: true,
      });
      return;
    }
  },
  onReachBottom: function () {},
  keyInputHandle: null,
  keywordInput(e) {
    let value = e.detail.value;
    if (value == "") {
      return;
    }
    clearTimeout(this.keyInputHandle);
    this.keyInputHandle=null;
    this.keyInputHandle=setTimeout(async () => {
      await Cloud.cfunction("School","searchByKeyword",{
        keyword:value
      }).then(schools=>{
        this.setData({
          schools
        })
      })
        clearTimeout(this.keyInputHandle);
    },500);
  },
  selectSchool(e) {
    if (App.userInfo.isLogin == false) {
      Prompt.toast("登录后才能加入学校的呢", {
        navigateBack: true,
      });
      return;
    }
    let dataset = e.currentTarget.dataset;
    let selectSchool = this.data.schools[dataset.index];
    let that = this;

    wx.showModal({
      title: "选择学校",
      content: `确定要加入 ${selectSchool["name"]} ？`,
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: "登记资料中",
          });
          Cloud.cfunction("School", "joinSchool", {
            _schoolid: selectSchool["_id"],
          })
            .then((res) => {
              wx.hideLoading();
              Prompt.toast(
                `🎉加入成功，欢迎您加入 ${selectSchool["name"]} 这个大家庭🏫`,
                {
                  switchTab: "/pages/school/index/index",
                  success() {
                    let pages = getCurrentPages();
                    if (pages.length > 1) {
                      const eventChannel = that.getOpenerEventChannel();
                      eventChannel.emit("changeSchool", {
                        _schoolid: selectSchool["_id"],
                      });
                    }
                  },
                }
              );
            })
            .catch((res) => {
              wx.hideLoading();
              Prompt.codeToast(res.error, res.code, {
                409: {
                  409001: {
                    title: `您已是 ${selectSchool["name"]} 的学生了，请勿重复加入🙅`,
                    switchTab: "/pages/school/index/index",
                  },
                },
              });
            });
        }
      },
    });
  },
  displayFeedbackSchoolDialog() {
    if (App.userInfo.isLogin == false) {
      Prompt.toast("登录后才能反馈哦", {
        navigateBack: true,
      });
      return;
    }
    this.setData({
      hideFeedbackSchool: false,
    });
  },
  submitFeedback(e) {
    if (App.userInfo.isLogin == false) {
      Prompt.toast("登录后才能反馈哦", {
        navigateBack: true,
      });
      return;
    }
    let schoolName = this.data.feedbackSchoolName;
    wx.showLoading({
      title: "登记学校名称中",
    });
    Cloud.cfunction("User", "submitFeedback", {
      page: getCurrentPages()[getCurrentPages().length - 1]["route"],
      type: "not_my_school",
      content: schoolName,
    }).then((res) => {
      wx.hideLoading();
      Prompt.toast("反馈成功，非常感谢您的反馈😘", {
        success: () => {
          this.setData({
            hideFeedbackSchool: true,
            feedbackSchoolName: "",
          });
        },
      });
    });
  },
});
