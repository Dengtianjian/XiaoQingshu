// pages/school/select_school/select_school.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    keywords: "",
    schools: [],
    hotSchools: [
      {
        _id: 1,
        name: "华南农业大学",
        icon:
          "https://dss0.bdstatic.com/6Ox1bjeh1BF3odCf/it/u=2490617731,346506777&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=66386b118bf0cdde05db6ca1c856cac6",
      },
      {
        _id: 3,
        name: "华南农业大学",
        icon:
          "https://dss0.bdstatic.com/6Ox1bjeh1BF3odCf/it/u=2490617731,346506777&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=66386b118bf0cdde05db6ca1c856cac6",
      },
      {
        _id: 3,
        name: "华南农业大学",
        icon:
          "https://dss0.bdstatic.com/6Ox1bjeh1BF3odCf/it/u=2490617731,346506777&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=66386b118bf0cdde05db6ca1c856cac6",
      },
      {
        _id: 4,
        name: "华南农业大学",
        icon:
          "https://dss0.bdstatic.com/6Ox1bjeh1BF3odCf/it/u=2490617731,346506777&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=66386b118bf0cdde05db6ca1c856cac6",
      },
      {
        _id: 5,
        name: "华南农业大学",
        icon:
          "https://dss0.bdstatic.com/6Ox1bjeh1BF3odCf/it/u=2490617731,346506777&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=66386b118bf0cdde05db6ca1c856cac6",
      },
      {
        _id: 6,
        name: "华南农业大学",
        icon:
          "https://dss0.bdstatic.com/6Ox1bjeh1BF3odCf/it/u=2490617731,346506777&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=66386b118bf0cdde05db6ca1c856cac6",
      },
    ],
    feedbackSchoolName:"",
    hideFeedbackSchool:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  onReachBottom: function () {},
  keywordInput(e) {
    let value = e.detail.value;
    if (value == "") {
      return;
    }
    const DB = wx.cloud.database();
    Cloud.collection("school")
      .where({
        name: DB.RegExp({
          regexp: `.*${value}.*`,
          options: "i",
        }),
      })
      .get()
      .then((res) => {
        this.setData({
          schools: res["data"],
        });
      });
  },
  selectSchool(e) {
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
                    switchTab: "/pages/school/school",
                  },
                },
              });
            });
        }
      },
    });
  },
  displayFeedbackSchoolDialog(){
    this.setData({
      hideFeedbackSchool:false
    });
  },
  submitFeedback(e){
    let schoolName=this.data.feedbackSchoolName;
    wx.showLoading({
      title:"登记学校名称中"
    });
    Cloud.cfunction("User","submitFeedback",{
      page:getCurrentPages()[getCurrentPages().length-1]['route'],
      type:"not_my_school",
      content:schoolName
    }).then(res=>{
      wx.hideLoading();
      Prompt.toast("反馈成功，非常感谢您的反馈😘",{
        success:()=>{
          this.setData({
            hideFeedbackSchool:true,
            feedbackSchoolName:""
          });
        }
      })
    })
  }
});
