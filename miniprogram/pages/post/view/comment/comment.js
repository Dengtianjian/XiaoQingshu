// miniprogram/pages/post/view/comment/comment.js
const { Cloud, Prompt, Utils,Pagination } = require("../../../../Qing");
const App=getApp();
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
    hiddenInputReplyPopup:true,
    commentContent:"",
    inputContent:""
  },

   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let commentId = options.commentid;
    let postId = options.postid;
    // commentId = "e2297d935ec22ea600cf367a72d36abf";
    // postId = "fddd30c55eacdb9d003d1f3344fa65f3";

    this.ReplyPagination=new Pagination(this,"replys",2,false,6);

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

  onReachBottom(){
    this.getReplys();
  },

  /**
   * 获取评论数据
   */
  getComment() {
    wx.showLoading({
      title: "加载中",
    });
    Cloud.cfunction("Post", "getComment", {
      commentid: this.data.comment._id
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
      page:this.ReplyPagination.getPage(),
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
  showCommentPopup({ currentTarget:{ dataset:{reply,type} } }){
    if(reply){
      reply.type=type;
      this.reply=reply;
    }else{
      this.reply={
        type
      };
    }
    this.setData({
      hiddenInputReplyPopup:false
    });
  },
  hideCommentPopup(){
    this.setData({
      hiddenInputReplyPopup:true,
      inputContent:""
    });
  },
  reply:{
    type:"replyComment",
  },
  async replyComment(e){
    let content=e.detail.content;

    wx.showLoading({
      title: "发送中",
    });

    let replyReply={};
    if(this.reply.type=="replyReply"){
      replyReply['_replyid']=this.reply._id;
      replyReply['reply_author']={
        nickname:this.reply.author['nickname'],
        _id:this.reply.author['_id']
      };
    }
    await Cloud.cfunction("Post", "replyComment", {
      content,
      _commentid:this.data.comment["_id"],
      _postid: this.data._post,
      ...replyReply
    }).then((res) => {
      wx.hideLoading();
      Prompt.toast("回复成功", {
        icon: "success",
      });

      this.ReplyPagination.insertNew({
        _id: res._replyid,
        content:content,
        commentid: this.data.comment["_id"],
        postid: this.data._post,
        date: Utils.formatDate(Date.now(), "y-m-d"),
        ...replyReply,
        author: {
          _id: App.userInfo["_id"],
          avatar_url: App.userInfo["avatar_url"],
          nickname: App.userInfo["nickname"],
          school: App.userInfo["school"]
        }
      });
      this.hideCommentPopup();
    });
  }
})