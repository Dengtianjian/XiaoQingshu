const { getUserProfileByOpenId, getUserDefaultSchool } = require("./model");
const Response = require("./response");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const DB = cloud.database();
const User = DB.collection("user");
const userProfile = DB.collection("user_profile");
const _ = DB.command;

let functions = {
  /**
   * 获取当前登录的用户信息
   * @param {Object} info 用户的信息
   */
  async getUserInfo(event) {
    const wxContext = cloud.getWXContext();
    let info = event.info;
    let _openid = wxContext.OPENID;
    let userInfo = await DB.collection("user")
      .where({
        _id: wxContext.OPENID,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (userInfo.length == 0) {
      userInfo = {
        _id:_openid,
        nickname: info.nickName,
        avatar_url: info.avatarUrl,
        _default_school: "",
        allow_access: true,
        allow_comment: true,
        allow_post: true,
        credits: 0,
        expreience: 100,
        fans: 0,
        group: "d77a8c995e9d1f9e00625cd43b0aba8f", //!待修改
        posts: 0,
        registation_date: Date.now(),
        report_weight: 100,
        status: "normal",
      };
      DB.collection("user").add({
        data: userInfo,
      });
    } else {
      userInfo = userInfo[0];
    }
    let userProfile = await DB.collection("user_profile")
      .where({
        _userid: _openid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (userProfile.length == 0) {
      userProfile = {
        _userid: _openid,
        birthday: 0,
        education: "",
        gender: "male",
        location: "",
        realname: "",
        statement: "",
      };
      DB.collection("user_profile").add({
        data: userProfile,
      });
      userInfo = Object.assign(userProfile, userInfo);
    } else {
      userInfo = await getUserProfileByOpenId(_openid);
    }

    return userInfo;
  },
  /* 根据openid获取用户的信息 */
  async getUser(event) {
    let userProfile = await getUserProfileByOpenId(event._userid);
    if (userProfile == null) {
      return {
        error: 404,
        code: 404001,
        message: "用户不存在",
      };
    }

    return userProfile;
  },
  async saveUserInfo(event) {
    const wxContext = cloud.getWXContext();
    await User.where({
      _openid: wxContext.OPENID,
    }).update({
      data: {
        ...event,
      },
    });

    return {
      message: "保存成功",
    };
  },
  /* 保存用户资料 */
  async saveUserProfile(event) {
    const wxContext = cloud.getWXContext();
    let {
      birthday,
      education,
      email,
      phone_number,
      realname,
      statement,
    } = event;

    if (!/^1[3-9]\d{9}$/.test(phone_number)) {
      return {
        error: 400,
        code: 400001,
        message: "请输入正确的手机号码，仅限中国大陆的",
      };
    }
    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\@[a-zA-Z0-9]{1,10}\.[a-zA-Z0-9\.]{1,20}$/.test(
        email
      )
    ) {
      return {
        error: 400,
        code: 400002,
        message: "请输入正确的邮箱地址",
      };
    }

    return await userProfile
      .where({
        _userid: wxContext.OPENID,
      })
      .update({
        data: {
          birthday: new Date(birthday).getTime(),
          education,
          email,
          phone_number,
          realname,
          statement,
        },
      })
      .then((res) => {
        return res;
      });
  },
  /* 获取用户加入的所有学校 */
  async getJoinedSchool() {
    const wxContext = cloud.getWXContext();
    let userJoinedSchool = await DB.collection("user_joined_school")
      .aggregate()
      .lookup({
        from: "school",
        localField: "_schoolid",
        foreignField: "_id",
        as: "profile",
      })
      .end()
      .then((res) => {
        return res["list"];
      });
    if (userJoinedSchool.length == 0) {
      return [];
    }
    let result = [];
    userJoinedSchool.forEach((item) => {
      if (item.profile.length > 0) {
        item = Object.assign(item, item["profile"][0]);
        delete item["profile"];
        result.push(item);
      }
    });
    return result;
  },
  /* 退出学校  */
  async quitSchool(event) {
    const wxContext = cloud.getWXContext();
    let _schoolid = event._schoolid;
    return await DB.collection("user_joined_school")
      .where({
        _schoolid,
        _userid: wxContext.OPENID,
      })
      .remove()
      .then(async (res) => {
        if (true && res["stats"]["removed"]) {
          cloud.callFunction({
            name: "School",
            data: {
              method: "updateSchoolStudents",
              _schoolid,
            },
          });
        }
        return res;
      });
  },
  async submitFeedback(event) {
    const wxContext = cloud.getWXContext();
    let addResult = await DB.collection("user_feedback")
      .add({
        data: {
          date: Date.now(),
          type: event.type,
          page: event.page,
          _userid: wxContext.OPENID,
          content: event.content,
        },
      })
      .then((res) => {
        return res;
      });
    if (addResult["errMsg"] == "collection.add:ok") {
      return Response.result({
        _id:addResult['_id']
      });
    }
  },
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = [
    "getUserInfo",
    "getUser",
    "saveUserProfile",
    "getJoinedSchool",
    "saveUserInfo",
    "quitSchool",
    "submitFeedback",
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
