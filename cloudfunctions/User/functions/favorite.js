const Response = require("../response");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Favorite = DB.collection("user_favorite");
const FavoriteAlbum = DB.collection("user_favorite_album");

let functions = {
  async getFavoriteByTypeId(event) {
    const wxContext = cloud.getWXContext();
    let type = event.type;
    let _contentid = event.contentid;

    let result = await Favorite.where({
      type,
      _contentid,
      _collector: wxContext.OPENID,
    })
      .get()
      .then((res) => res["data"]);
    if (result.length == 0) {
      return Response.result(null);
    }
    return Response.result(result[0]);
  },
  async getFavoriteByType(event) {
    const wxContext = cloud.getWXContext();
    let type = event.type;
  },
  async updateFavoriteAlbumCount(event) {
    let _id = event.albumid;
    let count = await Favorite.where({
      _album: _id,
    })
      .count()
      .then((res) => res["total"]);
    let updateResult = FavoriteAlbum.doc(_id)
      .update({
        data: { count },
      })
      .then((res) => {
        return res;
      });
    return Response.result(updateResult);
  },
  async cancelFavorite(event) {
    const wxContext = cloud.getWXContext();
    let type = event.type;
    let _contentid = event.contentid;

    let favorite = await Favorite.where({
      _collector: wxContext.OPENID,
      type,
      _contentid,
    })
      .get()
      .then((res) => res["data"]);
    if (favorite.length == 0) {
      return Response.result("取消收藏成功");
    }
    favorite = favorite[0];
    await Favorite.where({
      _collector: wxContext.OPENID,
      type,
      _contentid,
    })
      .remove()
      .then((res) => {
        if (res["stats"]["removed"]) {
          FavoriteAlbum.doc(favorite["_album"]).update({
            data: { count: _.inc(-1) },
          });
        }
      });

    return Response.result("取消收藏成功");
  },
  async addFavorite(event) {
    const wxContext = cloud.getWXContext();
    let type = event.type;
    let _contentid = event.contentid;
    let _album = event.album;

    let favorite = await Favorite.where({
      type,
      _contentid,
      _collector: wxContext.OPENID,
    })
      .get()
      .then((res) => res["data"]);
    if (favorite.length > 0) {
      return Response.error(409, 409001, "您已收藏，请勿重复收藏");
    }
    let album = await FavoriteAlbum.doc(_album)
      .get()
      .then((res) => res["data"]);
    if (album.length == 0) {
      return Response.error(404, 404001, "收藏夹不存在");
    }

    let addResult = await Favorite.add({
      data: {
        type,
        _contentid,
        _collector: wxContext.OPENID,
        _album,
        date: Date.now(),
      },
    }).then((res) => res);
    if (addResult["errMsg"] == "collection.add:ok" && addResult["_id"]) {
      FavoriteAlbum.doc(_album).update({
        data: {
          count: _.inc(1),
        },
      });
      return Response.result("收藏成功");
    }
    return Response.error(500, 500001, "收藏失败，请稍后重试");
  },
  async getAlbums(event) {
    const wxContext = cloud.getWXContext();
    let page = event.page || 0;
    let limit = event.limit || 5;

    let albums = await FavoriteAlbum.where({
      _userid: wxContext.OPENID,
    })
      .limit(limit)
      .skip(limit * page)
      .get()
      .then((res) => {
        return res;
      });
    return Response.result(albums);
  },
};

module.exports = functions;
