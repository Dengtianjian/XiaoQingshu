const cloud = require("wx-server-sdk");

cloud.init();

const DB = cloud.database();
const _ = DB.command;

module.exports={
  async joinClass(_userid,_schoolid,_classid){
    let classInfo = await DB.collection("school_class")
      .where({
        _id: _classid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    classInfo = classInfo[0];

    /* 查询是否已加入班级 */
    let userJoinClassLog = await DB.collection("user_joined_class")
    .where({
      _classid,
      _userid,
    })
    .get()
    .then((res) => {
      return res["data"];
    });

    if(userJoinClassLog.length>0){
      return {
        error:409,
        code:409001,
        message:"已是该班级的学生"
      };
    }

    await DB.collection("user_joined_class")
      .add({
        data: {
          _classid,
          _userid,
          _schoolid: classInfo["_schoolid"],
          join_time: Date.now(),
        },
      })
      .then((res) => {
        return res;
      });
    addResult = DB.collection("school_class")
      .doc(classInfo["_id"])
      .update({
        data: {
          students: _.inc(1),
        },
      })
      .then((res) => {
        return res;
      });
    DB.collection("user")
      .where({
        _id: _userid,
      })
      .update({
        data: {
          _default_school: classInfo["_schoolid"],
        },
      });

      return true;
  }
}