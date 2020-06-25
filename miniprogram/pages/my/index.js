// pages/my/index/index.js
import Cloud from "../../source/js/cloud";
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageScrollTop: 0,
    userInfo: {
      isLogin: false,
      space_bg_image: null,
    },
    navigationIconSize: "50rpx",
    navigations: null,
    hideChangeBGImagePopup: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let userInfo = await App.getUserInfo();
    this.setData(
      {
        userInfo,
      },
      () => {
        if (userInfo["isLogin"]) {
          this.updateNavigations();
        }
      }
    );
  },
  onShow() {
    if (this.data.userInfo["isLogin"] == false && App["userInfo"]["isLogin"]) {
      this.setData(
        {
          userInfo: App["userInfo"],
        },
        () => {
          this.updateNavigations();
        }
      );
    }
  },
  onPageScroll(e) {
    this.setData({
      pageScrollTop: e.scrollTop,
    });
  },
  async getUserInfo(e) {
    let userInfo = await App.getUserInfo();
    this.setData(
      {
        userInfo,
      },
      () => {
        this.updateNavigations();
      }
    );
  },
  updateNavigations() {
    this.setData({
      navigations: [
        {
          icon: "/material/temp/1.png",
          title: "主页",
          url: "/subpages/my/space/space?userid=" + App.userInfo["_openid"],
        },
        {
          icon: "/material/temp/2.png",
          title: "帖子",
          url: "",
        },
        {
          icon: "/material/temp/3.png",
          title: "资料",
          url: "/subpages/my/edit_profile/edit_profile",
        },
        {
          icon: "/material/temp/4.png",
          title: "消息",
          url: "/subpages/my/notification/notification",
        },
        {
          icon: "/material/temp/5.png",
          title: "最近浏览",
          url: "",
        },
        {
          icon: "/material/temp/6.png",
          title: "勋章",
          url: "",
        },
        {
          icon: "/material/temp/7.png",
          title: "收藏",
          url: "/subpages/my/favorites/favorites",
        },
        {
          icon: "/material/temp/8.png",
          title: "小黑屋",
          url: "",
        },
        {
          icon: "/material/temp/9.png",
          title: "社区规范",
          url: "",
        },
        {
          icon: "/material/temp/10.png",
          title: "设置",
          url: "",
        },
      ],
    });
  },

  // 更换主页背景
  changeBGImage() {
    //系统API，让用户在相册中选择图片（或者拍照）
    wx.chooseImage({
      count: 1,
      success: (res) => {
        // 上传图片
        let filePaths = res.tempFilePaths;
        if (filePaths.length > 0) {
          wx.showLoading({
            title: "上传中",
          });
          Cloud.uploadFile(filePaths, "userBg/").then((BGImage) => {
            wx.hideLoading();
            wx.cloud
              .callFunction({
                // 要调用的云函数名称
                name: "User",
                // 传递给云函数的参数
                data: {
                  method: "updateUserBg",
                  fileId: BGImage[0],
                },
              })
              .then((res) => {
                this.setData({
                  ["userInfo.space_bg_image"]: BGImage[0],
                });
                wx.showToast({
                  title: "保存成功",
                });
              });
          });
        }
      },
    });
  },

  cancelChangeBG() {
    this.setData({
      hideChangeBGImagePopup: true,
    });
  },

  showChangeBGImagePopup() {
    this.setData({
      hideChangeBGImagePopup: false,
    });
  },
});
