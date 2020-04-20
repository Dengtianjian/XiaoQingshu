//app.js
wx.cloud.init({
  env: "develogment-env",
});

App({
  onLaunch(options) {
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.share = true;
    } else {
      this.globalData.share = false;
    }
    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    //这个最初我是在组件中获取，但是出现了一个问题，当第一次进入小程序时导航栏会把
    //页面内容盖住一部分,当打开调试重新进入时就没有问题，这个问题弄得我是莫名其妙
    //虽然最后解决了，但是花费了不少时间
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.statusBarHeight = res.statusBarHeight;
        this.globalData.navigationBarHeight = res.statusBarHeight * 2 + 20;
      },
    });
    this.getUserInfo();
    this.isLogining = true;
  },

  globalData: {
    share: false, // 分享默认为false
    statusBarHeight: 0,
    navigationBarHeight: 0,
  },
  userInfo: {
    isLogin: false,
  },
  getUserInfo() {
    let that = this;
    if (this.userInfo.isLogin == true) {
      return Promise.resolve(this.userInfo);
    } else {
      return new Promise((resolve) => {
        wx.getSetting({
          async success(res) {
            if (res.authSetting["scope.userInfo"]) {
              await wx.getUserInfo({
                async success(res) {
                  let userInfo = {
                    isLogin: true,
                    cloudID: res.cloudID,
                    ...res.userInfo,
                  };
                  await wx.cloud
                    .callFunction({
                      name: "getUserInfo",
                    })
                    .then((res) => {

                      userInfo = Object.assign(userInfo, res.result);
                    });
                  that.userInfo = userInfo;

                  resolve(userInfo);
                },
              });
            }else{
              resolve(that.userInfo);
            }
          },
        });
      });
    }
  },
});
