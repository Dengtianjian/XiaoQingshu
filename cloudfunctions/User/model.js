const cloud = require("wx-server-sdk");

cloud.init();

const DB = cloud.database();
const User = DB.collection("user");
const UserProfile = DB.collection("user_profile");

let functions = {
  async getUserDefaultSchool(_openid,_schoolid) {
    return await DB.collection("user_joined_school")
      .aggregate()
      .match({
        _userid: _openid,
        _schoolid
      })
      .lookup({
        from: "school",
        localField: "_schoolid",
        foreignField: "_id",
        as: "school",
      })
      .end()
      .then((res) => {
        if (res["list"].length > 0) {
          let classInfo = res["list"][0];
          classInfo = Object.assign(classInfo, classInfo["school"][0]);
          delete classInfo["school"];
          return classInfo;
        } else {
          return null;
        }
      });
  },
  async getUserDefaultClass(_openid, _schoolid) {
    return await DB.collection("user_joined_class")
      .aggregate()
      .match({
        _userid: _openid,
        _schoolid,
      })
      .lookup({
        from: "school_class",
        localField: "_classid",
        foreignField: "_id",
        as: "class",
      })
      .end()
      .then((res) => {
        if (res["list"].length > 0) {
          let classInfo = res["list"][0];
          classInfo = Object.assign(classInfo, classInfo["class"][0]);
          delete classInfo["class"];
          return classInfo;
        } else {
          return null;
        }
      });
  },
  async getUserProfileByOpenId(_openid) {
    let _openids=[];
    if(_openid instanceof String ){
      _openids=[_openid];
    }else{
      _openids=_oepnid;
    }
    let userInfo = await User.aggregate()
      .match({
        _id:_.in(_openids),
      })
      .lookup({
        from: "user_profile",
        localField: "_id",
        foreignField: "_userid",
        as: "profile",
      })
      .end()
      .then((res) => {
        return res;
      });
    if (userInfo["list"].length > 0) {
      userInfo = Object.assign(
        userInfo["list"][0],
        userInfo["list"][0]["profile"][0]
      );
      delete userInfo["profile"];
      userInfo["class"]=null;
      userInfo["school"]=null;
      if (userInfo["_default_school"]) {
        userInfo["school"] = await functions["getUserDefaultSchool"](
          _openid,
          userInfo["_default_school"]
        );
        if(userInfo["school"]==null){
          let joinedSchool=await DB.collection("user_joined_school").where({
            _userid:_openid,
          }).get().then(res=>{
            return res['data'];
          });
          if(joinedSchool.length==0){
            userInfo["_default_school"]=null;
          }else{
            userInfo["_default_school"]=joinedSchool[0]['_schoolid'];
            userInfo["school"]=await functions["getUserDefaultSchool"](
              _openid,
              userInfo["_default_school"]
            );
          }
        }
        userInfo["class"] = await functions["getUserDefaultClass"](
          _openid,
          userInfo["_default_school"]
        );
      }
      return userInfo;
    } else {
      return null;
    }
  },
};

module.exports = functions;
