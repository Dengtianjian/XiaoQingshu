import { Pagination,Cloud,Prompt } from "../../../../../Qing";
export default Behavior({
  FavoritePagination:null,
  data:{
    favorite: {
      popupIsHide: true,
      currentSelect: "0-0",
      albums: [],
    },
  },
  lifetimes:{
    attached(){
      this.FavoritePagination=new Pagination(this,"favorite.albums",0,false,10);
    }
  },
  methods:{
    changeSelectAlbum(e) {
      this.setData({
        ["favorite.currentSelect"]: e.currentTarget.dataset.index,
      });
    },
    async getFavoriteAblum() {
      if (this.FavoritePagination.isLoading() || this.FavoritePagination.isFinished()) {
        return;
      }
      this.FavoritePagination.setLoading(true);
      await Cloud.cfunction("User", "getAlbums", {
        limit: this.FavoritePagination.limit,
        page: this.FavoritePagination.getPage(),
      }).then((albums) => {
        if (albums.length < this.FavoritePagination.limit) {
          this.FavoritePagination.setFinished(true);
        }
        this.FavoritePagination.insert(albums);
        this.FavoritePagination.setLoading(false);
      });
    },
    showFavoriteAlbum() {
      if (this.data.post.isFavorite) {
        Cloud.cfunction("User", "cancelFavorite", {
          type: "post",
          contentid: this.data.post._id,
        }).then((res) => {
          this.setData({
            [`post.isFavorite`]: false,
          });
        });
        return;
      }
      this.setData({
        [`favorite.popupIsHide`]: false,
      });
      if (this.data.favorite.albums.length == 0) {
        this.getFavoriteAblum();
      }
    },
    confirmFavorite() {
      wx.showLoading({
        title: "存放到收藏夹中",
      });
      let splitSelect=this.data.favorite.currentSelect.split("-");
      let page=splitSelect[0];
      let index=splitSelect[1];
      let currentAlbum = this.data.favorite.albums[
        page
      ][index];

      Cloud.cfunction("User", "addFavorite", {
        type: "post",
        contentid: this.data.post._id,
        album: currentAlbum["_id"],
      })
        .then((res) => {
          wx.hideLoading();
          let albumCountPath = `favorite.albums[${page}][${index}].count`;
          this.setData({
            [`post.isFavorite`]: true,
            [albumCountPath]: currentAlbum.count + 1,
            [`post.popupIsHide`]: true,
          });
          Prompt.toast("嘻🤭嘻，收藏成功✨");
        })
        .catch((res) => {
          wx.hideLoading();
          let that = this;
          Prompt.codeToast(res.error, res.code, {
            404: {
              404001: "收藏夹不存在",
            },
            409: {
              409001: {
                title: "已经收藏这个帖子了，请勿重复收藏",
                success() {
                  that.setData({
                    [`post.isFavorite`]: true,
                  });
                },
              },
            },
          });
        });
    }
  }
})