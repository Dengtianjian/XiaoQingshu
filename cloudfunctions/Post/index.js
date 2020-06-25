// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");

cloud.init({
  env: "release-6zszw",
});

const DB = cloud.database();
const _ = DB.command;
const Post = DB.collection("post");
const postSort = DB.collection("post_sort");
const wxContext = cloud.getWXContext();

const Like = require("./functions/like");
const Comment = require("./functions/comment");
const Sort = require("./functions/sort");
const injectKey = [].concat(
  Object.keys(Like),
  Object.keys(Comment),
  Object.keys(Sort)
);
const injectFunctions = {
  ...Like,
  ...Comment,
  ...Sort,
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
    data["content"] = data["content"].replace(/\r\n/g, "<br/>");
    data["content"] = data["content"].replace(/\n/g, "<br/>");

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
      data["likes"] = 0;
      data["_school"] = data["_school"] ? data["_school"] : "";
      data["content"] = data["content"].replace("\r\n", "<br/>");

      //检查 内容安全结果
      if (event["checkResult"].length > 0) {
        data["checkResult"] = event["checkResult"];
        data["status"] = "reviewAgain";
      } else {
        data["status"] = "normal";
      }
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
    let field = event.field;
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
      let userIds = [];
      let sortIdentifier = [];
      posts.forEach((item) => {
        if (item["_school"]) {
          schoolIds.push(item["_school"]);
        }
        if (item["topic"]) {
          topicIds.push(item["topic"]);
        }
        sortIdentifier.push(item["sort"]);

        // userIds.push(item["_authorid"]);
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
      if (schools&&schools.length > 0) {
        schools = arrayToObject(schools, "_id");
      }

      let topics = await DB.collection("post_topic")
        .where({
          _id: _.in(topicIds),
        })
        .get()
        .then((res) => res["data"]);
      topics = arrayToObject(topics, "_id");

      // let sort = await DB.collection("post_sort")
      //   .where({
      //     identifier: _.in(sortIdentifier),
      //   })
      //   .get()
      //   .then((res) => res["data"]);
      // sort = arrayToObject(sort, "identifier");

      posts.forEach((item) => {
        if (schools&&item["_school"]) {
          item["school"] = schools[item["_school"]]||null;
        }
        if (item["topic"]) {
          item["topic"] = topics[item["topic"]];
        }
        // item["sort"] = sort[item["sort"]];
        // item["author"] = users[item["_authorid"]];
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
    let school = event.school || null;
    let status = event.status || "normal";
    if (status == "all") {
      ststus = null;
    }

    let postsQuery = cloud.database().collection("post");
    let whereQuery = {};
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
      whereQuery["sort"] = sort["identifier"];
    }
    if (school) {
      whereQuery["_school"] = school;
    } else {
      whereQuery["_school"] = _.in(["",null]);
    }
    if (status) {
      whereQuery["status"] = status;
    }
    // return whereQuery;
    let posts = await postsQuery
      .where(whereQuery)
      .limit(limit)
      .skip(limit * page)
      .orderBy("date", "asc")
      .get()
      .then((res) => {
        return res["data"];
      });
    let users = [];
    let sorts = [];
    let topics = [];
    if (posts.length == 0) {
      return [];
    }
    posts.forEach((item) => {
      users.push(item._authorid);
      sorts.push(item.sort);
      topics.push(item.topic);
      item["content"] = item["content"].replace(/<br ?\/>/g, " ");
      if (item["content"].length > 80) {
        item["content"] = item["content"].slice(0, 80);
        item["content"] += "...";
      }
    });

    //帖子作者
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
      if (typeof event.postid == "string") {
        return Response.result(likeLog[0]);
      } else {
        return Response.result(likeLog);
      }
    } else {
      return Response.result(null);
    }
  },
  async getPostByUser(event) {
    let userid = event.userid;
    let page = event.page || 0;
    let limit = event.limit || 5;
    let status = event.status || "normal";
    if (status == "all") {
      status = null;
    }

    let whereQuery = {
      _authorid: userid,
    };
    if (status) {
      whereQuery["status"] = status;
    }
    let posts = await Post.where(whereQuery)
      .field({
        _id: true,
      })
      .orderBy("date", "desc")
      .limit(limit)
      .skip(limit * page)
      .get()
      .then((res) => res["data"]);
    let postid = [];
    posts.forEach((item) => {
      postid.push(item._id);
    });
    posts = await functions["getPost"]({ postid });
    posts.forEach((item) => {
      item["content"] = item["content"].replace(/<br ?\/>/g, " ");
      if (item["content"].length > 80) {
        item["content"] = item["content"].slice(0, 80);
        item["content"] += "...";
      }
    });
    return Response.result(posts);
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
    "getPostByUser",
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
