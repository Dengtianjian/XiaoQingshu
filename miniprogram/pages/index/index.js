//index.js
import Cloud from "../../source/js/cloud";
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
    this.getQuotes();

    Cloud.collection("post_sort").get().then(res=>{
      this.setData({
        "publish.postType":res.data
      });
    })
  },
  onPageScroll(e){
    this.setData({
      pageScrollTop:e.scrollTop
    });
  },
  data: {
    statusBarHeight: 0,
    pageScrollTop:0,
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
      postType:[]
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
    ],
    quotes:[
      {
        content:"困难像弹簧，你弱它就强，你强它就弱。",
        likes:0
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
  },
  getQuotes(){
    Cloud.collection("quote").aggregate().sample({
      size:5
    }).end().then(res=>{
      let quotes=this.data.quotes;
      quotes.push(...res['list']);
      this.setData({
        quotes
      });
    })
  }
})
