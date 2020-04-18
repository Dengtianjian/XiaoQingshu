// miniprogram/pages/my/notification/notification.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHiddenNotificationListPopup:true
  },

  showNotificationPopup(){
    this.setData({
      isHiddenNotificationListPopup:false
    });
  },
  hiddenNotificationListPopup(){
    this.setData({
      isHiddenNotificationListPopup:true
    });
  },
  cleanNotification(){

  }
})