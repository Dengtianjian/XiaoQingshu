// miniprogram/pages/my/edit_profile/edit_profile.js
import Cloud from "../../../source/js/cloud";
import Utils from "../../../source/js/utils";
import Prompt from "../../../source/js/prompt";
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatar: "",
    userInfo: "",
  },

  async onLoad(options) {
    wx.showLoading({
      title:"获取资料中"
    });
    App.getUserInfo().then((userInfo) => {
      userInfo["birthday"] = Utils.formatDate(userInfo["birthday"], "y-m-d");
      this.setData({
        userInfo,
      },()=>{
        wx.hideLoading();
      });
    });
  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
    }).then((res) => {
      let tempFile = res["tempFilePaths"][0];
      if (this.data.userInfo["avatar_url"] == "") {
        this.showPreviewAvatar();
      }
      this.setData({
        "userInfo.avatar_url": tempFile,
      });
    });
  },
  showPreviewAvatar() {
    this.animate(
      ".change-avatar-overlay-preview",
      [
        {
          opacity: 0,
          width: 0,
        },
        {
          opacity: 1,
          width: "40%",
        },
      ],
      500
    );
  },
  previewAvatar() {
    wx.previewImage({
      urls: [this.data.userInfo.avatar_url],
    });
  },
  bindDateChange(e) {
    let value = e.detail.value;
    this.setData({
      "userInfo.birthday": value,
    });
  },
  saveProfile(e) {
    let {
      birthday,
      education,
      email,
      phone_number,
      realname,
      statement,
    } = e.detail.value;
    if (!/^1[3-9]\d{9}$/.test(phone_number)) {
      Prompt.toast("请输入正确的手机号码，仅限中国大陆的");
      return;
    }
    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\@[a-zA-Z0-9]{1,10}\.[a-zA-Z0-9\.]{1,20}$/.test(
        email
      )
    ) {
      Prompt.toast("请输入正确的邮箱地址");
      return;
    }

    Cloud.cfunction("User", "saveUserProfile", {
      birthday,
      education,
      email,
      phone_number,
      realname,
      statement,
    }).then((res) => {
      if(res['result']['errMsg']=="collection.update:ok"){
        Prompt.toast("保存成功👌");
      }
    }).catch(res=>{
      Prompt.codeToast(res.error,res.code,{
        400:{
          400001:"请输入正确的手机号码，仅限中国大陆的",
          400002:"请输入正确的邮箱地址"
        }
      })
    })
  },
});
