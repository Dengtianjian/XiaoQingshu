// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

let User = cloud.database().collection("user");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let userInfo = await User.where({
    _openid: wxContext.OPENID,
  })
    .get()
    .then((res) => {
      return res;
    });
  if (userInfo['data'].length > 0) {
    userInfo = userInfo['data'][0];
  } else {
    let userInfo={
      data: {
        _openid: wxContext.OPENID,
        nickname: event.nickname,
        fans: 0,
        posts: 0,
        credits: 0,
        expreience: 100,
        group: "d77a8c995e9d1f9e00625cd43b0aba8f",
        report_weight: 100,
        registation_date: Date.now(),
        status: "normal",
        allow_access: true,
        allow_post: true,
        allow_comment: true,
        default_school: "",
      },
    };
    await User.add(userInfo);
  }
  delete userInfo['_openid'],userInfo['_id'];

  return userInfo;
};
