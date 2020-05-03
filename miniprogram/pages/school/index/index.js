// pages/school.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageScrollTop: 0,
    pageLoadingCompleted: false,
    userIsLogin: false,
    currentSchool: null,
    schoolInfo: null,
    hideSwitchSchoolPopup: true,
    joinedSchool: [],
    sorts: null,
    updateSwiperHeight: false,
    postTabs: {
      all: "全部",
    },
    posts: {
      all: [],
    },
    currentShowPostSort: "all",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.getUserInfo();

    Cloud.collection("post_sort")
      .get()
      .then((res) => {
        if (res["data"].length > 0) {
          let sorts = res["data"];
          let postTabs = this.data.postTabs;
          let posts = this.data.posts;
          let postLoad = this.postLoad;
          sorts.forEach((item) => {
            postTabs[item["identifier"]] = item["name"];
            posts[item["identifier"]] = [];
            postLoad[item["identifier"]] = {
              count: 0,
              page: 0,
              finished: false,
            };
          });
          this.postLoad = postLoad;
          this.setData({
            postTabs,
            posts,
          });
        }
      });
  },
  onPageScroll(e) {
    this.setData({
      pageScrollTop: e.scrollTop,
    });
  },
  onReady() {
    this.setData({
      pageLoadingCompleted: true,
    });
  },
  onShow() {
    if (this.data.userIsLogin == false && App.userInfo["isLogin"]) {
      this.setData({
        userIsLogin: true,
      });
    }
  },
  onReachBottom(){
    this.getPost();
  },
  getUserInfo(e) {
    let userInfo = null;
    if (e) {
      userInfo = e.detail.userInfo;
    }
    wx.showLoading({
      title: "登录中",
    });
    App.getUserInfo(userInfo).then((userInfo) => {
      wx.hideLoading();
      this.setData({
        userIsLogin: userInfo.isLogin,
        schoolInfo: userInfo["school"],
        currentSchool: userInfo["school"] ? userInfo["school"]["_id"] : null,
        pageLoadingCompleted: true,
      },()=>{
        if(userInfo['school']){
          this.getPost();
        }
      });

    });
  },
  async getSchool() {
    await Cloud.collection("school")
      .where({
        _id: this.data.currentSchool,
      })
      .get()
      .then((res) => {
        if (res["data"].length == 0) {
          return;
        }
        App.userInfo.school = res["data"][0];
        this.setData({
          schoolInfo: res["data"][0],
          "userInfo._default_school": res["data"][0]["_id"],
        });
      });
  },
  async getClass() {
    App.userInfo["class"] = null;
    await Cloud.cfunction("Class", "getClassBySchoolId", {
      _schoolid: this.data.currentSchool,
    })
      .then((res) => {
        App.userInfo["class"] = res;
      })
      .catch((res) => {
        App.userInfo["class"] = null;
      });
  },
  async showSwitchSchoolPopup() {
    wx.showLoading({
      title: "获取已加入学校列表",
    });
    await Cloud.cfunction("User", "getJoinedSchool").then((res) => {
      this.setData({
        joinedSchool: res,
        hideSwitchSchoolPopup: false,
      });
      wx.hideLoading();
    });
  },
  async switchSchool(e) {
    let currentSchool = e.currentTarget.dataset.schoolid;
    this.setData({
      currentSchool,
    });
  },
  async confirmSwitchSchool() {
    if (this.data.currentSchool == this.data.schoolInfo["_id"]) {
      return;
    }
    wx.showLoading({
      title: "获取学校资料中",
    });
    Cloud.cfunction("User", "saveUserInfo", {
      _default_school: this.data.currentSchool,
    });
    App.userInfo._default_school = this.data.currentSchool;
    await this.getSchool();
    this.getClass();
    this.setData({
      hideSwitchSchoolPopup: true,
    });

    wx.hideLoading();
  },
  cancelSwitchSchool() {
    this.setData({
      currentSchool: this.data.schoolInfo["_id"],
      hideSwitchSchoolPopup: true,
    });
  },
  goToSelectSchool() {
    let that = this;
    wx.navigateTo({
      url: "/pages/school/select_school/select_school",
      events: {
        changeSchool(data) {
          let _schoolid = data._schoolid;
          that.setData(
            {
              currentSchool: _schoolid,
            },
            () => {
              that.getSchool();
              that.getClass();
            }
          );
        },
      },
      success() {
        that.setData({
          hideSwitchSchoolPopup: true,
        });
      },
    });
  },
  quitSchool(e) {
    let that = this;
    let dataset = e.currentTarget.dataset;
    let selectSchool = this.data.joinedSchool[dataset.index];
    wx.showModal({
      title: "退出学校",
      content: `确定要退出 ${selectSchool["name"]}`,
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: "擦除信息中",
          });
          Cloud.cfunction("User", "quitSchool", {
            _schoolid: selectSchool["_id"],
          }).then((res) => {
            wx.hideLoading();
            Prompt.toast("再见，同学们会💭想念你的");
            let setData = {
              hideSwitchSchoolPopup: true,
            };
            if (that.data.joinedSchool.length == 1) {
              setData["schoolInfo"] = null;
              setData["currentSchool"] = null;
              setData["joinedSchool"] = [];
              App.userInfo["_default_school"] = null;
              App.userInfo["school"] = null;
              Cloud.cfunction("User", "saveUserInfo", {
                _default_school: "",
              });
            } else {
              let loadIndex = dataset.index == 0 ? 1 : 0;
              App.userInfo["_default_school"] =
                that.data.joinedSchool[loadIndex];
              App.userInfo["school"] = v.data.joinedSchool[loadIndex];
              setData["schoolInfo"] = that.data.joinedSchool[loadIndex];
              setData["currentSchool"] =
                that.data.joinedSchool[loadIndex]["_id"];
              let joinedSchool = that.data.joinedSchool;
              joinedSchool.splice(dataset.index, 1);
              setData["joinedSchool"] = joinedSchool;
            }

            that.setData(setData, () => {
              that.getClass();
            });
          });
        }
      },
    });
  },
  postLoad: {
    all: { count: 0, page: 0, finished: false },
  },
  postTabChange(e) {
    this.setData(
      {
        currentShowPostSort: e.detail.current,
      },
      () => {
        if (
          !this.data.posts[this.data.currentShowPostSort][
            this.postLoad[this.data.currentShowPostSort].count
          ] ||
          this.data.posts[this.data.currentShowPostSort][
            this.postLoad[this.data.currentShowPostSort].count
          ].length == 0
        ) {
          this.getPost();
        }
      }
    );
  },
  async getPost() {
    let currentShowPostSort = this.data.currentShowPostSort;
    let currentPageLoad = this.postLoad[currentShowPostSort];
    if (currentPageLoad.finished) {
      return;
    }
    let currentPosts = this.data.posts[currentShowPostSort];
    await Cloud.cfunction("Post", "getPosts", {
      page: currentPageLoad.page,
      sort: currentShowPostSort == "all" ? null : currentShowPostSort,
      school:this.data.schoolInfo._id
    }).then((res) => {
      if (res.length < 5) {
        currentPageLoad.finished = true;
      } else {
        currentPageLoad.page++;
      }
      let postPath = `posts.${currentShowPostSort}`;
      if (currentPosts.length > 0) {
        let current = currentPosts[currentPageLoad.count];
        if (current.length == 5) {
          currentPageLoad.count += 1;
          current = res;
          this.setData(
            {
              [`${postPath}[${currentPageLoad.count}]`]: current,
            },
            () => {
              this.setData({
                updateSwiperHeight: true,
              });
            }
          );
        } else {
          this.setData(
            {
              [`${postPath}[${currentPageLoad.count}]`]: current,
            },
            () => {
              this.setData({
                updateSwiperHeight: true,
              });
            }
          );
        }
      } else {
        this.setData(
          {
            [`${postPath}[0]`]: res,
          },
          () => {
            this.setData({
              updateSwiperHeight: true,
            });
          }
        );
      }
      wx.stopPullDownRefresh();
    });
  },
});
