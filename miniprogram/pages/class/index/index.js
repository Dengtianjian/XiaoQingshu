// pages/class/class.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";
import Utils from "../../../source/js/utils";
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageLoadingCompleted: false,
    scrollTop: 0,
    classInfo: null,
    userIsLogin: false,
    statistics: [],
    joinClass: {
      searchResult: null,
      hiddenPopup: true,
    },
    newClassmate: {
      has: false,
      hiddenPopup: true,
      list: null,
    },
    classmates: [],
    classmateInfo: {
      hiddenPopup: true,
      info: null,
    },
    photos: [],
  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop,
    });
  },
  onPullDownRefresh: function () {
    if (this.data.classInfo) {
      this.getClassInfo();
    } else {
      wx.stopPullDownRefresh();
    }
  },
  onShareAppMessage(e) {
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

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showShareMenu({
      withShareTicket: true,
    });
    wx.showLoading({
      title: "加载中",
    });
    await App.getUserInfo()
      .then(async (userInfo) => {
        let schoolid = userInfo["_default_school"];
        if (userInfo["_default_school"]) {
          wx.hideLoading();
          await Cloud.cfunction("Class", "getClassBySchoolId", {
            _schoolid: schoolid,
          })
            .then((res) => {
              if (res == null) {
                this.setData({
                  pageLoadingCompleted: true,
                  userIsLogin: userInfo["isLogin"],
                });
                return;
              }
              this.setData({
                classInfo: res,
                pageLoadingCompleted: true,
                userIsLogin: userInfo["isLogin"],
              });
              if (userInfo["isLogin"]) {
                this.updateStatistics();
                this.updateNewClassmateList();
                this.getClassStudent();
                this.getClassPhoto();
              }
            })
            .catch((res) => {
              wx.hideLoading();
              this.setData({
                pageLoadingCompleted: true,
                userIsLogin: userInfo["isLogin"],
              });
              Prompt.codeToast(res.error, res.code, {
                404: {
                  404001: "抱歉，班级不存在或者正在审核中",
                },
              });
            });
        } else {
          this.setData({
            userIsLogin: userInfo["isLogin"],
          });
        }
        wx.hideLoading();
      })
      .catch((res) => {
        this.setData({
          pageLoadingCompleted: true,
        });
      });
    this.setData({
      pageLoadingCompleted: true,
    });
  },
  onReady() {
    this.setData({
      pageLoadingCompleted: true,
    });
  },
  onShow() {
    this.setData({
      [`joinClass.searchResult`]: null,
    });
    if (this.data.userIsLogin == false && App.userInfo["isLogin"]) {
      this.setData({
        userIsLogin: true,
      });
    }
    if (((this.data.classInfo == null) != App.userInfo.class) != null) {
      if (App.userInfo.class) {
        this.setData({
          classInfo: App.userInfo.class,
        });
        this.getClassInfo();
      } else {
        this.setData({
          classInfo: null,
          statistics: [],
          newClassmate: { has: false, hiddenPopup: true, list: null },
          classmates: [],
          classmateInfo: { hiddenPopup: true, info: null },
          photos: [],
        });
      }
    }
  },
  updateStatistics() {
    //计算 已过去时间
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth();
    let nowDay = nowDate.getDate();
    let buildDate = new Date(this.data.classInfo.build_date);
    let buildYear = buildDate.getFullYear();
    let buildMonth = buildDate.getMonth();
    let buildDay = buildDate.getDate();
    let lessString = ``;
    if (nowYear - buildYear > 0) {
      lessString += `${nowYear - buildYear}年`;
    }
    if (nowMonth - buildMonth) {
      lessString += `${nowMonth - buildMonth}个月`;
    }
    lessString += `${nowDay - buildDay || 0}天`;
    let statistics = [
      {
        title: "人数",
        count: this.data.classInfo.students,
      },
      {
        title: "相册",
        count: this.data.classInfo.album_count,
      },
      {
        title: "已过去",
        count: lessString,
      },
    ];
    this.setData({
      statistics,
    });
  },
  updateNewClassmateList() {
    if (this.data.classInfo["_adminid"] == App.userInfo["_userid"]) {
      Cloud.collection("school_class_apply")
        .where({
          _classid: this.data.classInfo["_id"],
        })
        .count()
        .then((res) => {
          this.setData({
            "newClassmate.has": res.total,
          });
        });
    }
  },
  getClassInfo() {
    Cloud.collection("school_class")
      .where({
        _id: this.data.classInfo._id,
      })
      .get()
      .then((res) => {
        wx.stopPullDownRefresh();
        if (res.data.length > 0) {
          this.updateStatistics();
          this.updateNewClassmateList();
          this.getClassStudent();
          this.getClassPhoto();
          wx.setNavigationBarColor({
            frontColor: "#ffffff",
            backgroundColor: "#000000",
          });
          App.userInfo.class = res.data[0];
          this.setData({
            classInfo: res.data[0],
            pageLoadingCompleted: true,
          });
        } else {
          this.setData({
            classInfo: null,
            pageLoadingCompleted: true,
          });
        }
      });
  },
  displayClassmateInfo(e) {
    let dataset = e.currentTarget.dataset;
    let flag = dataset.flag;
    if (flag) {
      this.setData({
        classmateInfo: {
          hiddenPopup: flag,
        },
      });
    } else {
      let index = dataset.index;
      let selectUser = this.data.classmates[index];
      if (selectUser["birthday"] != "") {
        selectUser["age"] = Utils.computedAge(selectUser["birthday"]);
        selectUser["birthday"] = Utils.formatDate(
          selectUser["birthday"],
          "y-m-d"
        );
      }
      this.setData({
        classmateInfo: {
          hiddenPopup: flag,
          info: selectUser,
        },
      });
    }
  },
  hiddenClassmateInfoPopup() {
    this.setData({
      hiddenClassmateInfoPopup: true,
    });
  },
  /* 获取用户信息 */
  async getUserInfo(e) {
    if (e.detail.userInfo) {
      let userInfo = e.detail.userInfo;
      await App.getUserInfo(userInfo)
        .then((userInfo) => {
          this.setData({
            userIsLogin: true,
          });
          wx.hideLoading();
        })
        .catch((res) => {
          wx.hideLoading();
        });
    }
  },
  /* 搜索班级 */
  async searchClass(e) {
    let classNumberId = e.detail.value.class_id;
    if (!classNumberId) {
      Prompt.toast("请输入班级的数字ID");
      return;
    }

    if (
      this.data.joinClass.searchResult &&
      classNumberId == this.data.joinClass.searchResult["_numberid"]
    ) {
      this.setData({
        "joinClass.hiddenPopup": false,
      });
      return;
    }
    wx.showLoading({
      title: "正在🔍查找",
    });
    await Cloud.cfunction("Class", "getClassByNumberId", {
      _numberid: classNumberId,
      _schoolid: App.userInfo["_default_school"],
    })
      .then((res) => {
        wx.hideLoading();
        this.setData({
          joinClass: {
            searchResult: res,
            hiddenPopup: false,
          },
        });
      })
      .catch((res) => {
        wx.hideLoading();
        Prompt.codeToast(res.error, res.code, {
          404: {
            404001: "抱歉，没找到ID所对应的班级，请检查是否输入正确",
          },
        });
      });
  },
  /* 隐藏加入班级弹窗 */
  hiddenJoinClassDialog() {
    this.setData({
      "joinClass.hiddenPopup": true,
    });
  },
  /* 确定加入班级 */
  confirmJoinClass() {
    Cloud.cfunction("Class", "applyJoinClass", {
      _classid: this.data.joinClass.searchResult["_id"],
    })
      .then((res) => {
        Prompt.toast("提交申请成功，我们已经通知班级管理员审核，请耐心等候👌");
      })
      .catch((res) => {
        Prompt.codeToast(res.error, res.code, {
          403: {
            403001: {
              title: `🙅‍本班级仅允许邀请加入暂不开放申请加入。请📩联系班级管理员`,
              duration: 4000,
              success: () => {
                this.hiddenJoinClassDialog();
              },
            },
          },
          404: {
            404001: "(⊙o⊙)？班级不存在哦，请检查班级ID是否正确",
          },
          409: {
            409001: "已经提交过申请，请勿重复提交",
            409002: "已是该班级的同学了，请勿重复加入",
          },
          500: {
            500001: "申请加入失败，请稍后重试",
          },
        });
      });
  },
  /* 显示 新同学申请 列表弹窗 */
  async displayNewClassmatePopup(e) {
    await Cloud.cfunction("Class", "getNewClassmate", {
      _classid: this.data.classInfo["_id"],
    }).then((res) => {
      this.setData({
        newClassmate: {
          has: true,
          hiddenPopup: false,
          list: res,
        },
      });
    });
  },
  /* 拒绝新同学加入 */
  rejectNewClassmateJoin(e) {
    let index = e.currentTarget.dataset.index;
    let selectUser = this.data.newClassmate.list[index];
    Cloud.cfunction("Class", "rejectNewClassmateJoin", {
      _classid: this.data.classInfo["_id"],
      _userid: selectUser["_openid"],
    }).then((res) => {
      this.setData({
        [`newClassmate.list[${index}]`]: "deleted",
      });
      Prompt.toast("🙅拒绝成功");
    });
  },
  /* 同意新同学加入 */
  async agreeNewClassmateJoin(e) {
    let index = e.currentTarget.dataset.index;
    let selectUser = this.data.newClassmate.list[index];
    Cloud.cfunction("Class", "agreeNewClassmateJoin", {
      _classid: this.data.classInfo["_id"],
      _userid: selectUser["_userid"],
    }).then((res) => {
      this.setData({
        [`newClassmate.list[${index}]`]: "deleted",
        "newClassmate.has": this.data.newClassmate.list.length != 0,
        "newClassmate.hiddenPopup": this.data.newClassmate.list.length == 0,
      });
      Prompt.toast("🙆同意成功，我们已经发送了通知给新同学了！");
    });
  },
  getClassStudent() {
    Cloud.cfunction("Class", "getStudent", {
      _classid: this.data.classInfo._id,
    }).then((res) => {
      this.setData({
        classmates: res,
      });
    });
  },
  getClassPhoto() {
    Cloud.collection("school_class_album")
      .where({
        _classid: this.data.classInfo["_id"],
        type: "photo",
      })
      .limit(5)
      .get()
      .then((res) => {
        this.setData({
          photos: res["data"],
        });
      });
  },
  goToBuildClass() {
    let that = this;
    wx.navigateTo({
      url: "/pages/class/edit_info/edit_info",
      events: {
        buildClass(data) {
          let _classid = data._classid;
          that.setData({
            "classInfo._id": _classid,
            pageLoadingCompleted: false,
          });
          that.getClassInfo();
        },
      },
    });
  },
  quitClass() {
    if(this.data.classInfo._adminid==App.userInfo._userid){
      Prompt.toast("抱歉，暂不支持班级管理员退出班级",{
        duration:2500
      });
      return;
    }
    wx.showModal({
      title: "Are you 确定?",
      content: "退出班级😢",
      cancelText: "按错了",
      success:(result)=>{
        if (result.confirm) {
          Cloud.cfunction("Class", "quitClass", {
            classId: this.data.classInfo._id,
          }).then((res) => {
            Prompt.toast("退出成功，同学们会想念你的");
            App.userInfo["class"] = null;
            this.setData({
              classInfo: null,
            });
          });
        }
      },
    });
  },
});
