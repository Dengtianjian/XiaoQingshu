import Prompt from "../../../../source/js/prompt";
import Cloud from "../../../../source/js/cloud";
import Utils from "../../../../source/js/utils";
module.exports = {
  data: {
    cover:
      "http://t7.baidu.com/it/u=378254553,3884800361&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1589169855&t=3e37029d66bc7f846964fe3637d711a3",
      favoriteAlbums:[]
  },
  saveFavoriteAlbum(e) {
    let formValue = e.detail.value;
    let { name, description } = formValue;
    if (!name) {
      Prompt.toast("请输入收藏夹名称");
      return;
    }

    wx.showLoading({
      title: "保存中",
    });
    Cloud.cfunction("User", "saveFavoriteAlbum", {
      name,
      description,
      cover: this.data.cover,
    }).then((res) => {
      wx.hideLoading();
      console.log(res);
    });
  },
  uploadCover(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      async success(res) {
        let cover = res.tempFilePaths[0];
        wx.showLoading({
          title: "上传中 Up!",
        });
        await Utils.uploadFile(cover, "favorite_album/").then((res) => {
          that.setData({
            cover: res,
            "templateData.cover": res,
          });
          wx.hideLoading();
          Prompt.toast("保存成功");
        });
      },
    });
  },
};
