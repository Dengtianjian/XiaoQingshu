const Response = require("../response");
const Utils = require("../Utils");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env:"release-6zszw"
});

const DB = cloud.database();
const _ = DB.command;
const School = DB.collection("school");

module.exports={
  getAllSchool(event){
    let limit=event.limit||10;
    let page=event.page||0;

    let result=School.limit(limit).skip(page*limit).get().then(r=>r['data']);

    return result;
  },
  async saveSchoolInfo(event){
    let logo=event.logo;
    let name=event.name;
    let type=event.type;

    let result=await School.add({
      data:{
        logo,
        name,
        type,
        students:0,
        classes:0,
        posts:0
      }
    }).then(r=>r);

    return result;
  }
}

