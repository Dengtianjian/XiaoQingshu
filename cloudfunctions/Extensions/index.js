// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");

cloud.init({
  env:"release-6zszw"
});

const DB = cloud.database();
const _ = DB.command;

const MODULES={
  async getQuotes(event){
    let limit=event.limit;

    let result=await DB.collection("quote").aggregate()
    .sample({
      size: limit,
    })
    .end().then(r=>r['list']);

    return Response.result(result);
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const AllowModules = [
    "getQuotes",
  ];

  let moduleName = event.module;
  if (!AllowModules.includes(moduleName)) {
    return Response.error(403, 403001, "请求参数错误");
  }
  delete event.module;
  return MODULES[moduleName](event);

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}