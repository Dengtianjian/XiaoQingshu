import Prompt from "../../../../source/js/prompt";
import Cloud from "../../../../source/js/cloud";
import Utils from "../../../../source/js/utils";
const App = getApp();
module.exports = {
  data: {
    cover: null,
    favoriteAlbums: [],
  },
  saveFavoriteAlbum(e) {
    let formValue = e.detail.value;
    let { name, description } = formValue;
    if (!name) {
      Prompt.toast("请输入收藏夹名称");
      return;
    }
    let albumid=null;
    if(this.data.selectAlbum){
      albumid=this.data.selectAlbum;
    }

    wx.showLoading({
      title: "保存中",
    });
    Cloud.cfunction("User", "saveFavoriteAlbum", {
      albumid,
      name,
      description,
      cover: this.data.cover,
    }).then((res) => {
      wx.hideLoading();
      if(albumid){
        this.AlbumPagination.updateItem({
          cover: this.data.cover,
          name,
          description
        },this.currentShowAlbumIndex,this.showAlbumPage);
        wx.showToast({
          title: "保存成功",
        });
      }else{
        this.AlbumPagination.insertNew({
          _id: res._albumid,
          _userid: App.userInfo._userid,
          count: 0,
          cover: this.data.cover,
          date: Utils.formatDate(Date.now(), "y-m-d"),
          name,
          description,
        });
        wx.showToast({
          title: "创建成功",
        });
      }


      this.setData({
        isHiddenPopup: true,
      });
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
        await Cloud.uploadFile(cover, "favorite_album/").then((res) => {
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
  previewCover(){
    wx.previewImage({
      current:this.data.cover,
      urls:[this.data.cover]
    })
  }
};
