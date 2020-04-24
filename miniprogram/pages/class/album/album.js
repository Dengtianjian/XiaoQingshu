// pages/class/album/album.js
import Cloud from "../../../source/js/cloud";
Page({
  async onLoad(options) {
    let classId = options.classid;
    classId = "3f8c212f5ea1af880012fed41a850048";
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
    photo: {
      page: 0,
      list: [],
      loadCount: 0,
      finished: false,
    },
    hiddenPreviewVideoPopup: true,
    currentPreviewVideo: "",
    videos: [
      {
        cover: "/material/images/index.png",
        url:
          "http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/2fcc59275285890794073114126/ySa5LZ3k4EcA.mp4",
      },
      {
        cover: "/material/images/index.png",
        url:
          "http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ee16a5285890794073203247/okwtzftAVuwA.mp4",
      },
      {
        cover: "/material/images/index.png",
        url:
          "http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ed9255285890794073203062/JyqT3zzDH4MA.mp4",
      },
      {
        cover: "/material/images/index.png",
        url:
          "http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/30287db75285890794073167278/WVQpwkgnb9EA.mp4",
      },
      {
        cover: "/material/images/index.png",
        url:
          "http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/30287db75285890794073167278/WVQpwkgnb9EA.mp4",
      },
    ],
  },

  onReachBottom() {
    this.getClassPhoto();
  },

  onPullDownRefresh() {
    this.setData({
      photo: {
        page: 0,
        list: [],
        loadCount: 0,
        finished: false,
      },
    });
    this.getClassPhoto();
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
            "photo.finished":res.data.length<15
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
  updateSwiperHeight() {
    let query = wx.createSelectorQuery();
    query.select(".album-list-photo").boundingClientRect((rect) => {
      this.setData({
        swiperHeight: rect.height,
      });
    });
    query.exec();
  },
  uploadPhoto() {
    wx.chooseImage().then((localImages) => {
      let length = this.data.photos.length;
      let arrayIndex = 0;
      localImages.tempFilePaths.forEach(async (item, index) => {
        let file = {};
        let fileName = `${Math.round(Math.random() * 100000000)}${Date.now()}`;
        let fileExtension = item.slice(item.lastIndexOf("."));
        fileName += fileExtension;
        wx.showLoading({
          title: "上传中Up up！",
        });
        await wx.cloud
          .uploadFile({
            cloudPath: `class_album/${this.data.classId}/${fileName}`,
            filePath: item,
          })
          .then((res) => {
            arrayIndex = `photos[${length + index}]`;
            file = {
              _fileid: res.fileID,
            };
            Cloud.cfunction("Class", "saveAlbum", {
              _classid: this.data.classId,
              _fileid: res.fileID,
              type: "photo",
            });
            this.setData(
              {
                [arrayIndex]: file,
              },
              () => {
                if (this.data.photos.length % 4 > 0 || localImages.length > 4) {
                  this.updateSwiperHeight();
                }
                wx.hideLoading();
              }
            );
          });
      });
    });
  },
  previewPhoto(e) {
    let index = e.currentTarget.dataset.index;
    let urls = [];
    let photos = this.data.photos;
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
          let key = `photos[${index}]`;
          _this.setData({
            [key]: "deleted",
          });
        }
      },
    });
  },
  uploadVideo() {
    let _this = this;
    let videos = this.data.videos;
    wx.chooseVideo({
      success(e) {
        wx.showLoading({
          title: "上传中",
        });
        wx.cloud.uploadFile({
          cloudPath: `${Math.random()}.jpg`,
          filePath: e.thumbTempFilePath,
          success(res) {
            wx.cloud
              .getTempFileURL({
                fileList: [
                  {
                    fileID: res["fileID"],
                  },
                ],
              })
              .then((result) => {
                videos.push({
                  url: e.tempFilePath,
                  cover: result["fileList"][0]["tempFileURL"],
                });
                _this.setData({
                  videos,
                });
                wx.hideLoading();
              });
          },
        });
      },
    });
  },
  previewVideo(e) {
    let videos = this.data.videos;
    let dataset = e.currentTarget.dataset;
    if (videos[dataset["index"]] == "deleted") {
      wx.showToast({
        title: "视频已被删除",
        icon: "none",
      });
      return;
    }
    this.setData({
      hiddenPreviewVideoPopup: false,
      currentPreviewVideo: videos[dataset["index"]]["url"],
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
          let key = `videos[${index}]`;
          _this.setData({
            [key]: "deleted",
          });
        }
      },
    });
  },
  cancelPreviewVideo() {
    this.setData({
      hiddenPreviewVideoPopup: true,
    });
  },
});
