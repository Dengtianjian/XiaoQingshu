//index.js
import { Cloud, Prompt } from "../../Qing";
const App = getApp();
Page({
  data: {
    pageLoaded: false,
    sorts: null,
    postTabs: {
      all: "全部",
    },
    updateSwiperHeight: false,
    pageScrollTop: 0,
    publish: {
      hidden: true,
      postType: [],
    },
    posts: {
      all: [],
    },
    currentShowPostSort: "all",
    quotes: [],
  },
  async onLoad() {
    let setData = {
      pageLoaded: true,
    };
    await App.getUserInfo();
    await Cloud.cfunction("Post", "getSort").then((res) => {
      if (res["errMsg"] == "collection.get:ok") {
        let sorts = res["data"];
        if (sorts.length > 0) {
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
          setData["postTabs"] = postTabs;
          setData["posts"] = posts;
          setData["sorts"] = sorts;
        }
      }
    });

    this.setData(setData);
    this.getPost();
  },
  onReady() {
    this.getQuotes();
  },
  onPageScroll(e) {
    this.setData({
      pageScrollTop: e.scrollTop,
    });
  },
  onPullDownRefresh() {
    let currentShowPostSort = this.data.currentShowPostSort;
    this.postLoad[currentShowPostSort] = { count: 0, page: 0, finished: false };
    this.setData(
      {
        [`posts.${currentShowPostSort}`]: [],
      },
      () => {
        this.getPost();
      }
    );
  },
  onReachBottom() {
    if (this.postLoad[this.data.currentShowPostSort].finished === false) {
      this.getPost();
    }
  },
  displayPublishPopup(e) {
    let dataset = e.currentTarget.dataset;
    this.setData({
      "publish.hidden": dataset.mode == "show" ? false : true,
    });
  },
  getQuotes() {
    Cloud.callFun("Extensions", "getQuotes", {
      limit: 5,
    }).then((quotes) => {
      this.setData({
        quotes,
      });
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
      status: "normal",
      school: null,
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
  goToSearch() {
    Prompt.toast("🔍搜索功能还能未开放💓");
  },
});
