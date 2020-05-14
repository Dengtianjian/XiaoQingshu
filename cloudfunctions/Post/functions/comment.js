const cloud = require("wx-server-sdk");
const Response = require("../response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Comment = DB.collection("post_comment");
const CommentLike = DB.collection("post_comment_like");
const CommentReply = DB.collection("post_comment_reply");

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
    const wxContext = cloud.getWXContext();
    let _postid = event.postid;
    let limit = event.limit || 5;
    let page = event.page || 0;

    let comments = await Comment.where({
      _post: _postid,
    })
      .orderBy("likes", "desc")
      .orderBy("date", "asc")
      .limit(limit)
      .skip(page * limit)
      .get()
      .then((res) => res["data"]);
    let authorid = [];
    let commentId = [];
    comments.forEach((item) => {
      authorid.push(item["_author"]);
      commentId.push(item["_id"]);
    });
    let likes = await CommentLike.where({
      _comment: _.in(commentId),
      _liker: wxContext.OPENID,
    })
      .get()
      .then((res) => {
        return res["data"];
      });
    likes = arrayToObject(likes, "_comment");

    let author = await cloud
      .callFunction({
        name: "User",
        data: {
          method: "getUser",
          _id: authorid,
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
      if (likes[item["_id"]]) {
        item["isLike"] = true;
      }
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
      Comment.where({
        _author: wxContext.OPENID,
        _id: _commentid,
      }).update({
        data: {
          likes: _.inc(1),
        },
      });
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
    })
      .remove()
      .then((res) => {
        return res["stats"];
      });
    await Comment.where({
      _author: wxContext.OPENID,
      _id: _commentid,
    }).update({
      data: {
        likes: _.inc(-1),
      },
    });

    return Response.result("取消点赞成功");
  },
  async replyComment(event) {
    const wxContext = cloud.getWXContext();
    let _comment = event.commentid;
    let content = event.content;
    let _post = event.post;
    let _replyid = null;
    let _reply_author = null;

    if (event.replyid) {
      _replyid = event.replyid;
      _reply_author = event.replyauthor;
    }

    let addResult = await CommentReply.add({
      data: {
        content,
        date: Date.now(),
        _comment,
        _post,
        _replier: wxContext.OPENID,
        _replyid,
        _reply_author,
      },
    }).then((res) => {
      return res;
    });

    Comment.where({
      _id: _comment,
    }).update({
      data: {
        replies: _.inc(1),
      },
    });

    return Response.result({
      _replyid: addResult["_id"],
    });
  },
  async getCommentReply(event) {
    let commentId = event.commentid;
    let page = event.page || 0;
    let limit = event.limit || 5;
    let replys = await CommentReply.where({
      _comment: commentId,
    })
      .limit(limit)
      .skip(limit * page)
      .get()
      .then((res) => res["data"]);
    let authors = [];
    replys.forEach((item) => {
      authors.push(item._replier);
    });
    authors = await cloud
      .callFunction({
        name: "User",
        data: {
          method: "getUser",
          _id: authors,
          field: {
            nickname: true,
            avatar_url: true,
            _default_school: true,
          },
        },
      })
      .then((res) => res["result"]);
    let authorSchool = [];
    authors.forEach((item) => {
      if (item._default_school) {
        authorSchool.push(item._default_school);
      }
    });
    authorSchool = await DB.collection("school")
      .where({
        _id: _.in(authorSchool),
      })
      .field({
        name: true,
      })
      .get()
      .then((res) => res["data"]);
    authorSchool = arrayToObject(authorSchool, "_id");
    authors.forEach((item) => {
      if (item._default_school) {
        item["school"] = authorSchool[item["_default_school"]];
      }
    });
    authors = arrayToObject(authors, "_id");
    replys.forEach((item) => {
      item["author"] = authors[item["_replier"]];
    });

    return replys;
  },
};

module.exports = functions;
