// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Post = DB.collection("post");
const postSort = DB.collection("post_sort");
const wxContext = cloud.getWXContext();

const Like = require("./functions/like");
const Comment = require("./functions/comment");
const injectKey = [].concat(Object.keys(Like), Object.keys(Comment));
const injectFunctions = {
  ...Like,
  ...Comment
};

function arrayToObject(array, key) {
  let obj = {};
  array.forEach((item) => {
    obj[item[key]] = item;
  });
  return obj;
}

let functions = {
  ...injectFunctions,
  async savePost(event) {
    const wxContext = cloud.getWXContext();
    let postId = event._postid || null;
    if (event.title !== undefined) {
      if (event.title == "") {
        return Response.error(400, 400001, "请输入标题");
      }
    }
    if (event.content == "") {
      return Response.error(400, 400002, "请输入内容");
    }
    let data = event;

    if (postId) {
      delete event._postid;
      let oldData = await Post.doc(postId)
        .get()
        .then((res) => res["data"]);
      if (oldData["topic"] == null && event.topic != null) {
        await DB.collection("post_topic")
          .where({
            _id: event["topic"],
          })
          .update({
            data: {
              posts: _.inc(1),
            },
          });
      } else if (oldData["topic"] != null && event.topic == null) {
        await DB.collection("post_topic")
          .where({
            _id: oldData["topic"],
          })
          .update({
            data: {
              posts: _.inc(-1),
            },
          });
      }
      if (oldData["_school"] == null && event._school != null) {
        await DB.collection("school")
          .where({
            _id: event["_school"],
          })
          .update({
            data: {
              posts: _.inc(1),
            },
          });
      } else if (oldData["_school"] != null && event._school == null) {
        console.log(oldData);
        await DB.collection("school")
          .where({
            _id: oldData["_school"],
          })
          .update({
            data: {
              posts: _.inc(-1),
            },
          });
      }
      let updateResult = await Post.doc(postId)
        .update({
          data: event,
        })
        .then((res) => res);
      if (updateResult["errMsg"] == "document.update:ok") {
        return Response.result(updateResult["stats"]["updated"]);
      }
    } else {
      (data["videos"] = []), (data["date"] = Date.now());
      data["_authorid"] = wxContext.OPENID;
      data["views"] = 1;
      data["replies"] = 1;
      data["hidden"] = false;
      data["closed"] = false;
      data["status"] = "normal";
      data["likes"] = 0;
      data["_school"] = data["_school"] ? data["_school"] : "";
      let addResult = await Post.add({
        data,
      }).then((res) => {
        return res;
      });
      if (addResult["errMsg"] == "collection.add:ok") {
        await DB.collection("user")
          .doc(`${wxContext.OPENID}`)
          .update({
            data: {
              posts: _.inc(1),
            },
          });
        if (data.topic != null) {
          await DB.collection("post_topic")
            .where({
              _id: data["topic"],
            })
            .update({
              data: {
                posts: _.inc(1),
              },
            });
        }
        if (!data.school) {
          await DB.collection("school")
            .where({
              _id: data["_school"],
            })
            .update({
              data: {
                posts: _.inc(1),
              },
            });
        }
        return Response.result({
          _postid: addResult["_id"],
        });
      } else {
        return Response.error(500, 500001, "发布失败，服务器错误");
      }
    }
  },
  async getPost(event) {
    let _postids = event.postid;
    if (typeof _postids == "string") {
      _postids = [_postids];
    }

    let posts = await Post.where({
      _id: _.in(_postids),
    })
      .get()
      .then((res) => {
        return res["data"];
      });

    if (posts.length > 0) {
      let schoolIds = [];
      let topicIds = [];
      posts.forEach((item) => {
        if (item["_school"]) {
          schoolIds.push(item["_school"]);
        }
        if (item["topic"]) {
          topicIds.push(item["topic"]);
        }
      });

      let schools = await cloud
        .callFunction({
          name: "School",
          data: {
            method: "getSchoolById",
            schoolid: schoolIds,
          },
        })
        .then((res) => res["result"]["data"]);
      schools = arrayToObject(schools, "_id");

      let topics = await DB.collection("post_topic")
        .where({
          _id: _.in(topicIds),
        })
        .get()
        .then((res) => res["data"]);
      topics = arrayToObject(topics, "_id");

      posts.forEach((item) => {
        if (item["_school"]) {
          item["school"] = schools[item["_school"]];
        }
        if (item["topic"]) {
          item["topic"] = topics[item["topic"]];
        }
      });

      if (typeof event.postid == "string") {
        return posts[0];
      } else {
        return posts;
      }
    } else {
      return Response.error(404, 404001, "帖子不存在");
    }
  },
  async getPosts(event) {
    let limit = event.limit || 5;
    let page = event.page || 0;
    let sort = event.sort || null;

    let postsQuery = cloud.database().collection("post");
    if (sort) {
      sort = await postSort
        .where({
          identifier: sort,
        })
        .get()
        .then((res) => {
          return res["data"];
        });
      if (sort.length == 0) {
        return Response.error(400, 400001, "分类不存在");
      }
      sort = sort[0];
      postsQuery = postsQuery.where({
        sort: sort["identifier"],
      });
    }
    let posts = await postsQuery
      .limit(limit)
      .skip(limit * page)
      .orderBy("date", "desc")
      .get()
      .then((res) => {
        return res["data"];
      });
    let users = [];
    let sorts = [];
    let topics = [];
    posts.forEach((item) => {
      users.push(item._authorid);
      sorts.push(item.sort);
      topics.push(item.topic);
    });

    //帖子做作业
    users = await cloud
      .callFunction({
        name: "User",
        data: {
          method: "getUser",
          _openid: users,
        },
      })
      .then((res) => {
        return res["result"];
      });
    users = arrayToObject(users, "_id");

    // 帖子分类
    sorts = await DB.collection("post_sort")
      .where({
        identifier: _.in(sorts),
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    sorts = arrayToObject(sorts, "identifier");

    //帖子话题
    topics = await DB.collection("post_topic")
      .where({
        _id: _.in(topics),
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    topics = arrayToObject(topics, "_id");

    posts.forEach((item) => {
      item["author"] = users[item["_authorid"]];
      item["sort"] = sorts[item["sort"]];
      item["topic"] = topics[item["topic"]];
    });

    return posts;
  },
  async getSortByIdentifier(event) {
    let identifier = event.identifier;
    if (typeof identifier == "string") {
      identifier = [identifier];
    }

    identifier = await DB.collection("post_sort")
      .where({
        identifier: _.in(identifier),
      })
      .get()
      .then((res) => res["data"]);
    if (typeof event.identifier == "string") {
      if (identifier.length == 0) {
        return Response.error(404, 404001, "类型不存在");
      }
      return Response.result(identifier[0]);
    }

    return Response.result(identifier);
  },
  async getLikeByPostId(event) {
    const wxContext = cloud.getWXContext();
    let _postid = event.postid;

    if (typeof _postid == "string") {
      _postid = [_postid];
    }
    let likeLog = await DB.collection("post_like")
      .where({
        _post: _.in(_postid),
        _liker: wxContext.OPENID,
      })
      .get()
      .then((res) => res["data"]);
    if (likeLog.length > 0) {
      if (typeof _postid == "string") {
        return Response.result(likeLog[0]);
      } else {
        return Response.result(likeLog);
      }
    } else {
      return Response.result(null);
    }
  },
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = [
    ...injectKey,
    "savePost",
    "getPost",
    "getPosts",
    "getSortByIdentifier",
    "getLikeByPostId",
  ];
  let method = event.method;
  if (!methods.includes(method)) {
    return {
      error: 403,
      code: 4003001,
      message: "请求参数错误",
    };
  }

  delete event.method;
  return functions[method](event);

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
