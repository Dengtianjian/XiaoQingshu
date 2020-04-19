// miniprogram/pages/my/favorites/favorites.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHiddenPopup:true,
    popupTemplateName:""
  },

  showCreateFavoritePopup(){
    this.setData({
      isHiddenPopup:false,
      popupTemplateName:"create_favorite"
    });
  },
  hiddenPopup(){
    this.setData({
      isHiddenPopup:true,
      popupTemplateName:""
    });
  },
  showFavoriteListPopup(){
    this.setData({
      isHiddenPopup:false,
      popupTemplateName:"favorite_list"
    });
  }
})