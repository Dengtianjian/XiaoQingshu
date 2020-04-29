// pages/my/index/index.js
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageScrollTop: 0,
    userInfo: {
      isLogin: false,
    },
    navigationIconSize: "50rpx",
    navigations: null,
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
        console.log(userInfo);
        if (userInfo["isLogin"]) {
          this.updateNavigations();
        }
      }
    );
  },
  onShow() {
    if (this.data.userInfo["isLogin"] == false && App["userInfo"]["isLogin"]) {
      this.setData({
        userInfo: App["userInfo"],
      },()=>{
        this.updateNavigations();
      });
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
          url: "/pages/my/space/space?userid=" + App.userInfo["_openid"],
        },
        {
          icon: "/material/temp/2.png",
          title: "帖子",
          url: "",
        },
        {
          icon: "/material/temp/3.png",
          title: "资料",
          url: "/pages/my/edit_profile/edit_profile",
        },
        {
          icon: "/material/temp/4.png",
          title: "消息",
          url: "/pages/my/notification/notification",
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
          url: "/pages/my/favorites/favorites",
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
});
