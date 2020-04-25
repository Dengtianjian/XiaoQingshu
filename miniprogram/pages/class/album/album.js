// pages/class/album/album.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";
Page({
  async onLoad(options) {
    let classId = options.classid;
    this.setData({
      classId,
    });
    this.getClassPhoto();
  },

  /**
   * 页面的初始数据
   */
  data: {
    classId: "",
    tabs: {
      photo: "照片",
      video: "视频",
    },
    swiperHeight: 200,
    currentShowType: "photo",
    photo: {
      page: 0,
      list: [],
      loadCount: 0,
      finished: false,
    },
    video: {
      hiddenPopup: true,
      currentPreviewVideo: null,
      page: 0,
      list: [],
      loadCount: 0,
      finished: false,
    },
  },

  onReachBottom() {
    if (this.data.currentShowType == "photo") {
      this.getClassPhoto();
    } else {
      this.getClassVideo();
    }
  },

  onPullDownRefresh() {
    if (this.data.currentShowType == "photo") {
      this.setData({
        photo: {
          page: 0,
          list: [],
          loadCount: 0,
          finished: false,
        },
      });
      this.getClassPhoto();
    } else {
      this.setData({
        video: {
          hiddenPopup: true,
          currentPreviewVideo: null,
          page: 0,
          list: [],
          loadCount: 0,
          finished: false,
        },
      });
      this.getClassVideo();
    }
  },

  tabChange(e) {
    this.setData({
      currentShowType: e.detail.current,
    });
    if (this.data[this.data.currentShowType]["list"].length == 0) {
      if (this.data.currentShowType == "photo") {
        this.getClassPhoto();
      } else {
        this.getClassVideo();
      }
    }
  },

  getClassPhoto() {
    if (this.data.photo.loadCount == 2) {
      this.setData({
        "photo.loadCount": 0,
      });
      return;
    }
    if (this.data.photo.finished == true) {
      return;
    }

    wx.showLoading({
      title: "从相册取出中",
      mask: true,
    });
    Cloud.collection("school_class_album")
      .where({
        _classid: this.data.classId,
        type: "photo",
      })
      .limit(15)
      .skip(this.data.photo.page * 15)
      .get()
      .then((res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.length == 0) {
          this.setData({
            "photo.finished": true,
          });
          return;
        }
        this.setData(
          {
            "photo.loadCount": this.data.photo.loadCount + 1,
            "photo.page": this.data.photo.page + 1,
            "photo.finished": res.data.length < 15,
          },
          () => {
            let photosLength = this.data.photo.list.length;
            let images = res.data;
            images.forEach((item, index) => {
              this.setData({
                [`photo.list[${photosLength + index}]`]: item,
              });
            });
            this.updateSwiperHeight();
            this.getClassPhoto();
          }
        );
      });
  },
  getClassVideo() {
    if (this.data.video.loadCount == 2) {
      this.setData({
        "video.loadCount": 0,
      });
      return;
    }
    if (this.data.video.finished == true) {
      return;
    }
    wx.showLoading({
      title: "从相册取出中",
      mask: true,
    });
    Cloud.collection("school_class_album")
      .where({
        _classid: this.data.classId,
        type: "video",
      })
      .limit(15)
      .skip(this.data.video.page * 15)
      .get()
      .then((DBVideos) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (DBVideos.data.length == 0) {
          this.setData({
            "video.finished": true,
          });
          return;
        }
        DBVideos = DBVideos.data;
        this.setData(
          {
            "video.loadCount": this.data.video.loadCount + 1,
            "video.page": this.data.video.page + 1,
            "video.finished": DBVideos.length < 15,
          },
          () => {
            let videosLength = this.data.video.list.length;
            DBVideos.forEach((item, index) => {
              this.setData({
                [`video.list[${videosLength + index}]`]: item,
              });
            });
            this.updateSwiperHeight();
            this.getClassVideo();
          }
        );
      });
  },
  updateSwiperHeight() {
    let selector = `.album-list-${this.data.currentShowType}`;
    let query = wx.createSelectorQuery();
    query.select(selector).boundingClientRect((rect) => {
      this.setData({
        swiperHeight: rect.height,
      });
    });
    query.exec();
  },
  async uploadFile(tempFile) {
    let fileName = `${Math.round(Math.random() * 100000000)}${Date.now()}`;
    let fileExtension = tempFile.slice(tempFile.lastIndexOf("."));
    fileName += fileExtension;
    return await wx.cloud
      .uploadFile({
        cloudPath: `class_album/${this.data.classId}/${fileName}`,
        filePath: tempFile,
      })
      .then((res) => {
        console.log(res);
        return res.fileID;
      });
  },
  async upload() {
    let chooseFile = null;
    let length = null;
    let arrayIndex = 0;
    let that = this;
    if (this.data.currentShowType == "photo") {
      length = this.data.photo.list.length;
      chooseFile = await wx.chooseImage().then((localImages) => {
        return localImages;
      });

      chooseFile.tempFilePaths.forEach(async (item, index) => {
        wx.showLoading({
          title: "上传中Up up！",
        });
        let _fileid = await this.uploadFile(item);
        Cloud.cfunction("Class", "saveAlbum", {
          _classid: this.data.classId,
          _fileid,
          type: "photo",
        });
        arrayIndex = `photo.list[${length + index}]`;
        that.setData(
          {
            [arrayIndex]: {
              _fileid,
            },
          },
          () => {
            if (
              that.data.photo.list.length % 4 > 0 ||
              chooseFile.tempFilePaths.length > 4
            ) {
              that.updateSwiperHeight();
            }
            wx.hideLoading();
          }
        );
      });
    } else {
      length = this.data.video.list.length;
      chooseFile = await wx
        .chooseVideo({
          compressed: true,
        })
        .then((res) => {
          return res;
        });
        console.log(chooseFile);
      wx.showLoading({
        title: "上传中Up up！",
      });
      let coverFileid=null;
      if(chooseFile["thumbTempFilePath"]){
        coverFileid = await this.uploadFile(chooseFile["thumbTempFilePath"]);
      }
      let videoFileid = await this.uploadFile(chooseFile["tempFilePath"]);
      Cloud.cfunction("Class", "saveAlbum", {
        _classid: this.data.classId,
        _fileid: videoFileid,
        type: "video",
        cover: coverFileid,
        duration: chooseFile["duration"],
      }).then((res) => {
        console.log(res);
        arrayIndex = `video.list[${length}]`;
        this.setData(
          {
            [arrayIndex]: {
              _fileid: videoFileid,
              cover: coverFileid,
            },
          },
          () => {
            this.updateSwiperHeight();
            wx.hideLoading();
          }
        );
      });
    }
  },
  previewPhoto(e) {
    let index = e.currentTarget.dataset.index;
    let urls = [];
    let photos = this.data.photo.list;
    console.log(photos);
    photos.forEach((element) => {
      urls.push(element._fileid);
    });
    wx.previewImage({
      current: urls[index],
      urls,
    });
  },
  deletePhoto(e) {
    let _this = this;
    wx.showModal({
      title: "Are you 确定？",
      content: "确定要删除这张照片吗？",
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let selectPhoto=_this.data.photo.list[index];
          Cloud.cfunction("Class","deleteAlbumContent",{
            _classid:_this.data.classId,
            _fileid:selectPhoto._fileid,
            _id:selectPhoto._id,
            type:"photo"
          }).then(res=>{
            Prompt.toast("删除成功");
          })
          let key = `photo.list[${index}]`;
          _this.setData({
            [key]: "deleted",
          });
        }
      },
    });
  },
  previewVideo(e) {
    let videos = this.data.video.list;
    let dataset = e.currentTarget.dataset;
    if (videos[dataset["index"]] == "deleted") {
      wx.showToast({
        title: "视频已被删除",
        icon: "none",
      });
      return;
    }
    this.setData({
      "video.hiddenPopup": false,
      "video.currentPreviewVideo": videos[dataset["index"]]["_fileid"],
    });
  },
  deleteVideo(e) {
    let _this = this;
    wx.showModal({
      title: "Are you 确定？",
      content: "确定要删除这条视频吗？",
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let selectVideo=_this.data.video.list[index];
          Cloud.cfunction("Class","deleteAlbumContent",{
            _classid:_this.data.classId,
            _fileid:selectVideo._fileid,
            _id:selectVideo._id,
            cover:selectVideo.cover,
            type:"video"
          }).then(res=>{
            Prompt.toast("删除成功");
          });
          let key = `video.list[${index}]`;
          _this.setData({
            [key]: "deleted",
          });
        }
      },
    });
  },
  cancelPreviewVideo() {
    this.setData({
      "video.hiddenPopup": true,
    });
  },
});
