// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const DB=cloud.database();

let functions = {
  /**
   * 获取当前登录的用户信息
   * @param {Object} info 用户的信息
   */
  async getUserInfo(event) {
    const wxContext = cloud.getWXContext();
    let info=event.info;
    let _openid=wxContext.OPENID;
    let userInfo = await DB.collection("user").where({
      _openid:wxContext.OPENID
    }).get().then(res=>{
      return res['data'];
    });
    if(userInfo.length==0){
      userInfo={
        _openid,
        nickname:info.nickName,
        avatar_url:info.avatarUrl,
        _default_school:"",
        allow_access:true,
        allow_comment:true,
        allow_post:true,
        credits:0,
        expreience:100,
        fans:0,
        group:"d77a8c995e9d1f9e00625cd43b0aba8f", //!待修改
        posts:0,
        registation_date:Date.now(),
        report_weight:100,
        status:"normal"
      };
      DB.collection("user").add({
        data:userInfo
      });
    }else{
      userInfo=userInfo[0];
    }
    let userProfile=await DB.collection("user_profile").where({
      _userid:_openid
    }).get().then(res=>{
      return res['data'];
    });
    if(userProfile.length==0){
      userProfile={
        _userid:_openid,
        brithday:0,
        education:"",
        gender:"male",
        location:"",
        realname:"",
        statement:""
      }
      DB.collection("user_profile").add({
        data:userProfile
      });
    }else{
      userProfile=userProfile[0];
    }
    delete userProfile['_userid'];
    userInfo=Object.assign(userProfile,userInfo);

    return userInfo;
  },
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = ["getUserInfo"];
  let method=event.method;
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
