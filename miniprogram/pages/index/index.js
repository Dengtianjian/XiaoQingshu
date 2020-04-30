//index.js
import Cloud from "../../source/js/cloud";
//获取应用实例
const app = getApp();

Page({
  onLoad() {
    this.getPost();
  },
  onReady() {
    this.getQuotes();

    Cloud.collection("post_sort").get().then(res=>{
      this.setData({
        "publish.postType":res.data
      });
    });
  },
  onPageScroll(e){
    this.setData({
      pageScrollTop:e.scrollTop
    });
  },
  data: {
    postTabs:{
      all:"全部",
      qa:"问答",
      note:"笔记"
    },
    updateSwiperHeight:false,
    pageScrollTop:0,
    publish:{
      hidden:true,
      postType:[]
    },
    posts:[],
    quotes:[
      {
        content:"困难像弹簧，你弱它就强，你强它就弱。",
        likes:0
      }
    ]
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
  },
  async getPost(){
    await Cloud.cfunction("Post","getPost").then(res=>{
      this.setData({
        posts:res,
        updateSwiperHeight:true
      });
    })
  }
})
