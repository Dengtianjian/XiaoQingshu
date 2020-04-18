// miniprogram/pages/my/favorites/favorites.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHiddenCreateFavoritePopup:true
  },

  showCreateFavoritePopup(){
    this.setData({
      isHiddenCreateFavoritePopup:false
    });
  },
  hiddenCreateFavoritePopup(){
    this.setData({
      isHiddenCreateFavoritePopup:true
    });
  }
})