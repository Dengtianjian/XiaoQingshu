// miniprogram/pages/my/favorites/favorites.js
import Prompt from "../../../source/js/prompt";
import Cloud from "../../../source/js/cloud";
import Utils from "../../../source/js/utils";
import Pagination from "../../../source/js/pagination";
const Form = require("./module/edit_favorite");
const modules = {
  ...Form,
};

let AlbumPagination = null;
let FavoritePagination = null;
Page({
  onLoad() {
    FavoritePagination = new Pagination(this, "favorites", 0, true);
    AlbumPagination = new Pagination(this, "albums", 1);
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
    selectAlbum: null,
    albums: null,
  },
  onReachBottom() {
    this.getFavoriteAlbum();
  },
  favoriteLoad: {},
  getFavoriteAlbum(e) {
    if (AlbumPagination.isLoading() || AlbumPagination.isFinished()) {
      return;
    }
    AlbumPagination.setLoading();
    wx.showLoading({
      title: "加载中",
    });

    Cloud.cfunction("User", "getAlbums", {
      page: this.favoriteLoad.page,
      limit: 11,
      page: AlbumPagination.getPage(),
    }).then((albums) => {
      wx.hideLoading();
      albums.forEach((item) => {
        item["date"] = Utils.formatDate(item["date"], "y-m-d");
      });
      if (albums.length < 11) {
        AlbumPagination.setFinished();
      }
      AlbumPagination.insert(albums);
      AlbumPagination.setLoading(false);
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
      selectAlbum: albumId,
    });

    if (FavoritePagination.isFinished(albumId)) {
      return;
    }
    this.getFavorite();
  },
  getFavorite() {
    let selectAlbum = this.data.selectAlbum;
    console.log(FavoritePagination);
    if (
      FavoritePagination.isFinished(selectAlbum) ||
      FavoritePagination.isLoading(selectAlbum)
    ) {
      return;
    }
    wx.showLoading({
      title: "加载中",
    });
    Cloud.cfunction("User", "getFavorite", {
      albumid: selectAlbum,
      page: FavoritePagination.getPage(selectAlbum),
    }).then((res) => {
      wx.hideLoading();
      if(res.length==0){
        this.setData({
          templateData: {
            favorite: [],
          },
        });
      }else{
        if (FavoritePagination.getPage(selectAlbum)==0 && res.length < 12) {
          FavoritePagination.setFinished(true, selectAlbum);
        } else if (res.length < 5) {
          FavoritePagination.setFinished(true, selectAlbum);
        }

        this.setData({
          templateData: {
            favorite: this.data.favorites[`${selectAlbum}`],
          },
        });
      }

    });
  },
});
