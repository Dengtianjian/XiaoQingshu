const cloud = require("wx-server-sdk");

cloud.init({
  env: "release-6zszw",
});

const DB = cloud.database();
const _ = DB.command;
const User = DB.collection("user");
const UserProfile = DB.collection("user_profile");

let functions = {
  async getUserDefaultSchool(_openid, _schoolid) {
    return await DB.collection("user_joined_school")
      .aggregate()
      .match({
        _userid: _openid,
        _schoolid,
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
    let _openids = [];
    if (typeof _openid == "string") {
      _openids = [_openid];
    } else {
      _openids = _openid;
    }
    let userInfoList = await User.aggregate()
      .match({
        _id: _.in(_openids),
      })
      .lookup({
        from: "user_profile",
        localField: "_id",
        foreignField: "_userid",
        as: "profile",
      })
      .end()
      .then((res) => {
        return res["list"];
      });
    if (userInfoList.length > 0) {
      for (let i = 0; i < userInfoList.length; i++) {
        let userInfo = Object.assign(
          userInfoList[i]["profile"][0],
          userInfoList[i]
        );
        delete userInfo["profile"];

        if (!userInfo["school"] || userInfo["school"] == null) {
          if (userInfo["_default_school"]) {
            userInfo["school"] = await functions["getUserDefaultSchool"](
              userInfo["_userid"],
              userInfo["_default_school"]
            );
            if (userInfo["school"] == null) {
              let joinedSchool = await DB.collection("user_joined_school")
                .where({
                  _userid: userInfo["_userid"],
                })
                .get()
                .then((res) => {
                  return res["data"];
                });
              if (joinedSchool.length == 0) {
                userInfo["_default_school"] = null;
              } else {
                userInfo["_default_school"] = joinedSchool[0]["_schoolid"];
                userInfo["school"] = await functions["getUserDefaultSchool"](
                  userInfo["_userid"],
                  userInfo["_default_school"]
                );
              }
            }
            userInfo["class"] = await functions["getUserDefaultClass"](
              userInfo["_userid"],
              userInfo["_default_school"]
            );
          } else {
            let userJoinedSchool = await DB.collection("user_joined_school")
              .where({
                _userid: userInfo["_id"],
              })
              .limit(1)
              .get()
              .then((res) => res["data"]);
            if (userJoinedSchool.length > 0) {
              userJoinedSchool = userJoinedSchool[0];
              let joinedSchool = await DB.collection("school")
                .where({
                  _id: userJoinedSchool["_schoolid"],
                })
                .get()
                .then((res) => {
                  return res["data"];
                });
              if (joinedSchool.length > 0) {
                userInfo["school"] = joinedSchool[0];
                userInfo["_default_school"] = joinedSchool[0]["_id"];
              }
              userInfo["class"] = await functions["getUserDefaultClass"](
                userInfo["_id"],
                userInfo["_default_school"]
              );
            }
          }

          await User.doc(userInfo["_userid"]).update({
            data: {
              class: _.set(userInfo["class"]),
              school: _.set(userInfo["school"]),
            },
          });
        } else if (!userInfo["class"] && userInfo["_default_school"]) {
          userInfo["class"] = await functions["getUserDefaultClass"](
            userInfo["_id"],
            userInfo["_default_school"]
          );

          if (userInfo["class"]) {
            await User.doc(userInfo["_userid"]).update({
              data: {
                class: _.set(userInfo["class"]),
              },
            });
          }
        }
        userInfoList[i] = userInfo;
      }
      return userInfoList;
    } else {
      return [];
    }
  },
};

module.exports = functions;
