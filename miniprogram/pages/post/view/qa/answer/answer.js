// miniprogram/pages/post/view/qa/answer/answer.js
const { Cloud, Prompt, Utils,Pagination } = require("../../../../../Qing");

Page({
  ReplyPagination: null,

  /**
   * 页面的初始数据
   */
  data: {
    comment: {
      _id: null,
    },
    replys: [],
    hiddenInputReplyPopup:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let commentId = options.commentid;
    let postId = options.postid;
    commentId = "e2297d935ec22ea600cf367a72d36abf";
    postId = "fddd30c55eacdb9d003d1f3344fa65f3";

    this.ReplyPagination=new Pagination(this,"replys",1,false,10);

    this.setData({
      comment: {
        _id: commentId,
        _post: postId,
      },
    });
    this.getComment();
  },

  onPullDownRefresh() {
    this.getComment();
  },

  /**
   * 获取评论数据
   */
  getComment() {
    wx.showLoading({
      title: "加载中",
    });
    Cloud.cfunction("Post", "getComment", {
      commentid: this.data.comment._id,
    })
      .then((comment) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        comment["date"] = Utils.formatDate(comment["date"], "y-m-d");
        this.setData({
          comment,
        });
        this.getReplys();
      })
      .catch((err) => {
        console.log(err);
        wx.hideLoading();
        wx.stopPullDownRefresh();
        Prompt.codeToast(err.error, err.code, {
          404: {
            404001: {
              title: "回答不存在或正在审核中😭",
              navigateTo:
                "/pages/post/view/qa/qa?postid=" + this.data.comment._post,
            },
          },
        });
      });
  },

  /**
   * 获取评论回复
   */
  getReplys(){
    if(this.ReplyPagination.isLoading()||this.ReplyPagination.isFinished()){
      return;
    }
    this.ReplyPagination.setLoading(true);

    Cloud.cfunction("Post","getCommentReply",{
      commentid:this.data.comment._id,
      page:this.ReplyPagination.getPage,
      limit:this.ReplyPagination.limit,
    }).then(replys=>{
      if(replys.length<this.ReplyPagination.limit){
        this.ReplyPagination.setFinished(true);
      }
      replys.forEach(item=>{
        item['date']=Utils.formatDate(item['date'],"y-m-d");
      })
      this.ReplyPagination.insert(replys);
      this.ReplyPagination.setLoading(false);
    }).catch(res=>{
      console.log(res);
    })
  },
  showCommentPopup(){
    this.setData({
      hiddenInputReplyPopup:false
    });
  },
  replyComment(e){
    console.log(e);
  }
});
