// miniprogram/pages/my/post/post.js
import Pagination from "../../../source/js/pagination";
import Cloud from "../../../source/js/cloud.js";
const App=getApp();
Page({
  PostPagination:null,
  /**
   * 页面的初始数据
   */
  data: {
    posts:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    this.PostPagination=new Pagination(this,"posts");
    await App.getUserInfo();
    this.getUserPost();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.PostPagination.isFinished()==false||this.PostPagination.isLoading()==false){
      this.getUserPost();
    }
  },
  getUserPost(){
    if(this.PostPagination.isFinished()||this.PostPagination.isLoading()){
      return;
    }
    this.PostPagination.setLoading(true);
    Cloud.cfunction("Post","getPostByUser",{
      page:this.PostPagination.getPage(),
      limit:this.PostPagination.limit,
      userid:App.userInfo['_userid'],
      status:"all"
    }).then(res=>{
      if(res.length<this.PostPagination.limit){
        this.PostPagination.setFinished(true);
      }
      this.PostPagination.insert(res);
      this.PostPagination.setLoading(false);
    });
  }
})