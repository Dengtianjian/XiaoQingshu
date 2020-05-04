// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("../response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const PostLike = DB.collection("post_like");

let functions = {
  async likePost(event) {
    const wxContext = cloud.getWXContext();
    let _postid = event.postid;

    let like = await PostLike.where({
      _post: _postid,
      _liker: wxContext.OPENID,
    })
      .get()
      .then((res) => res["data"]);
    if (like.length > 0) {
      return Response.error(409, 409001, "您已点赞过了，请勿重复点赞");
    }

    let addResult = await PostLike.add({
      data: {
        _post: _postid,
        _liker: wxContext.OPENID,
        date: Date.now(),
      },
    }).then((res) => res);
    if (addResult["errMsg"] == "collection.add:ok") {
      DB.collection("post")
        .doc(_postid)
        .update({
          data: {
            likes: _.inc(1),
          },
        });
      return Response.result("点赞成功");
    }
  },
  async cancelLikePost(event) {
    const wxContext = cloud.getWXContext();
    let _postid = event.postid;

    await PostLike.where({
      _post:_postid,
      _liker:wxContext.OPENID
    }).remove(res=>{
      if(res['stats']['removed']){
        DB.collection("post").doc(_postid).update({
          data:{
            likes:_.inc(-1)
          }
        });
      }
    });

    return Response.result("取消点赞成功");

  },
};
module.exports = functions;
