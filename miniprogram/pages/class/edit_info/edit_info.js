// pages/class/edit_info/edit_info.js
import Prompt from "../../../source/js/prompt";
import Cloud from "../../../source/js/cloud";

import Utils from "../../../source/js/utils";

const App = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    classId: null,
    buildDate: "****-**-**",
    userInfo: null,
    classInfo: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let userInfo = await App.getUserInfo()
      .then((res) => {
        return res;
      })
      .catch((res) => {
        return res;
      });
    if (userInfo["isLogin"] == false) {
      Prompt.toast("还未登录哦，请登录后再创建", {
        switchTab: "/pages/class/index/index",
      });
      return;
    }
    if (!userInfo["_default_school"]) {
      Prompt.toast("还未加入任何一所学校，请加入后再创建", {
        switchTab: "/pages/school/index/index",
      });
      return;
    }

    if (!options.classid) {
      wx.setNavigationBarTitle({
        title: "创建班级",
      });
      let date = new Date();
    let dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    this.setData({
      buildDate: dateString
    });
    } else {
      wx.setNavigationBarTitle({
        title: "编辑班级信息",
      });
      let classInfo = await Cloud.collection("school_class")
        .where({
          _id: options["classid"],
        })
        .field({
          build_date:true,
          allow_join:true,
          number:true,
          profession:true,
          _id:true,
          _adminid:true
        })
        .get()
        .then((res) => {
          return res["data"];
        });
      if (classInfo.length == 0) {
        Prompt.toast("班级不存在，或者正在审核中", {
          switchTab: "/pages/class/index/index",
        });
        return;
      }
      classInfo=classInfo[0];
      this.setData({
        classId: options["classid"],
        classInfo,
        buildDate:Utils.formatDate(classInfo['build_date'],"y-m-d")
      });
    }
  },

  bindDateChange(e) {
    let value = e.detail.value;
    let name = e.currentTarget.dataset.name;
    if (name == "build_date") {
      this.setData({
        buildDate: value,
      });
    }
  },

  saveClassInfo(e) {
    let that=this;
    let value = e.detail.value;
    let profession = value.profession;
    let buildDate = Date.parse(value.build_date);
    let gradeNumber = value.grade_number;
    let allowJoin = Boolean(value.allow_join);
    Cloud.cfunction("Class", "saveClassInfo", {
      _classid: this.data.classId,
      profession,
      buildDate,
      gradeNumber,
      _schoolid: App.userInfo["_default_school"],
      allow_join: allowJoin,
    })
      .then((res) => {
        if (this.data.classId) {
          Prompt.toast("保存成功", {
            switchTab: "/pages/class/index/index",
          });
        } else {
          // let pages=getCurrentPages();
          // let prvePage=pages[pages.length-2];
          // prvePage.data.classInfo={
          //   _id:res['_classid']
          // };
          // prvePage.getClassInfo();
          const eventChannel=that.getOpenerEventChannel();
          eventChannel.emit("buildClass",{
            _classid:res['_classid']
          });
          Prompt.toast("创建成功", {
            switchTab: "/pages/class/index/index",
          });
        }
      })
      .catch((res) => {
        Prompt.codeToast(res.error, res.code, {
          403: {
            4030001: "抱歉，您不允许访问",
            4030102: {
              title: "抱歉，您不允许创建班级",
              switchTab: "/pages/class/index/index",
            },
          },
        });
      });
  },
});
