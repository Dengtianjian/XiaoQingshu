// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const wxContext = cloud.getWXContext()

let functions={
  async applyJoinClass(event){
    // await cloud.database().collection("user_joined_school").where({
    //   _openid:wxContext.OPENID
    // }).get().then(res=>{
    //   if(res.data.length==0){
    //     cloud.database().collection("user_joined_school").add({
    //       data:{
    //         school_id:event.schoolId,
    //         join_time:Date().now(),
    //         admission_time:0
    //       }
    //     });
    //   }
    // });
    let isExists=await cloud.database().collection("school_class_apply").where({
      _userid:wxContext.OPENID,
      _classid:event.classId
    }).get().then(res=>{
      return res;
    });

    if(isExists['data'].length>0){
      return {
        error:409,
        code:409001,
        message:"您已申请过了，请勿重复申请"
      }
    }
    let school=await cloud.database().collection("school").where({
      _id:"d77a8c995e9d58840066aef110b62101"
    }).get().then(res=>{
      return res;
    });
    if(school['data'].length==0){
      return {
        error:404,
        code:404001,
        message:"班级信息错误，请联系班级管理员"
      }
    }
    await cloud.database().collection("school_class_apply").add({
      data:{
        date:Date.now(),
        _classid:event.classId,
        _userid:wxContext.OPENID
      }
    });
    return {
      message:"申请成功"
    };
  },
  async agreeNewClassmateJoin(event){
    return event;
    cloud.database().collection("school_class").doc(event.classId)
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const methods=[
    "applyJoinClass",
    "agreeNewClassmateJoin"
  ];
  if(!methods.includes(event.method)){
    return {
      error:403,
      message:"请求参数错误"
    };
  }
  let method=event.method;
  delete event.method;
  return functions[`${method}`](event);
}