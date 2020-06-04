const Response = require("../response");
const Utils = require("../Utils");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const School = DB.collection("school");

module.exports={
  
}

