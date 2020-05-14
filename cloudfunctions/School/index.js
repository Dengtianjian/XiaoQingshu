// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");

cloud.init();
const DB = cloud.database();
const _ =DB.command;
const School = DB.collection("school");

let functions = {
  async joinSchool(event) {
    const wxContext = cloud.getWXContext();
    let { _schoolid } = event;

    let joinedSchoolLog=await DB.collection("user_joined_school").where({
      _schoolid,
      _userid:wxContext.OPENID
    }).get().then(res=>{
      return res['data'];
    });
    await DB.collection("user").where({
      _id:wxContext.OPENID
    }).update({
      data:{
        _default_school:_schoolid
      }
    });
    if(joinedSchoolLog.length>0){
      return {
        error:409,
        code:409001,
        message:`您已经加入该校了，请勿重复加入`
      };
    }

    let addResult=await DB.collection("user_joined_school").add({
      data:{
        _schoolid,
        _userid:wxContext.OPENID,
        join_time:Date.now(),
        admission_date:Date.now()
      }
    }).then(res=>{
      return res;
    });
    if(addResult['errMsg']=="collection.add:ok"){
      return {
        message:"加入成功",
      };
    }
  },
  /* 更新加入学校的学生人数 */
  async updateSchoolStudents(event){
    let _schoolid=event._schoolid;

    return await DB.collection("user_joined_school").where({
      _schoolid
    }).count().then(async res=>{
      return await DB.collection("school").doc(_schoolid).update({
        data:{
          students:res.total
        }
      }).then(res=>{
        return res;
      })
    })
  },
  async getSchoolById(event){
    let schoolIds=event.schoolid;
    if(typeof schoolIds =="string"){
      schoolIds=[schoolIds];
    }

    let school= await School.where({
      _id:_.in(schoolIds)
    }).get().then(res=>res['data']);

    return Response.result(school);
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const methods = ["joinSchool","updateSchoolStudents","getSchoolById"];
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
