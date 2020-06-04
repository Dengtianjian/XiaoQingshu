const Response = require("../response");
const Utils = require("../Utils");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const User = DB.collection("user");

module.exports={
  getUserJoinedSchool(event){
    // let _userid=event._userid;

    // let userJoinedSchool = await DB.collection("user_joined_school")
    //   .aggregate()
    //   .match({
    //     _userid,
    //   })
    //   .lookup({
    //     from: "school",
    //     localField: "_schoolid",
    //     foreignField: "_id",
    //     as: "profile",
    //   })
    //   .end()
    //   .then((res) => {
    //     return res["list"];
    //   });
    // if (userJoinedSchool.length == 0) {
    //   return [];
    // }
    // let result = [];
    // userJoinedSchool.forEach((item) => {
    //   if (item.profile.length > 0) {
    //     item = Object.assign(item, item["profile"][0]);
    //     delete item["profile"];
    //     result.push(item);
    //   }
    // });
    // return result;
  }
}

