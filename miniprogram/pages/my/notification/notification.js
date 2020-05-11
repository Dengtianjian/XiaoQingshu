// miniprogram/pages/my/notification/notification.js
import Cloud from "../../../source/js/cloud";
import Pagination from "../../../source/js/pagination";
import Utils from "../../../source/js/utils";
const App=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    types: [],
    notification: {},
    showNotificationCategory: null,
    isHiddenNotificationListPopup: true,
    notificationLoading: false,
    notificationFinished: false,
    templateName:"common"
  },
  notificationPagincation: null,

  onLoad() {
    this.getNotificationType();
    this.notificationPagincation = new Pagination(
      this,
      "notification",
      0,
      true,
      6
    );
  },

  getNotificationType() {
    Cloud.callFun("Notification", "getAllCategory").then((types) => {
      types.forEach((item) => {
        if (item["latest"]) {
          item["latest"]["date"] = Utils.formatDate(item["latest"]["date"]);
        }
      });
      this.setData({
        types,
      });
    });
  },

  showNotificationPopup(event) {
    let dataset=event.currentTarget.dataset;
    let category=dataset.category;
    let templateName=dataset.templatename||"common";
    this.setData({
      isHiddenNotificationListPopup: false,
      showNotificationCategory: category,
      notificationLoading: this.notificationPagincation.isLoading(category),
      notificationFinished: this.notificationPagincation.isFinished(category),
      templateName
    });
    if (!this.data.notification[`${category}`]) {
      this.getNotification();
    }
  },
  getNotification() {
    let currentShowCategory = this.data.showNotificationCategory;
    if (
      this.notificationPagincation.isLoading(currentShowCategory) ||
      this.notificationPagincation.isFinished(currentShowCategory)
    ) {
      return;
    }
    this.notificationPagincation.setLoading(true, currentShowCategory);
    if (this.notificationPagincation.getPage() == 0) {
      wx.showLoading({
        title: "疯狂加载中",
      });
    }
    this.setData({
      notificationLoading: true,
    });
    Cloud.callFun("Notification", "getNotification", {
      page: this.notificationPagincation.getPage(currentShowCategory),
      limit: this.notificationPagincation.limit,
      category: currentShowCategory,
      updateRead: true,
    }).then((notifications) => {
      if (notifications.length < this.notificationPagincation.limit) {
        this.notificationPagincation.setFinished(true, currentShowCategory);
        this.setData({
          notificationFinished: true,
        });
      }
      notifications.forEach((item) => {
        item["date"] = Utils.formatDate(item["date"], "y-m-d");
      });
      if (notifications.length > 0) {
        this.notificationPagincation.insert(
          notifications,
          this.data.showNotificationCategory
        );
      }

      this.notificationPagincation.setLoading(false, currentShowCategory);
      wx.hideLoading();
      this.setData({
        notificationLoading: false,
      });
    });
  },
  hiddenNotificationListPopup() {
    this.setData({
      isHiddenNotificationListPopup: true,
      notificationLoading: false,
      notificationFinished: false,
      templateName:"common"
    });
  },
  cleanNotification() {
    this.notificationPagincation.removeKey(this.data.showNotificationCategory);
  },
  sendNotification() {
    Cloud.callFun("Notification", "send", {
      type: "favoritePost",
      post_id: "fddd30c55eacf20e003e17c7705d1583",
      user_nickname: App.userInfo['nickname'],
      user_avatar:App.userInfo['avatar_url'],
      category:"likeAndAgree",
      sender:App.userInfo['_userid'],
      receiver:"oKXC25AAuW_-T7GFRm8g3k0AeAA0",
      post_type:"dynamic",
      post_type_name:"动态",
      prompt:"收藏了你的动态",
      typeTemplate:"likeFavorite",
      post_title:"第三章计算机📡网络技术基础"
    }).then((res) => console.log(res));
  },
});
