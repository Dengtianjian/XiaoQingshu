import Cloud from "../../../source/js/cloud";

// pages/publish_post/publish_post.js
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageList: [],
    topic: null,
    currentSort: "dynamic",
    schoolInfo: null,
    schoolEntry: false,
    schoolOnly: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    options.identifier="dynamic";

    let setData = {
      currentSort: options.identifier,
      schoolEntry: options.school,
    };

    this.setData(setData);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  async onReady() {
    await App.getUserInfo().then((userInfo) => {
      if (userInfo["school"]) {
        this.setData({
          schoolInfo: userInfo["school"],
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  uploadImage() {
    let currentCount = this.data.imageList.length;
    if (currentCount >= 9) {
      wx.showToast({
        icon: "none",
        title: "最多只允许上传9张图片",
      });
      return;
    }
    wx.chooseImage({
      count: 9 - currentCount,
    }).then((res) => {
      let filePaths = res.tempFilePaths;
      if (filePaths.length > 0) {
        let imageList = this.data.imageList;
        for (let i = 0; i < filePaths.length; i++) {
          filePaths[i] = {
            id: currentCount + i,
            url: filePaths[i],
          };
        }
        imageList.unshift(...filePaths);
        this.setData({
          imageList,
        });
      }
    });
  },
  previewImage(option) {
    let index = option.currentTarget.dataset.index;
    let imageList = this.data.imageList;
    let urls = [];
    imageList.forEach((item) => {
      urls.push(item.url);
    });
    wx.previewImage({
      urls,
      current: imageList[index]["url"],
    });
  },
  goToSelectTopic() {
    let that = this;
    wx.navigateTo({
      url: "/pages/post/select_topic/select_topic",
      events: {
        selectTopic(data) {
          that.setData({
            topic: data,
          });
        },
      },
    });
  },
  savePost(option) {
    let formValue = option.detail.value;
    let school = null;
    if (this.data.schoolInfo != null) {
      if (this.data.schoolOnly) {
        school = this.data.schoolInfo["_id"];
      }
    }
    let topic = this.data.topic;
    let imageList = this.data.imageList;
    Cloud.cfunction("Post", "savePost", {
      ...formValue,
      school,
      topic,
      imageList,
      sort:this.data.currentSort
    }).then((res) => {
      console.log(res);
    });
  },
});
