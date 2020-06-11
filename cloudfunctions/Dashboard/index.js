// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:"release-6zszw"
});

let School=require("./module/school");
let User=require("./module/user");

let functions=Object.assign(School,User);

// 云函数入口函数
exports.main = async (event, context) => {
  let method = event.method;
  delete event.method;

  return functions[method](event);

  return event;
}