const Response = require("../response");
const Utils = require("../Utils");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env:"release-6zszw"
});

const DB = cloud.database();
const _ = DB.command;
const Favorite = DB.collection("user_favorite");
const FavoriteAlbum = DB.collection("user_favorite_album");

let functions = {
  async saveFavoriteAlbum(event) {
    const wxContext = cloud.getWXContext();
    let { name, description, cover, albumid } = event;

    if (!name) {
      return Response.error(400, 400001, "请输入收藏集名称");
    }

    if (albumid) {
      let updateResult = await FavoriteAlbum.doc(albumid)
        .update({
          data: {
            name,
            description,
            cover,
          },
        })
        .then((res) => res)
        .catch((res) => res);
      if (updateResult.errCode) {
        return Response.error(updateResult);
      }

      return Response.result(updateResult);
    } else {
      let addResult = await FavoriteAlbum.add({
        data: {
          name,
          description,
          cover,
          date: Date.now(),
          count: 0,
          _userid: wxContext.OPENID,
        },
      }).then((res) => res);

      if (addResult["errMsg"] == "collection.add:ok") {
        return Response.result({
          _albumid: addResult["_id"],
        });
      }
    }
  },
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
      return Response.result(true);
    }
    favorite = favorite[0];
    await Favorite.where({
      _collector: wxContext.OPENID,
      type,
      _contentid,
    })
      .remove();
      await FavoriteAlbum.doc(favorite["_album"]).update({
        data: { count: _.inc(-1) },
      });

    return Response.result(true);
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
      await FavoriteAlbum.doc(_album).update({
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
    return Response.result(albums["data"]);
  },
  async getFavorite(event) {
    const wxContext = cloud.getWXContext();
    let albumId = event.albumid;
    let page = event.page || 0;
    let limit = event.limit || 10;

    let favorites = await Favorite.where({
      _collector: wxContext.OPENID,
      _album: albumId,
    })
      .limit(limit)
      .skip(limit * page)
      .get()
      .then((res) => {
        return res["data"];
      });
    let postId = [];
    if (favorites.length == 0) {
      return Response.result([]);
    }
    favorites.forEach((item) => {
      postId.push(item._contentid);
    });

    let posts = await cloud
      .callFunction({
        name: "Post",
        data: {
          method: "getPost",
          postid: postId,
        },
      })
      .then((res) => {
        return res.result;
      });
    posts = Utils.arrayToObject(posts, "_id");
    favorites.forEach((item) => {
      item["post"] = posts[item["_contentid"]];
    });

    return favorites;
  },
  async deleteAlbum({ albumid }) {
    const wxContext = cloud.getWXContext();
    let album = await FavoriteAlbum.where({
      _userid: wxContext.OPENID,
      _id: albumid,
    })
      .get()
      .then((res) => res["data"]);
      if(album.length>0){
        await FavoriteAlbum.doc(albumid).remove().catch(res=>console.log(res));
      }
    Favorite.where({
      _album: albumid,
    }).remove();
    return Response.result(true);
  },
};

module.exports = functions;
