module.exports = {
  navigate(config) {
    if (config.switchTab) {
      setTimeout(() => {
        wx.switchTab({
          url: config.switchTab,
        });
      }, config.duration);
    } else if (config.reLaunch) {
      setTimeout(() => {
        wx.reLaunch({
          url: config.reLaunch,
        });
      }, config.duration);
    } else if (config.redirectTo) {
      setTimeout(() => {
        wx.redirectTo({
          url: config.redirectTo,
        });
      }, config.duration);
    } else if (config.navigateTo) {
      setTimeout(() => {
        wx.navigateTo({
          url: config.navigateTo,
        });
      }, config.duration);
    } else if (config.navigateBack) {
      setTimeout(() => {
        console.log(config);
        wx.navigateBack();
      }, config.duration);
    }
  },
  toast(title, conf = {}) {
    let _this = this;
    let config = {
      title,
      icon: conf["icon"] ? conf["icon"] : "none",
      success() {
        if (config.succeeded) {
          config.succeeded();
        }
      },
      fail() {
        if (config.failed) {
          config.failed();
        }
      },
      complete() {
        if (config.completed) {
          config.completed();
        }
        _this.navigate(config);
      },
    };
    if (conf.success) {
      config["succeeded"] = conf.success;
      delete conf["success"];
    }
    if (conf.fail) {
      config["failed"] = conf.fail;
      delete conf["fail"];
    }
    if (conf.complete) {
      config["completed"] = conf.complete;
      delete conf["complete"];
    }
    if (conf.duration) {
      config["duration"] = conf.duration;
      delete conf["duration"];
    } else {
      config["duration"] = 1500;
    }
    config = Object.assign(config, conf);
    wx.showToast(config);
  },
  codeToast(error, code, message) {
    wx.hideToast();
    let current = message[error][code];
    if (typeof current == "object") {
      this.toast(current["title"], current);
    } else {
      this.toast(current);
    }
  },
};
