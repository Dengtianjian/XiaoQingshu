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

    console.log(options);

    if (!options.classid) {
      wx.setNavigationBarTitle({
        title: "创建班级",
      });
      let date = new Date();
      let dateString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      this.setData({
        buildDate: dateString,
      });
    } else {
      wx.setNavigationBarTitle({
        title: "编辑班级信息",
      });
      let classInfo = await Cloud.cfunction("Class", "getClassByClassId", {
        _id: this.data.classInfo._id,
      }).then((classInfo) => {
        if (classInfo) {
          return classInfo;
        } else {
          Prompt.toast("班级不存在😟", {
            switchTab: "/pages/class/index/index",
          });
        }
      });
      this.setData({
        classId: options["classid"],
        classInfo,
        buildDate: Utils.formatDate(classInfo["build_date"], "y-m-d"),
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
    let that = this;
    let value = e.detail.value;
    let profession = value.profession;
    let buildDate = Date.parse(value.build_date);
    let gradeNumber = value.grade_number;
    let allowJoin = Boolean(value.allow_join);

    let classInfo = {
      profession,
      build_date: buildDate,
      number: gradeNumber,
      _schoolid: App.userInfo["_default_school"],
      allow_join: allowJoin,
      grade: new Date(buildDate).getFullYear(),
    };
    Cloud.cfunction("Class", "saveClassInfo", classInfo)
      .then((res) => {
        const eventChannel = that.getOpenerEventChannel();
        if (this.data.classId) {
          App["userInfo"]["class"] = Object.assign(
            this.data.classInfo,
            classInfo
          );
          eventChannel.emit("editClass", classInfo);
          Prompt.toast("保存成功", {
            switchTab: "/pages/class/index/index",
          });
        } else {
          eventChannel.emit("buildClass", {
            _classid: res["_classid"],
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
