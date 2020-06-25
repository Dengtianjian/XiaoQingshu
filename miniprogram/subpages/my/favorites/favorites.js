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
  FavoritePagination: null,
  AlbumPagination: null,
  onLoad() {
    FavoritePagination = new Pagination(this, "favorites", 0, true);
    AlbumPagination = new Pagination(this, "albums", 1);
    this.FavoritePagination = FavoritePagination;
    this.AlbumPagination = AlbumPagination;
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
    hasAlbums:true
  },
  onReachBottom() {
    this.getFavoriteAlbum();
  },
  favoriteLoad: {},
  getFavoriteAlbum(e) {
    if (this.AlbumPagination.isLoading() || this.AlbumPagination.isFinished()) {
      return;
    }
    this.AlbumPagination.setLoading();
    wx.showLoading({
      title: "加载中",
    });

    Cloud.cfunction("User", "getAlbums", {
      page: this.favoriteLoad.page,
      limit: 11,
      page: this.AlbumPagination.getPage(),
    }).then((albums) => {
      wx.hideLoading();
      albums.forEach((item) => {
        item["date"] = Utils.formatDate(item["date"], "y-m-d");
      });
      if (albums.length < 11) {
        this.AlbumPagination.setFinished();
        if(this.AlbumPagination.getPage()==0&&albums.length==0){
          this.setData({
            hasAlbums:false
          });
        }
      }
      this.AlbumPagination.insert(albums);
      this.AlbumPagination.setLoading(false);
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
      selectAlbum: null,
      templateData: null,
      cover: null,
    });
    this.showAlbumPage = null;
    this.currentShowAlbumIndex = null;
  },
  showAlbumPage: null,
  currentShowAlbumIndex: null,
  showFavorites({ currentTarget: { dataset } }) {
    let albumId = dataset.albumid;
    let page = dataset.page;
    let index = dataset.index;
    this.showAlbumPage = page;
    this.currentShowAlbumIndex = index;
    this.setData({
      isHiddenPopup: false,
      popupTemplateName: "album",
      selectAlbum: albumId,
      templateData: {
        favorite: [],
        album: this.data.albums[page][index],
      },
    });

    if (this.data.favorites[albumId]) {
      this.setData({
        [`templateData.favorite`]: this.data.favorites[albumId],
      });
      return;
    }

    this.getFavorite();
  },
  getFavorite() {
    let selectAlbum = this.data.selectAlbum;
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
      if (res.length == 0) {
        this.setData({
          [`templateData.favorite`]: [],
        });
      } else {
        FavoritePagination.insert(res, selectAlbum);
        if (FavoritePagination.getPage(selectAlbum) == 0 && res.length < 12) {
          FavoritePagination.setFinished(true, selectAlbum);
        } else if (res.length < 5) {
          FavoritePagination.setFinished(true, selectAlbum);
        }

        this.setData({
          [`templateData.favorite`]: this.data.favorites[`${selectAlbum}`],
        });
      }
    });
  },
  editAblum() {
    this.setData({
      popupTemplateName: "create_favorite",
      cover: this.data.templateData.album.cover,
    });
  },
  removeFavorite({
    currentTarget: {
      dataset: { page, index },
    },
  }) {
    let selectFavorite = this.data.favorites[`${this.data.selectAlbum}`][page][
      index
    ];
    Cloud.cfunction("User", "cancelFavorite", {
      contentid: selectFavorite["_contentid"],
      type: selectFavorite["type"],
    }).then((res) => {
      if (res) {
        this.FavoritePagination.removeItem(index, page, this.data.selectAlbum);
        this.setData({
          [`templateData.favorite[${page}][${index}]`]: "deleted",
        });
        Prompt.toast("移除成功");
      }
    });
  },
  deleteAlbum() {
    Cloud.cfunction("User", "deleteAlbum", {
      albumid: this.data.selectAlbum,
    }).then((res) => {
      this.AlbumPagination.removeItem(
        this.currentShowAlbumIndex,
        this.showAlbumPage
      );
      if (this.data.favorites[`${this.data.selectAlbum}`]) {
        this.FavoritePagination.removeKey(this.data.selectAlbum);
      }
      this.hiddenPopup();

      Prompt.toast("删除成功");
    });
  },
});
