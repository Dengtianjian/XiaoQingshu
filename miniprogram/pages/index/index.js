//index.js
import { Cloud, Prompt, Pagination } from "../../Qing";
const App = getApp();
Page({
  data: {
    pageLoaded: false,
    postPagination: null,
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
    posts:null,
    postLoadFinished:false,
    postLoading:false,
    currentShowPostSort: "all",
    quotes: [],
  },
  async onLoad() {
    this.postPagination = new Pagination(this, "posts", 0, true, 5);
    this.postPagination.setKeyData("all");
    let setData = {
      pageLoaded: true,
    };
    await Cloud.cfunction("Post", "getSort").then((res) => {
      if (res["errMsg"] == "collection.get:ok") {
        let sorts = res["data"];
        if (sorts.length > 0) {
          sorts.forEach((item) => {
            this.postPagination.setKeyData(item["identifier"]);
          });

          let postTabs = this.data.postTabs;
          sorts.forEach((item) => {
            postTabs[item["identifier"]] = item["name"];
          });
          setData["postTabs"] = postTabs;
          setData["sorts"] = sorts;
        }
      }
    });

    this.setData(setData);
    this.getPost();
    App.getUserInfo();
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
    this.postPagination.removeKey(currentShowPostSort);
    this.getPost();
  },
  onReachBottom() {
    if (this.postPagination.isFinished(this.data.currentShowPostSort) === false) {
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
  postTabChange(e) {
    this.setData(
      {
        currentShowPostSort: e.detail.current,
        postLoadFinished:this.postPagination.isFinished(e.detail.current)
      },
      () => {
        if (
          this.postPagination.getPage(e.detail.current)==0
        ) {
          this.getPost();
        }
      }
    );
  },
  async getPost() {
    let currentShowPostSort = this.data.currentShowPostSort;
    if (
      this.postPagination.isLoading(currentShowPostSort) ||
      this.postPagination.isFinished(currentShowPostSort)
    ) {
      return;
    }
    this.postPagination.setLoading(true,currentShowPostSort);
    this.setData({
      postLoading:true
    });
    await Cloud.cfunction("Post", "getPosts", {
      page: this.postPagination.getPage(currentShowPostSort),
      sort: currentShowPostSort == "all" ? null : currentShowPostSort,
      status: "normal",
      school: null,
    }).then((res) => {
      if (res.length < this.postPagination.limit) {
        this.postPagination.setFinished(true, currentShowPostSort);
      }

      this.postPagination.insert(res, currentShowPostSort);
      this.setData({
        updateSwiperHeight: true,
        postLoading:false,
        postLoadFinished:this.postPagination.isFinished(currentShowPostSort)
      });

      this.postPagination.setLoading(false,currentShowPostSort);

      wx.stopPullDownRefresh();
    });
  },
  goToSearch() {
    Prompt.toast("🔍搜索功能还能未开放💓");
  },
});
