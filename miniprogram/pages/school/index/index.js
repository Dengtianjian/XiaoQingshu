// pages/school.js
import Cloud from "../../../source/js/cloud";
import Prompt from "../../../source/js/prompt";
import Utils from "../../../source/js/utils";
const App = getApp();
Page({
  sorts: null,
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
    joinedSchool: null,
    sorts: null,
    updateSwiperHeight: false,
    postTabs: {
      all: "全部",
    },
    posts: {
      all: [],
    },
    currentShowPostSort: "all",
    postLoadFinished: false,
    postLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.getUserInfo();

    await Cloud.cfunction("Post", "getSort").then((res) => {
      if (res['errMsg'] == "collection.get:ok") {
        let sorts = res["data"];
        if (sorts.length == 0) {
          return;
        }

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
          sorts,
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
    if (!this.schoolInfo && App.userInfo.school) {
      this.setData({
        schoolInfo: App.userInfo.school
      });
      this.getPost();
    }
  },
  onReachBottom() {
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
        },
        () => {
          if (userInfo["school"]) {
            this.getPost();
          }
        }
      );
    });
  },
  async getSchool() {
    await Cloud.cfunction("School", "getSchoolById", {
      _schoolid: this.data.currentSchool,
    }).then(res => {
      if (res.length == 0) {
        return;
      }
      let schoolInfo = res[0];
      App.userInfo.school = schoolInfo;
      let setData = {
        schoolInfo: schoolInfo,
        "userInfo._default_school": schoolInfo["_id"],
        [`joinedSchool.${schoolInfo["_id"]}`]: schoolInfo
      };
      this.setData(setData);
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
    if (this.data.joinedSchool != null) {
      this.setData({
        hideSwitchSchoolPopup: false,
      });
      return;
    }
    wx.showLoading({
      title: "获取已加入学校列表",
    });
    await Cloud.cfunction("User", "getJoinedSchool").then((res) => {
      res = Utils.arrayToObject(res, "_id");
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
    if (this.data.schoolInfo != null && this.data.currentSchool == this.data.schoolInfo["_id"]) {
      let setData = {
        hideSwitchSchoolPopup: true
      };
      if (Utils.getType(this.data.joinedSchool) == "Object") {
        if (
          !this.data.joinedSchool.hasOwnProperty(this.data.schoolInfo["_id"]) ||
          this.data.joinedSchool[this.data.schoolInfo["_id"]] == "deleted"
        ) {
          setData = Object.assign({
              [`joinedSchool.${this.data.schoolInfo["_id"]}`]: {
                _id: this.data.schoolInfo["_id"],
                logo: this.data.schoolInfo["logo"],
                name: this.data.schoolInfo["name"],
              },
            },
            setData
          );
        }
      }
      this.setData(setData);
      return;
    }
    wx.showLoading({
      title: "获取学校资料中",
    });
    Cloud.cfunction("User", "switchSchool", {
      _schoolid: this.data.currentSchool,
    });
    App.userInfo._default_school = this.data.currentSchool;
    await this.getSchool();
    this.getClass();
    let postSortName = Object.keys(this.data.postTabs);
    let posts = {};
    let postLoad = {};
    postSortName.forEach((item) => {
      posts[item] = [];
      postLoad[item] = {
        count: 0,
        page: 0,
        finished: false,
      };
    });
    this.setData({
      hideSwitchSchoolPopup: true,
      posts,
      currentShowPostSort: "all",
    });
    this.postLoad = postLoad;
    this.getPost();
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
          that.setData({
              currentSchool: _schoolid,
            },
            () => {
              that.confirmSwitchSchool();
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
    let selectSchool = this.data.joinedSchool[dataset.schoolid];
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

            let notDeleted = 0;
            for (let key in that.data.joinedSchool) {
              if (that.data.joinedSchool[key] != 'deleted') {
                notDeleted++;
              }
            }

            if (notDeleted <= 1) {
              setData["schoolInfo"] = null;
              setData["currentSchool"] = null;
              setData["joinedSchool"] = [];
              App.userInfo["_default_school"] = null;
              App.userInfo["school"] = null;
              Cloud.cfunction("User", "saveUserInfo", {
                _default_school: "",
                school: null,
                class: null
              });
            } else {
              setData[`joinedSchool.${selectSchool["_id"]}`] = "deleted";
              let firstSchool = Object.keys(that.data.joinedSchool)[0];
              that.setData({
                currentSchool: firstSchool
              });
              App.userInfo["_default_school"] = firstSchool;
              Cloud.cfunction("User", "saveUserInfo", {
                _default_school: firstSchool,
              });
              that.confirmSwitchSchool();
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
    all: {
      count: 0,
      page: 0,
      finished: false
    },
  },
  postTabChange(e) {
    this.setData({
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
      this.setData({
        postLoadFinished: true,
        postLoading: false
      });
      return;
    }
    this.setData({
      postLoading: true
    });
    let currentPosts = this.data.posts[currentShowPostSort];
    await Cloud.cfunction("Post", "getPosts", {
      page: currentPageLoad.page,
      sort: currentShowPostSort == "all" ? null : currentShowPostSort,
      school: this.data.schoolInfo._id,
    }).then((res) => {
      if (res.length < 5) {
        currentPageLoad.finished = true;
        this.setData({
          postLoadFinished: true
        });
      } else {
        currentPageLoad.page++;
      }
      let postPath = `posts.${currentShowPostSort}`;
      if (currentPosts.length > 0) {
        let current = currentPosts[currentPageLoad.count];
        if (current.length == 5) {
          currentPageLoad.count += 1;
          current = res;
          this.setData({
              [`${postPath}[${currentPageLoad.count}]`]: current,
            },
            () => {
              this.setData({
                updateSwiperHeight: true,
              });
            }
          );
        } else {
          this.setData({
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
        this.setData({
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
      this.setData({
        postLoading: false
      });
    });
  },
});