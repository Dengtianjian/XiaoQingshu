import {
  Pagination,
  Cloud,
  Utils,
  Prompt,
  Notification,
} from "../../../../../Qing";
const App = getApp();
export default Behavior({
  CommentPagination: null,
  data: {
    comments: [],
    commentTemplateName: "common_comment",
    hideCommentInputPopup: true,
    showCommentPrompt: false,
  },
  lifetimes: {
    attached() {
      this.CommentPagination = new Pagination(this, "comments", 2);
    },
  },
  methods: {
    onReachBottom() {
      this.getComment();
    },
    getComment() {
      if (
        this.CommentPagination.isLoading() ||
        this.CommentPagination.isFinished()
      ) {
        return;
      }
      this.CommentPagination.setLoading(true);
      let methodName = "getCommentByPostId";
      if (this.data.post.sort.identifier == "qa") {
        methodName = "getQAnswer";
      }
      Cloud.cfunction("Post", methodName, {
        _postid: this.data.post._id,
        page: this.CommentPagination.getPage(),
        limit: this.CommentPagination.limit,
      }).then((comments) => {
        comments.forEach((item) => {
          item["date"] = Utils.formatDate(item["date"], "y-m-d");
        });
        if (comments.length < this.CommentPagination.limit) {
          this.CommentPagination.setFinished(true);
          if (comments.length == 0) {
            this.setData({
              showCommentPrompt: true,
            });
          }
        }
        this.CommentPagination.insert(comments);
        this.CommentPagination.setLoading(false);
      });
    },
    async agreeAnswer({
      currentTarget: {
        dataset: { page, index },
      },
    }) {
      if (App.userInfo.isLogin == false) {
        Prompt.toast("登录后才能投票哦");
        return;
      }
      let selected = this.data.comments[page][index];
      let updateData = {
        isAgree: null,
      };
      let action = null;

      if (selected.isAgree) {
        updateData["isAgree"] = false;
        updateData["agree"] = selected["agree"] - 1;
        action = "cancelAgree";
      } else {
        updateData["isAgree"] = true;
        updateData["agree"] = selected["agree"] + 1;
        action = "agree";
      }

      await Cloud.cfunction("Post", "agreeAnswer", {
        postid: selected["_postid"],
        commentid: selected["_id"],
        action,
      }).then((res) => {
        Prompt.toast("投票成功");
      });

      this.CommentPagination.updateItem(updateData, index, page);
    },
    async disagreeAnswer({
      currentTarget: {
        dataset: { page, index },
      },
    }) {
      if (App.userInfo.isLogin == false) {
        Prompt.toast("登录后才能投票哦");
        return;
      }
      let selected = this.data.comments[page][index];
      let updateData = {
        isDisagree: false,
      };
      let action = null;
      if (selected.isDisagree) {
        updateData["isDisagree"] = false;
        updateData["disagree"] = selected["disagree"] - 1;
        action = "cancelDisagree";
      } else {
        updateData["isDisagree"] = true;
        updateData["disagree"] = selected["disagree"] + 1;
        action = "disagree";
      }

      await Cloud.cfunction("Post", "disagreeAnswer", {
        postid: selected["_postid"],
        commentid: selected["_id"],
        action,
      }).then((res) => {
        Prompt.toast("投票成功");
      });

      this.CommentPagination.updateItem(updateData, index, page);
    },
    showCommentInputPopup() {
      if (App.userInfo.isLogin == false) {
        Prompt.toast("登录后才能评论哦");
        return;
      }
      this.setData({
        hideCommentInputPopup: false,
      });
    },
    hiddenCommentInputPopup() {
      this.setData({
        commentContent: "",
        hideCommentInputPopup: true,
      });
    },
    answerQuestion(e) {
      if (App.userInfo.isLogin == false) {
        Prompt.toast("登录后才能回答问题");
        return;
      }
      let content = e.detail.content;
      wx.showLoading({
        title: "发送中",
      });
      Cloud.cfunction("Post", "saveAnswer", {
        content,
        postid: this.data.post._id,
      }).then((res) => {
        wx.hideLoading();
        let that = this;
        let comment = {
          _id: res._commentid,
          content,
          date: Utils.formatDate(Date.now(), "y-m-d"),
          _post: this.data.post._id,
          likes: 0,
          replies: 0,
          _author: App.userInfo["_id"],
          author: App.userInfo,
          agree: 0,
          disagree: 0,
        };

        this.CommentPagination.insertNew(comment);
        Prompt.toast("评论成功", {
          success() {
            that.hiddenCommentInputPopup();
          },
        });
      });
    },
    commentPost({ detail: { content } }) {
      if (App.userInfo.isLogin == false) {
        Prompt.toast("登录后才能评论的呢");
        return;
      }
      wx.showLoading({
        title: "发送中",
      });
      Cloud.cfunction("Post", "saveComment", {
        content,
        postid: this.data.post._id,
      }).then((res) => {
        wx.hideLoading();
        let that = this;
        this.CommentPagination.insertNew({
          _id: res._id,
          content,
          date: Utils.formatDate(Date.now(), "y-m-d"),
          _post: this.data.post._id,
          likes: 0,
          replies: 0,
          _author: App.userInfo["_id"],
          author: App.userInfo,
        });

        if (App.userInfo["_id"] != this.data.post._authorid) {
          Notification.send(
            "commentPost",
            "commentPost",
            {
              post_title:
                this.data.post.title || "评论了你的" + this.data.post.sort.name,
              user_nickname: App.userInfo["nickname"],
              comment_content:
                content.length > 110 ? content.substr(0, 110) + "..." : content,
              post_id: this.data.post._id,
              user_avatar: App.userInfo["avatar_url"],
            },
            App.userInfo["_id"],
            this.data.post._authorid,
            "commentAndReply",
            "评论了你的 " + this.data.post.sort.name
          );
        }
        this.setData({
          showCommentPrompt: false,
        });

        Prompt.toast("评论成功", {
          success() {
            that.hiddenCommentInputPopup();
          },
        });
      });
    },
  },
});
