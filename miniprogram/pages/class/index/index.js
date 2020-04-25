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
    pageLoading: true,
    scrollTop: 0,
    classInfo: null,
    userInfo: null,
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
    this.getClassInfo();
  },
  onShareAppMessage	(e){
    let students=this.data.classInfo.students;
    let albumCount=this.data.classInfo.album_count;
    let title=`已经有 ${students} 位同学👬加入同学录啦。还有 ${albumCount} 张同学们的丑照🤭在里面`;
    let path="/pages/class/invite_join/invite_join?classid="+this.data.classInfo._id;
    return {
      title,
      path
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showShareMenu({
      withShareTicket: true
    });
    wx.showLoading({
      title: "加载中",
    });
    await App.getUserInfo()
      .then(async (userInfo) => {
        this.setData({
          userInfo,
        });
        let schoolid = userInfo["_default_school"];
        if (userInfo["_default_school"]) {
          wx.hideLoading();
          await Cloud.cfunction("Class", "getClassBySchoolId", {
            _schoolid: schoolid,
          })
            .then((res) => {
              this.setData({
                classInfo: res,
              });
              this.updateStatistics();
              this.updateNewClassmateList();
              this.getClassStudent();

              Cloud.collection("school_class_album").where({
                _classid:res['_id'],
                type:"photo"
              }).limit(5).get().then(res=>{
                this.setData({
                  photos:res['data']
                });
              })
            })
            .catch((res) => {
              wx.hideLoading();
              Prompt.codeToast(res.error, res.code, {
                404: {
                  404001: "抱歉，班级不存在或者正在审核中",
                },
              });
            });
        }

        wx.hideLoading();
      })
      .catch((res) => {
        if (this.data.isLogin) {
          return;
        }
        this.setData({
          userInfo: res,
        });
        wx.hideLoading();
      });
  },
  updateStatistics() {
    //计算 已过去时间
    let userInfo = this.data.userInfo;
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth();
    let nowDay = nowDate.getDate();
    let buildDate = new Date(userInfo.build_date);
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
    lessString += `${buildDay - nowDay || 0}天`;
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
    if (this.data.classInfo["_adminid"] == this.data.userInfo["_openid"]) {
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
          wx.setNavigationBarColor({
            frontColor: "#ffffff",
            backgroundColor: "#000000",
          });
          this.setData({
            classInfo: res.data[0],
          });
        } else {
          this.setData({
            classInfo: null,
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
      if (selectUser["brithday"] != "") {
        selectUser["age"] = Utils.computedAge(selectUser["brithday"]);
        selectUser["brithday"] = Utils.formatDate(
          selectUser["brithday"],
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
        .then((res) => {
          userInfo["isLogin"] = true;
          App.userInfo = userInfo;
          this.setData({
            userInfo: res,
          });
          wx.hideLoading();
        })
        .catch((res) => {
          this.setData({
            userInfo: res,
          });
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
          409: {
            409001: "宁已经提交过申请，请勿重复提交",
            409002: "宁已是该班级的同学了，请勿重复加入",
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
      _userid: selectUser["_openid"],
    }).then((res) => {
      this.setData({
        [`newClassmate.list[${index}]`]: "deleted",
        "newClassmate.has": this.newClassmate.list.length != 0,
        "newClassmate.hiddenPopup": this.newClassmate.list.length == 0,
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
});
