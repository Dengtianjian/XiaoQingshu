const { getUserProfileByOpenId, getUserDefaultSchool } = require("./model");
const Response = require("./response");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env:"release-6zszw"
});


const DB = cloud.database();
const _ = DB.command;
const User = DB.collection("user");
const UserProfile = DB.collection("user_profile");

const Favorite = require("./module/favorite");

let injectKey = [].concat(Object.keys(Favorite));

let functions = {
  ...Favorite,
  /**
   * 获取当前登录的用户信息
   * @param {Object} info 用户的信息
   */
  async login(event) {
    const wxContext = cloud.getWXContext();
    let info = event.info;
    let _openid = wxContext.OPENID;
    let userInfo = await DB.collection("user")
      .where({
        _id: _openid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (userInfo.length == 0) {
      let notification=await DB.collection("notification_category").get().then(res=>res['data']);
      let message_news={
        total:0
      };
      for(let i=0;i<notification.length;i++){
        message_news[notification[i]['identifier']]=0;
      }
      userInfo = {
        _id: _openid,
        nickname: info.nickName,
        avatar_url: info.avatarUrl,
        _default_school: "",
        allow_access: true,
        allow_comment: true,
        allow_post: true,
        credits: 0,
        expreience: 100,
        fans: 0,
        group: "f149f6775e9d1ff0007f1f350cf4f400", //!默认为普通用户组
        posts: 0,
        registation_date: Date.now(),
        report_weight: 100,
        status: "normal",
        school: null,
        class: null,
        message_news
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
        space_bg_image: null,
        phone_number: null,
      };
      DB.collection("user_profile").add({
        data: userProfile,
      });
      userInfo = Object.assign(userProfile, userInfo);
    } else {
      userInfo = await getUserProfileByOpenId(_openid);
      if(userInfo.length>0){
        userInfo=userInfo[0];
      }
    }

    return userInfo;
  },
  /* 根据openid获取用户的信息 */
  async getUserProfile(event) {
    let userProfile = await getUserProfileByOpenId(event._userid);
    if (userProfile == null) {
      return {
        error: 404,
        code: 404001,
        message: "用户不存在",
      };
    }

    return userProfile[0];
  },
  async getUser(event) {
    let _openids = [];
    let field = event.field || {};

    if (typeof event._openid == "string") {
      _openids.push(event._openid);
    } else {
      _openids = event._openid;
    }

    let user = await getUserProfileByOpenId(_openids);
    if (typeof event._openid == "string") {
      if(user===null){
        return [];
      }
      return user[0];
    }
    return user;
  },
  async saveUserInfo(event) {
    const wxContext = cloud.getWXContext();
    await User.where({
      _id: wxContext.OPENID,
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
    await UserProfile.where({
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

    return Response.result(true);
  },
  /* 获取用户加入的所有学校 */
  async getJoinedSchool() {
    const wxContext = cloud.getWXContext();
    let userJoinedSchool = await DB.collection("user_joined_school")
      .aggregate()
      .match({
        _userid: wxContext.OPENID,
      })
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
        _id: addResult["_id"],
      });
    }
  },
  async checkJoined(event) {
    const wxContext = cloud.getWXContext();
    let _classid = event._classid;

    let result = await DB.collection("user_joined_class")
      .where({
        _classid,
        _userid: wxContext.OPENID,
      })
      .get()
      .then((res) => {
        return res["data"];
      });

    return result;
  },
  /* update主页背景进数据库 */
  async updateUserBg(event) {
    const wxContext = cloud.getWXContext();
    console.log(wxContext.OPENID);
    let userProfile = await DB.collection("user_profile")
      .where({
        _userid: wxContext.OPENID,
      })
      .update({
        data: {
          space_bg_image: event.fileId,
        },
      });
    console.log(event);

    return Response.result(userProfile);
  },
  /* 切换默认学校 */
  async switchSchool(event) {
    const wxContext = cloud.getWXContext();
    let _schoolid = event._schoolid;

    let school = await DB.collection("school")
      .where({
        _id: _schoolid,
      })
      .get()
      .then((res) => res["data"]);
    if (school.length == 0) {
      return Response.error(404, 404001, "学校不存在");
    }

    school = school[0];
    let schoolClass = null;

    let joinedClass = await DB.collection("user_joined_class")
      .where({
        _userid: wxContext.OPENID,
        _schoolid: school["_id"],
      })
      .get()
      .then((res) => res["data"]);

    if (joinedClass.length > 0) {
      joinedClass = joinedClass[0];
      schoolClass = await DB.collection("school_class")
        .where({
          _id: joinedClass["_classid"],
        })
        .get()
        .then((res) => res["data"]);
      if (schoolClass.length > 0) {
        schoolClass = schoolClass[0];
      }
    }

    let result = User.doc(wxContext.OPENID).update({
      data: {
        _default_school:_schoolid,
        class: _.set(schoolClass),
        school: _.set(school),
      },
    });

    return result;
  },
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = [
    ...injectKey,
    "login",
    "getUserProfile",
    "saveUserProfile",
    "getJoinedSchool",
    "saveUserInfo",
    "quitSchool",
    "submitFeedback",
    "getUser",
    "updateUserBg",
    "checkJoined",
    "switchSchool",
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
