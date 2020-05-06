// miniprogram/pages/my/favorites/favorites.js
import Prompt from "../../../source/js/prompt";
import Cloud from "../../../source/js/cloud";
import Utils from "../../../source/js/utils";
const Form = require("./module/edit_favorite");
const modules = {
  ...Form,
};

Page({
  onLoad() {
    this.getFavoriteAlbum();
  },

  /**
   * 页面的初始数据
   */
  ...modules,
  data: {
    ...modules.data,
    isHiddenPopup: true,
    popupTemplateName: "",
    templateData: {},
    favorites: {},
    selectAlbum:null
  },
  favoriteLoad: {},
  getFavoriteAlbum(e) {
    if (this.favoriteLoad.loading || this.favoriteLoad.finished) {
      return;
    }
    wx.showLoading({
      title: "加载中",
    });

    Cloud.cfunction("User", "getAlbums", {
      page: this.favoriteLoad.page,
      limit: 20,
    }).then((albums) => {
      wx.hideLoading();
      albums.forEach((item) => {
        item["date"] = Utils.formatDate(item["date"], "y-m-d");
        if (this.favoriteLoad[item["_id"]] == undefined) {
          this.favoriteLoad[item["_id"]] = {
            finished: false,
            page: 0,
            loading: false,
            count: 0,
          };
        }
      });
      this.setData({
        favoriteAlbums: albums,
      });
    });
  },

  showCreateFavoritePopup() {
    this.setData({
      isHiddenPopup: false,
      popupTemplateName: "create_favorite",
    });
  },
  hiddenPopup() {
    this.setData({
      isHiddenPopup: true,
      popupTemplateName: "",
    });
  },
  selectAlbum: null,
  showFavorites({ currentTarget: { dataset } }) {
    let albumId = dataset.albumid;
    this.setData({
      isHiddenPopup: false,
      popupTemplateName: "favorite_list",
      selectAlbum:albumId
    });

    if (this.favoriteLoad[albumId] == undefined) {
      this.favoriteLoad[albumId] = {
        finished: false,
        page: 0,
        loading: false,
        count: 0,
      };
    }
    if(this.data.favorites[albumId]==undefined){
      this.setData({
        [`favorites.${albumId}`]:[[]]
      });
    }
    if (this.favoriteLoad[albumId].finished) {
      return;
    }
    this.getFavorite();
  },
  getFavorite() {
    let selectAlbum= this.data.selectAlbum;
    let favoirteLoad = this.favoriteLoad[selectAlbum];

    if (favoirteLoad.finished || favoirteLoad.loading) {
      return;
    }
    // if(this.data.favorites[this.selectAlbum][favoirteLoad["count"]]&&this.data.favorites[this.selectAlbum][favoirteLoad["count"]].length>=5){
    //   favoirteLoad['count']++;
    // }
    wx.showLoading({
      title: "加载中",
    });
    Cloud.cfunction("User", "getFavorite", {
      albumid: selectAlbum,
      page: favoirteLoad.page,
    }).then((res) => {
      if(favoirteLoad["count"]==0&&res.length<12){
        favoirteLoad['finished']=true;
      }else if(res.length<5){
        favoirteLoad['finished']=true;
      }else{
        favoirteLoad['page']++;
      }
      let current=this.data.favorites[selectAlbum][favoirteLoad["count"]];
      if(current==undefined){
        current=res;
      }else{
        current.push(...res);
      }

      this.setData({
        [`favorites.${selectAlbum}[${favoirteLoad["count"]}]`]:current
      });

      this.favoriteLoad[selectAlbum]=favoirteLoad;
      this.setData({
        templateData:{
          favorite:this.data.favorites[`${selectAlbum}`]
        }
      });
    });
  },
});
