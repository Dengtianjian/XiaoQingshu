//app.js
import Cloud from "./source/js/cloud";
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
  },

  globalData: {
    share: false, // 分享默认为false
    statusBarHeight: 0,
    navigationBarHeight: 0,
  },
  userInfo: {
    isLogin: false,
  },
  async cloudGetUserInfo(userInfo) {
    let _that = this;
    return await Cloud.cfunction("User", "getUserInfo", {
      info: userInfo,
    })
      .then((res) => {
        if (_that.isLogin) {
          return;
        }
        let userInfo = res;
        userInfo["isLogin"] = true;
        _that.userInfo = userInfo;
        wx.setStorage({
          key:"userInfo",
          data:userInfo
        });
        return userInfo;
      })
      .catch((res) => {
        console.log(res);
        if (_that.isLogin) {
          return;
        }
        return _that.userInfo;
      });
  },
  async getUserInfo(userInfo = null) {
    let _that = this;
    return new Promise(async (resolve, reject) => {
      if (userInfo) {
        await this.cloudGetUserInfo(userInfo).then(res=>{
          resolve(res);
        }).catch(res=>{
          reject(res);
        });
      } else {
        await wx.getSetting().then(async (res) => {
          if (res.authSetting["scope.userInfo"]) {
            if (_that.isLogin) {
              return;
            }
            await wx.getUserInfo()
              .then(async (res) => {
                if (_that.isLogin) {
                  return;
                }
                userInfo = res.userInfo;
                await this.cloudGetUserInfo(userInfo).then(res=>{
                  resolve(res);
                }).catch(res=>{
                  reject(res);
                })
              })
              .catch((res) => {
                console.log(res);
                if (_that.isLogin) {
                  return;
                }
                reject(_that.userInfo);
              });
          } else {
            if (_that.isLogin) {
              return;
            }
            reject(_that.userInfo);
          }
        });
      }
    });
  },
});
