// miniprogram/pages/post/view/index/index.js
import Favorite from "./module/favorite";
import Comment from "./module/comment";
import { Notification, Cloud, Prompt, Utils } from "../../../../Qing";

const App = getApp();
Page({
  behaviors: [Favorite, Comment],
  /**
   * 页面的初始数据
   */
  data: {
    post: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _postid = options.postid;

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

  onShareAppMessage: function () {
    let post = this.data.post;
    let config = {
      title: post.title,
      path: "/pages/post/view/index/index?postid=" + post["_id"],
    };
    if (post.images.length > 0) {
      config["imageUrl"] = post["images"][0];
    }
    return config;
  },
  onPullDownRefresh() {
    this.getPost();
  },
  onReachBotom() {
    this.getComment();
  },
  templateName: ["qa", "common"],
  getPost() {
    wx.showLoading({
      title: "全速加载中",
    });

    Cloud.cfunction("Post", "getPost", {
      postid: this.data.post._id,
    }).then(async (post) => {
      wx.hideLoading();
      wx.stopPullDownRefresh();

      let setData = { post };
      post["date"] = Utils.formatDate(post["date"], "y年m月d");

      await Cloud.cfunction("Post", "getSortByIdentifier", {
        identifier: post["sort"]["identifier"],
      })
        .then((res) => {
          setData["post"]["sort"] = res;
          if (this.templateName.includes(res["identifier"])) {
            setData["commentTemplateName"] = res["identifier"] + "_comment";
          } else {
            setData["commentTemplateName"] = "common_comment";
          }
        })
        .catch((res) => {
          if (res.error == 404) {
            setData["post"]["sort"] = null;
          }
        });

      await App.getUserInfo();
      if (post["_authorid"] == App.userInfo["_id"]) {
        let school = {};
        if (App.userInfo["_default_school"]) {
          school = {
            name: App.userInfo["school"]["name"],
          };
        }
        let schoolClass=App.userInfo["class"]?{}:null;
        if(schoolClass){
          schoolClass={
            prefessional: App.userInfo["class"]["profession"]
          }
        }
        setData["post"]["author"] = {
          nickname: App.userInfo["nickname"],
          avatar_url: App.userInfo["avatar_url"],
          _id: App.userInfo["_userid"],
          _default_school: App.userInfo["_default_school"],
          class: schoolClass,
          school,
        };
      } else {
        await Cloud.cfunction("User", "getUser", {
          _openid: post["_authorid"],
        }).then((user) => {
          if (user.length == 0) {
            setData["post"]["author"] = {
              _id: null,
              nickname: "同学被隐藏了",
              avatar_url: "/material/images/anonymous_user.png",
            };
          } else {
            setData["post"]["author"] = user;
          }
        });
      }

      this.setData(setData);

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
          if (App.userInfo["_id"] != this.data.post._authorid) {
            Notification.send(
              "likePost",
              "likePost",
              {
                user_nickname: App.userInfo["nickname"],
                post_id: this.data.post._id,
                user_avatar: App.userInfo["avatar_url"],
                post_type: this.data.post.sort.identifier,
                post_type_name: this.data.post.sort.name,
                post_title:
                  this.data.post.title || "赞了你的" + this.data.post.sort.name,
              },
              App.userInfo["_id"],
              this.data.post._authorid,
              "likeAndAgree",
              "赞了你的 " + this.data.post.sort.name
            );
          }
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
                    [`post.likes`]: that.data.post.likes + 1,
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
});
