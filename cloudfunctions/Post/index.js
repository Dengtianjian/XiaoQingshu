// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Post = DB.collection("post");
const wxContext = cloud.getWXContext();

let functions = {
  async savePost(event) {
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
          .doc(wxContext.OPENID)
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
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = ["savePost"];
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
