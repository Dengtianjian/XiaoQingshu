//index.js
//获取应用实例
const app = getApp();

Page({
  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    });
  },
  onReady() {
    let query = wx.createSelectorQuery();
    query.select(`.post-swiper-item-${this.data.postSwiper.current}`).boundingClientRect();
    query.exec((res)=>{
      this.setData({
        "postSwiper.height":res[0].height
      });
    });
  },
  data: {
    statusBarHeight: 0,
    postSwiper: {
      current: 0,
      height: 0,
      tabbar: [
        "All",
        "QA",
        "Note"
      ]
    },
    publish:{
      hidden:true,
      postType:[
        {
          icon:"/material/icon/topic_type_icon.png",
          name:"topic",
          title:"话题"
        },{
          icon:"/material/icon/qa_type_icon.png",
          name:"topic",
          title:"qa"
        },{
          icon:"/material/icon/note_type_icon.png",
          name:"note",
          title:"笔记"
        }
      ]
    },
    posts:[
      {
        type:"qa"
      },{
        type:"common"
      },{
        type:"common"
      },{
        type:"common"
      },{
        type:"qa"
      }
    ]

  },
  postSwiperSwitch(e) {
    this.setData({
      "postSwiper.current": e.detail.current
    });
  },
  switchPostSwiper(e) {
    this.setData({
      "postSwiper.current": e.currentTarget.dataset.index
    });
  },
  displayPublishPopup(e){
    let dataset=e.currentTarget.dataset;
    this.setData({
      "publish.hidden":dataset.mode=="show"?false:true
    });
  }
})
