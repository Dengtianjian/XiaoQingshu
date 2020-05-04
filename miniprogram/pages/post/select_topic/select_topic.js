// pages/post/select_topic/select_topic.js
import Cloud from "../../../source/js/cloud";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    topics: [],
    finished: false,
    searchTopics: [],
    isSearch: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getTopic();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.finished == false) {
      this.getTopic();
    }
  },
  searchHandle:null,
  keyInputChange(e) {
    let value = e.detail.value;
    if ((value != "") != this.data.isSearch) {
      this.setData({
        isSearch: value != "",
      });
    }

    Cloud.collection("post_topic").where({
      name:Cloud.DB().RegExp({
        regexp:`.*${value}.*`,
        options:"i"
      })
    }).get().then(res=>{
      this.setData({
        searchTopics:res['data']
      });
    });
    return value;
  },
  selectTopic(e) {
    let index = e.currentTarget.dataset.index;
    let selectTopic = null;
    if(this.data.isSearch){
      selectTopic=this.data.searchTopics[index];
    }else{
      selectTopic=this.data.topics[index]
    }
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("selectTopic", selectTopic);
    wx.navigateBack();
  },
  async getTopic() {
    if (this.data.finished) {
      return;
    }
    wx.showLoading({
      title: "加载中",
    });
    await Cloud.collection("post_topic")
      .limit(17)
      .skip(this.data.page * 17)
      .get()
      .then((res) => {
        this.setData({
          finished: res.data.length < 17,
          page: this.data.page + 1,
        });
        if (res.data.length > 0) {
          let length = this.data.topics.length;
          res.data.forEach((item, index) => {
            this.setData({
              [`topics[${length + index}]`]: item,
            });
          });
        }
        wx.hideLoading();
      });
  },
});
