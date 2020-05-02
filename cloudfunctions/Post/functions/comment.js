const cloud = require("wx-server-sdk");
const Response = require("../response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Comment = DB.collection("post_comment");
const CommentLike = DB.collection("post_comment_like");

function arrayToObject(array, key) {
  let obj = {};
  array.forEach((item) => {
    obj[item[key]] = item;
  });
  return obj;
}
let functions = {
  async saveComment(event) {
    const wxContext = cloud.getWXContext();
    let _post = event.postid;
    let content = event.content;
    let images = event.images;

    let addResult = await Comment.add({
      data: {
        content,
        images,
        date: Date.now(),
        _post,
        likes: 0,
        replies: 0,
        _author: wxContext.OPENID,
        videos: [],
      },
    }).then((res) => res);
    if (addResult["errMsg"] == "collection.add:ok") {
      DB.collection("post")
        .doc(_post)
        .update({
          data: {
            replies: _.inc(1),
          },
        });
      return Response.result({
        _id: addResult["_id"],
      });
    }
  },
  async getCommentByPostId(event) {
    let _postid = event.postid;
    let limit = event.limit || 5;
    let page = event.page || 0;

    let comments = await Comment.where({
      _post: _postid,
    })
      .orderBy("likes", "desc")
      .orderBy("date", "desc")
      .limit(limit)
      .skip(page * limit)
      .get()
      .then((res) => res["data"]);
    let authorid = [];
    comments.forEach((item) => {
      authorid.push(item["_author"]);
    });
    let author = await cloud
      .callFunction({
        name: "User",
        data: {
          method: "getUser",
          _openid: authorid,
        },
      })
      .then((res) => {
        return res["result"];
      });
    let schoolIds = [];
    author.forEach((item) => {
      if (item._default_school) {
        schoolIds.push(item._default_school);
      }
    });
    let school = await DB.collection("school")
      .where({
        _id: _.in(schoolIds),
      })
      .field({
        name: true,
      })
      .get()
      .then((res) => res["data"]);
    school = arrayToObject(school, "_id");
    author.forEach((item) => {
      if (item._default_school) {
        item["school"] = school[item["_default_school"]];
      }
    });
    author = arrayToObject(author, "_id");
    comments.forEach((item) => {
      item["author"] = author[item["_author"]];
    });

    return comments;
  },
  async likeComment(event) {
    const wxContext = cloud.getWXContext();
    let _commentid = event.commentid;

    let like = await CommentLike.where({
      _liker: wxContext.OPENID,
      _comment: _commentid,
    })
      .get()
      .then((res) => res["data"]);
    if (like.length > 0) {
      return Response.error(409, 409001, "您已点赞过了，请勿重复点赞");
    }

    let addResult = await CommentLike.add({
      data: {
        _liker: wxContext.OPENID,
        _comment: _commentid,
        date: Date.now(),
      },
    }).then((res) => {
      return res;
    });
    if (addResult["errMsg"] == "collection.add:ok") {
      return Response.result(true);
    }
  },
  async cancelLikeComment(event) {
    const wxContext = cloud.getWXContext();
    let _commentid = event.commentid;

    let like = await CommentLike.where({
      _liker: wxContext.OPENID,
      _comment: _commentid,
    })
      .get()
      .then((res) => res["data"]);
    if (like.length == 0) {
      return Response.result("取消点赞成功");
    }

    await CommentLike.where({
      _liker: wxContext.OPENID,
      _comment: _commentid,
    }).remove().then(res=>{
      return res['stats'];
    });

    return Response.result("取消点赞成功");
  },
};

module.exports = functions;
