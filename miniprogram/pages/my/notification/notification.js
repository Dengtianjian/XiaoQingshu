// miniprogram/pages/my/notification/notification.js
import Cloud from "../../../source/js/cloud";
import Pagination from "../../../source/js/pagination";
import Utils from "../../../source/js/utils";
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

  showNotificationPopup({
    currentTarget: {
      dataset: { category },
    },
  }) {
    this.setData({
      isHiddenNotificationListPopup: false,
      showNotificationCategory: category,
    });
    this.setData({
      notificationLoading: this.notificationPagincation.isLoading(
        category
      ),
      notificationFinished: this.notificationPagincation.isFinished(
        category
      ),
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
    });
  },
  cleanNotification() {
    this.notificationPagincation.removeKey(this.data.showNotificationCategory);
  },
});
