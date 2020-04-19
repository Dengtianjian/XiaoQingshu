// miniprogram/pages/my/edit_profile/edit_profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatar: "",
  },

  onLoad(){

  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
    }).then((res) => {
      let tempFile = res["tempFilePaths"][0];
      if(this.data.avatar==""){
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
      }
      this.setData({
        avatar: tempFile,
      });

    });
  },
  pewviewAvatar() {
    if (this.data.avatar == "") {
      return;
    }
    wx.previewImage({
      urls: [this.data.avatar],
    });
  },
});
