// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Post = DB.collection("post");
const postSort = DB.collection("post_sort");
const wxContext = cloud.getWXContext();

function arrayToObject(array, key) {
  let obj = {};
  array.forEach((item) => {
    obj[item[key]] = item;
  });
  return obj;
}

let functions = {
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
    if (event.topic != null) {
      event.topic = event.topic._id;
    }
    let data = event;

    if (postId) {
    } else {
      (data["videos"] = []), (data["date"] = Date.now());
      data["_authorid"] = wxContext.OPENID;
      data["views"] = 1;
      data["replies"] = 1;
      data["hidden"] = false;
      data["closed"] = false;
      data["status"] = "normal";
      data["likes"] = 0;
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
          await DB.collection("post_topic").update({
            data: {
              posts: _.inc(1),
            },
          });
        }
        if (data.school != null) {
          await DB.collection("school").update({
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
    let limit = event.limit || 5;
    let page = event.page || 0;
    let sort = event.sort || null;
    console.log(sort);

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
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = ["savePost", "getPost"];
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
