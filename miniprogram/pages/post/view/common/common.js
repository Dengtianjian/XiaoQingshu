// pages/post/view/view.js
import Cloud from "../../../../source/js/cloud";
import Prompt from "../../../../source/js/prompt";
import Utils from "../../../../source/js/utils";

const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navigationBarHeight: 0,
    pageLoaded: false,
    post: {
      title: "广东确定开学时间，“乐疯的”家长还需站好最后一岗",
      author: {
        nickname: "May",
        avatar:
          "https://template.canva.cn/EADcc0Btzak/1/0/400w-4d-QTEYrdNI.jpg",
        school: "西南大学",
        prefessional: "金融",
        isAttention: false,
      },
      content: `“神兽回归！👨老师们辛苦了”，这恐怕是很多家长在
      4月9日下午得知广东省开学时间后 😄
      特别是中小学开学时间后的心情。广东省新冠肺
      炎疫情防控指挥部经研究决定，全省各级各类学校学生
      📅4月27日起，分期、分批、错峰返校。
      大家用“重磅”“终于”“广东退出群聊”表达着
      内心的激动🤩`,
      images: [
        "https://template.canva.cn/EADcCF_XVWk/1/0/400w-j88eWZY7WPo.jpg",
        "https://template.canva.cn/EADcCqn6Y9M/1/0/400w-i6daPhDo2K4.jpg",
        "https://template.canva.cn/EADhZkiUSdg/1/0/400w-P_Ai1uZE8Lo.jpg",
        "https://template.canva.cn/EADcCNWSPPg/1/0/400w-Ox2UTg-Ww-Y.jpg",
      ],
      type: "qa",
      topic: "全国性哀悼活动",
      dataline: "昨晚 凌晨02:45",
    },
    comments: [[]],
    currentShowComment: null,
    currentShowCommentArrayReplyIndex: null,
    currentShowCommentReplyIndex: null,
    currentShowCommentReply: null,
    selectReplyreplyIndex: null,
    replyReply: null,
    commentReply: {},
    isHiddenCommentPopup: true,
    hiddenCommentPopupTextarea: true,
    isHiddenCommentReplyPopup: true,
    sendType: "comment",
    favorite: {
      popupIsHide: true,
      currentSelect: 0,
      albums: [],
    },
    templateName: "common",
    templateData: {},
  },
  onLoad(options) {
    let _postid = options.postid;
    // _postid = "fddd30c55eacdb9d003d1f3344fa65f3";

    this.setData(
      {
        post: {
          _id: _postid,
        },
      },
      () => {
        this.getPost();
      }
    );
  },
  async onReady() {
    if (this.userInfo == null) {
      this.userInfo = await App.getUserInfo().then((r) => r);
    }
    this.setData({
      navigationBarHeight: App.globalData.navigationBarHeight,
    });
  },
  onShareAppMessage: function () {
    let post = this.data.post;
    let config = {
      title: post.title,
      path: "/pages/post/view/view?postid=" + post["_id"],
    };
    if (post.images.length > 0) {
      config["imageUrl"] = post["images"][0];
    }
    return config;
  },
  onPullDownRefresh() {
    this.getPost();
  },
  getPost() {
    wx.showLoading({
      title: "全速加载中",
    });
    Cloud.cfunction("Post", "getPost", {
      postid: this.data.post._id,
    }).then(async (post) => {
      wx.hideLoading();
      wx.stopPullDownRefresh();

      Cloud.cfunction("Post", "getLikeByPostId", {
        postid: post["_id"],
      }).then((res) => {
        if (res) {
          this.setData({
            [`post.isLike`]: true,
          });
        }
      });
      Cloud.cfunction("User", "getFavoriteByTypeId", {
        contentid: post["_id"],
        type: "post",
      }).then((res) => {
        if (res) {
          this.setData({
            [`post.isFavorite`]: true,
          });
        }
      });

      let setData = { post, pageLoaded: true };
      post["date"] = Utils.formatDate(post["date"], "y年m月d");

      await Cloud.cfunction("Post", "getSortByIdentifier", {
        identifier: post["sort"]["identifier"],
      })
        .then((res) => {
          setData["post"]["sort"] = res;
          setData["templateName"] = res.template;
        })
        .catch((res) => {
          if (res.error == 404) {
            setData["post"]["sort"] = null;
          }
        });

      await App.getUserInfo();
      if (post["_authorid"] == App.userInfo["_userid"]) {
        let school = {};
        if (App.userInfo["_default_school"]) {
          console.log(App.userInfo["_default_school"]);
          school = {
            name: App.userInfo["school"]["name"],
          };
        }
        console.log(school);
        setData["post"]["author"] = {
          nickname: App.userInfo["nickname"],
          avatar_url: App.userInfo["avatar_url"],
          _id: App.userInfo["_userid"],
          school: App.userInfo["school"]["name"],
          _default_school: App.userInfo["_default_school"],
          class: {
            prefessional: App.userInfo["class"]["profession"],
          },
          school,
        };
      } else {
        await Cloud.cfunction("User", "getUser", {
          _openid: post["_authorid"],
        }).then((res) => {
          setData["author"] = res;
        });
      }
      this.setData(setData);
      this.getComment();

      wx.hideLoading();
    });
  },
  likePost() {
    if (this.data.post.isLike) {
      Cloud.cfunction("Post", "cancelLikePost", {
        postid: this.data.post._id,
      }).then((res) => {
        this.setData({
          [`post.isLike`]: false,
          [`post.likes`]: this.data.post.likes - 1,
        });
      });
    } else {
      Cloud.cfunction("Post", "likePost", {
        postid: this.data.post._id,
      })
        .then((res) => {
          this.setData({
            [`post.isLike`]: true,
            [`post.likes`]: this.data.post.likes + 1,
          });
        })
        .catch((res) => {
          let that = this;
          Prompt.codeToast(res.error, res.code, {
            409: {
              409001: {
                title: "已经点赞过了",
                success() {
                  that.setData({
                    [`post.isLike`]: true,
                    [`post.likes`]: this.data.post.likes + 1,
                  });
                },
              },
            },
          });
        });
    }
  },
  previewImage(e) {
    let index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.post.images[index],
      urls: this.data.post.images,
    });
  },
  commentLoad: {
    count: 1,
    finished: false,
    page: 0,
  },
  userInfo: null,
  async publishComment(e) {
    let formValue = e.detail.value;
    wx.showLoading({
      title: "发送中",
    });
    Cloud.cfunction("Post", "saveComment", {
      content: formValue.content,
      postid: this.data.post._id,
    }).then((res) => {
      wx.hideLoading();
      let that = this;
      let comments = this.data.comments[0];
      console.log(res);
      comments.unshift({
        _id: res._id,
        content: formValue.content,
        date: Utils.formatDate(Date.now(), "y-m-d"),
        _post: this.data.post._id,
        likes: 0,
        replies: 0,
        _author: this.userInfo["_id"],
        author: this.userInfo,
      });
      this.setData({
        [`comments[0]`]: comments,
      });
      Prompt.toast("评论成功", {
        success() {
          that.hiddenCommentPopup();
        },
      });
    });
  },
  commentSubmit(e) {
    let sendType = this.data.sendType;
    if (sendType == "postComment") {
      this.publishComment(e);
    } else if (sendType == "replyComment" || sendType == "replyReply") {
      this.replyComment(e);
    }
  },
  getComment() {
    if (this.commentLoad.finished) {
      return;
    }
    Cloud.cfunction("Post", "getCommentByPostId", {
      postid: this.data.post._id,
      page: this.commentLoad.page,
    }).then((comments) => {
      let arrayPath = null;
      let current = null;
      comments.forEach((item) => {
        item["date"] = Utils.formatDate(item["date"], "y-m-d");
      });
      if (
        this.data.comments[this.commentLoad.count] &&
        this.data.comments[this.commentLoad.count].length < 5
      ) {
        current = this.data.comments[this.commentLoad.count];
        current.push(...comments);
        arrayPath = `comments[${this.commentLoad.count}]`;
      } else {
        current = comments;
        arrayPath = `comments[${this.commentLoad.count}]`;
      }
      this.commentLoad.page++;
      if (comments.length < 5) {
        this.commentLoad.finished = true;
      } else {
        this.commentLoad.count++;
      }
      this.setData({
        [arrayPath]: current,
      });
    });
  },
  showCommentPopup(e) {
    let dataset = e.currentTarget.dataset;
    let type = dataset.type;
    let setData = {
      isHiddenCommentPopup: false,
      sendType: type,
    };
    if (type == "replyReply") {
      setData["replyReply"] = dataset["reply"];
    }
    this.setData(setData);
    this.animate(
      ".comment-post-form",
      [{ top: "100%", ease: "ease-out" }, { top: 0 }],
      300,
      () => {
        this.setData({
          hiddenCommentPopupTextarea: false,
        });
      }
    );
  },
  hiddenCommentPopup() {
    this.animate(
      ".comment-post-form",
      [{ top: "0" }, { top: "-100%" }],
      300,
      () => {
        this.setData({
          isHiddenCommentPopup: true,
          hiddenCommentPopupTextarea: true,
        });
      }
    );
  },
  showAllCommentReply(e) {
    let dataset = e.currentTarget.dataset;
    let index = dataset.index;
    let arrayIndex = dataset.arrayindex;
    this.setData(
      {
        currentShowComment: this.data.comments[arrayIndex][index],
        currentShowCommentArrayReplyIndex: arrayIndex,
        currentShowCommentReplyIndex: index,
        isHiddenCommentReplyPopup: false,
      },
      () => {
        this.getCommentReply();
      }
    );
  },
  commentReplyLoad: {},
  async getCommentReply() {
    let arrayReplyIndex = this.data.currentShowCommentArrayReplyIndex;
    let replyIndex = this.data.currentShowCommentReplyIndex;
    let currentReply = this.data.commentReply[
      arrayReplyIndex + "-" + replyIndex
    ];
    let currentReplyPath = `commentReply.${arrayReplyIndex}-${replyIndex}`;
    let currentReplyLoad = this.commentReplyLoad[
      `'${arrayReplyIndex}-${replyIndex}'`
    ];
    let comment = this.data.currentShowComment;

    if (currentReply == undefined) {
      this.setData({
        [currentReplyPath]: { 0: [] },
      });
    }
    let current = [];
    if (currentReplyLoad == undefined) {
      currentReplyLoad = {
        finished: false,
        page: 0,
        count: 0,
        loading: false,
      };
    }

    if (currentReplyLoad.finished) {
      return;
    }
    if (currentReplyLoad.loading) {
      return;
    }
    if (
      this.commentReplyLoad[`'${arrayReplyIndex}-${replyIndex}'`] == undefined
    ) {
      this["commentReplyLoad"][`'${arrayReplyIndex}-${replyIndex}'`] = {
        loading: true,
      };
    } else {
      this["commentReplyLoad"][`'${arrayReplyIndex}-${replyIndex}'`][
        "loading"
      ] = true;
    }

    Cloud.cfunction("Post", "getCommentReply", {
      commentid: comment["_id"],
      page: currentReplyLoad.page,
      limit: 7,
    }).then((replys) => {
      if (replys.length < 7) {
        currentReplyLoad.finished = true;
      }
      replys.forEach((item) => {
        item["date"] = Utils.formatDate(item["date"], "y-m-d");
      });
      currentReplyLoad.page++;
      currentReplyLoad.count++;
      this.setData({
        [`${currentReplyPath}.${currentReplyLoad.count}`]: current.concat(
          replys
        ),
        currentShowCommentReply: currentReplyPath,
      });
      currentReplyLoad["loading"] = false;
      console.log(currentReplyLoad);
      this["commentReplyLoad"][
        `'${arrayReplyIndex}-${replyIndex}'`
      ] = currentReplyLoad;
      console.log(
        this["commentReplyLoad"][`'${arrayReplyIndex}-${replyIndex}'`]
      );
    });
  },
  async replyComment(e) {
    let formValue = e.detail.value;

    wx.showLoading({
      title: "发送中",
    });
    let replyReply = {};
    if (this.data.replyReply) {
      let replyReplyData = this.data.replyReply;
      replyReply = {
        replyid: replyReplyData["_id"],
        replyauthor: replyReplyData["author"]["nickname"],
      };
      console.log(replyReply);
    }

    await Cloud.cfunction("Post", "replyComment", {
      content: formValue["content"],
      commentid: this.data.currentShowComment["_id"],
      postid: this.data.post["_id"],
      ...replyReply,
    }).then((res) => {
      wx.hideLoading();
      Prompt.toast("回复成功", {
        icon: "success",
      });
      let arrayReplyIndex = this.data.currentShowCommentArrayReplyIndex;
      let replyIndex = this.data.currentShowCommentReplyIndex;
      let arr = this.data.commentReply[arrayReplyIndex + "-" + replyIndex]["0"];
      if (arr == undefined) {
        arr = [];
      }
      arr.unshift({
        _id: res._replyid,
        content: formValue["content"],
        commentid: this.data.currentShowComment["_id"],
        postid: this.data.post["_id"],
        _reply_author: replyReply["replyauthor"],
        _replyid: replyReply["replyid"],
        date: Utils.formatDate(Date.now(), "y-m-d"),
        author: {
          _id: this.userInfo["_id"],
          avatar_url: this.userInfo["avatar_url"],
          nickname: this.userInfo["nickname"],
          school: this.userInfo["school"]
            ? {
                _id: this.userInfo["school"]["_id"],
                name: this.userInfo["school"]["name"],
              }
            : null,
        },
      });
      this.setData({
        [`commentReply.${arrayReplyIndex}-${replyIndex}.0`]: arr,
        replyReply: null,
      });
    });
  },
  changeSelectAlbum(e) {
    this.setData({
      ["favorite.currentSelect"]: e.currentTarget.dataset.index,
    });
  },
  favoriteLoad: {
    loading: false,
    finished: false,
    count: 0,
    page: 0,
  },
  async getFavoriteAblum() {
    if (this.favoriteLoad.loading || this.favoriteLoad.finished) {
      return;
    }
    this.favoriteLoad.loading = true;
    await Cloud.cfunction("User", "getAlbums", {
      limit: 12,
      page: this.favoriteLoad.page,
    }).then((res) => {
      if (res.length < 12) {
        this.favoriteLoad.finished = true;
      }
      if (res.length == 12) {
        this.favoriteLoad.page++;
      }
      let albums = this.data.favorite.albums;
      albums.push(...res);
      this.setData({
        ["favorite.albums"]: albums,
      });
      this.favoriteLoad.loading = false;
    });
  },
  showFavoriteAlbum() {
    if (this.data.post.isFavorite) {
      Cloud.cfunction("User", "cancelFavorite", {
        type: "post",
        contentid: this.data.post._id,
      }).then((res) => {
        this.setData({
          [`post.isFavorite`]: false,
        });
      });
      return;
    }
    this.setData({
      [`favorite.popupIsHide`]: false,
    });
    if (this.data.favorite.albums.length == 0) {
      this.getFavoriteAblum();
    }
  },
  confirmFavorite() {
    wx.showLoading({
      title: "存放到收藏夹中",
    });
    let currentAlbum = this.data.favorite.albums[
      this.data.favorite.currentSelect
    ];
    Cloud.cfunction("User", "addFavorite", {
      type: "post",
      contentid: this.data.post._id,
      album: currentAlbum["_id"],
    })
      .then((res) => {
        wx.hideLoading();
        let albumCountPath = `favorite.albums[${this.data.favorite.currentSelect}].count`;
        this.setData({
          [`post.isFavorite`]: true,
          [albumCountPath]: currentAlbum.count + 1,
          [`post.popupIsHide`]: true,
        });
        Prompt.toast("嘻🤭嘻，收藏成功✨");
      })
      .catch((res) => {
        wx.hideLoading();
        let that = this;
        Prompt.codeToast(res.error, res.code, {
          404: {
            404001: "收藏夹不存在",
          },
          409: {
            409001: {
              title: "已经收藏这个帖子了，请勿重复收藏",
              success() {
                that.setData({
                  [`post.isFavorite`]: true,
                });
              },
            },
          },
        });
      });
  },
});
