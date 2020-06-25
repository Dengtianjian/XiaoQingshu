//app.js
import Cloud from "./source/js/cloud";
wx.cloud.init({
  env: "release-6zszw",
});

App({
  onLaunch(options) {
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.share = true;
    } else {
      this.globalData.share = false;
    }
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.statusBarHeight = res.statusBarHeight;
        this.globalData.navigationBarHeight = res.statusBarHeight * 2 + 20;
      },
    });
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    this.getUserInfo();
    this.user.logging = true;
  },

  globalData: {
    share: false, // 分享默认为false
    statusBarHeight: 0,
    navigationBarHeight: 0,
  },
  userInfo: {
    isLogin: false,
  },
  user:{
    intervalHandle:null,
    finished:false,
    logging:false
  },
  async cloudGetUserInfo(userInfo) {
    let _that = this;
    return await Cloud.cfunction("User", "login", {
      info: userInfo,
    })
      .then((res) => {
        let userInfo = res;
        userInfo["isLogin"] = true;
        _that.userInfo = userInfo;
        return userInfo;
      })
      .catch((res) => {
        return _that.userInfo;
      });
  },
  async getUserInfo(userInfo = null) {
    if(this.userInfo.isLogin){
      return Promise.resolve(this.userInfo);
    }
    if (this.user.logging) {
      return new Promise((resolve, reject) => {
        this.loginHandle = setInterval(() => {
          if (this.user.finished) {
            clearInterval(this.user.intervalHandle);
            return resolve(this.userInfo);
          }
        }, 1000);
      });
    } else {
      let _that = this;
      return new Promise(async (resolve, reject) => {
        if (userInfo) {
          await this.cloudGetUserInfo(userInfo)
            .then((res) => {
              resolve(res);
            })
            .catch((res) => {
              reject(res);
            });
          wx.hideLoading();
        } else {
          await wx.getSetting().then(async (res) => {
            if (res.authSetting["scope.userInfo"]) {
              await wx
                .getUserInfo()
                .then(async (res) => {
                  userInfo = res.userInfo;
                  await this.cloudGetUserInfo(userInfo)
                    .then((res) => {
                      wx.hideLoading();
                      this.userInfo = res;

                      this.user.finished = true;
                      this.user.logging = false;

                      resolve(res);
                    })
                    .catch((res) => {
                      wx.hideLoading();

                      this.user.finished= true;
                      this.user.logging = false;

                      reject(res);
                    });
                })
                .catch((res) => {
                  wx.hideLoading();

                  this.user.finished = true;
                  this.user.logging = false;

                  reject(_that.userInfo);
                });
            } else {
              wx.hideLoading();
              this.user.finished = true;
              this.user.logging = false;
              reject(_that.userInfo);
            }
          });
        }
      });
    }
  },
});
