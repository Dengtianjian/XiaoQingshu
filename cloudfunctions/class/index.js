const { joinClass } = require("./functions");
const Response = require("./response");
// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: "release-6zszw",
});

const DB = cloud.database();
const _ = DB.command;
const Class = DB.collection("school_class");

let functions = {
  async getClassByClassId(event) {
    let _classid = event._classid;
    let result = await DB.collection("school_class")
      .aggregate()
      .match({
        _id: _classid,
      })
      .lookup({
        from: "school",
        localField: "_schoolid",
        foreignField: "_id",
        as: "school",
      })
      .end()
      .then((res) => {
        return res["list"];
      });
    if (result.length == 0) {
      return {
        error: 404,
        code: 404001,
        message: "班级不存在",
      };
    }
    result = result[0];
    result["school"] = result["school"][0];
    return result;
  },
  /**
   * 根据数字ID 获取班级信息 包含班级所在的学校的信息
   * @param Number _numberid 班级数字ID
   * @return 班级和学校的数据
   */
  async getClassByNumberId(event) {
    let schoolId = event._schoolid;
    let numberId = event._numberid;
    let match = {
      _numberid: parseInt(numberId),
    };
    if (schoolId) {
      match["_schoolid"] = schoolId;
    }
    let result = await DB.collection("school_class")
      .aggregate()
      .match(match)
      .lookup({
        from: "school",
        localField: "_schoolid",
        foreignField: "_id",
        as: "school",
      })
      .end()
      .then((res) => {
        return res["list"];
      });
    if (result.length == 0) {
      return {
        error: 404,
        code: 404001,
        message: "班级不存在",
      };
    }
    result = result[0];
    result["school"] = result["school"][0];
    return result;
  },
  /**
   * 申请加入班级
   * @param {String} _classid 班级ID
   */
  async applyJoinClass(event) {
    const wxContext = cloud.getWXContext();
    let _classid = event._classid;
    let joinedClassLog = await DB.collection("user_joined_class")
      .where({
        _classid,
        _userid: wxContext.OPENID,
      })
      .get()
      .then((res) => {
        return res.data;
      });
    if (joinedClassLog.length > 0) {
      return {
        error: 409,
        code: 409002,
        message: "您已是该班级的同学，请勿重复加入",
      };
    }
    let applyClassLog = await DB.collection("school_class_apply")
      .where({
        _classid,
        _userid: wxContext.OPENID,
      })
      .get()
      .then((res) => {
        return res.data;
      });

    if (applyClassLog.length > 0) {
      return {
        error: 409,
        code: 409001,
        message: "该班级您已申请过了，请勿重复申请",
      };
    }

    let classInfo = await Class.where({
      _id: _classid,
    })
      .get()
      .then((res) => res["data"]);
    if (classInfo.length == 0) {
      return Response.error(404, 404001, "班级不存在");
    }
    classInfo = classInfo[0];
    if (classInfo["allow_join"] === false) {
      return Response.error(
        403,
        403001,
        "本班级仅允许邀请加入的呢，不开放申请加入，请联系班级管理员"
      );
    }

    let applyResult = await DB.collection("school_class_apply")
      .add({
        data: {
          _userid: wxContext.OPENID,
          _classid,
          date: Date.now(),
        },
      })
      .then((res) => {
        return res;
      });
    if (applyResult._id) {
      return {
        message: "提交申请成功",
      };
    } else {
      return {
        error: 500,
        code: 500001,
        message: "提交申请失败，请稍后再试",
      };
    }
  },
  /**
   * 保存班级信息
   * @param {String|Null} _classid 班级ID
   * @param {String} profession 专业
   * @param {Number} buildDate 创立日期
   * @param {Number} GradeNumber 班级号
   * @param {String} _schoolid 学校ID
   */
  async saveClassInfo(event) {
    const wxContext = cloud.getWXContext();
    const _ = DB.command;
    let _classid = event._classid;
    let profession = String(event.profession).trim();
    let buildDate = parseInt(event.buildDate);
    let gradeNumber = parseInt(event.gradeNumber);
    let _schoolid = event._schoolid;
    let allowJoin = Boolean(event.allow_join);

    let userInfo = await DB.collection("user")
      .where({
        _id: wxContext.OPENID,
      })
      .field({
        allow_create_class: true,
        allow_access: true,
      })
      .get()
      .then((res) => {
        return res["data"][0];
      });
    if (userInfo["allow_access"] === false) {
      return {
        error: 403,
        code: 4030001,
        message: "抱歉，您被拒绝访问",
      };
    }

    if (_classid == null) {
      if (userInfo["allow_create_class"] === false) {
        return {
          error: 403,
          code: 4030102,
          message: "抱歉，您不允许创建班级",
        };
      }
      let maxClassNumberId = await DB.collection("system_parameters")
        .where({
          identifier: "max_class_numberid",
        })
        .get()
        .then((res) => {
          return res["data"];
        });
      maxClassNumberId = maxClassNumberId[0]["value"] + 1;
      let addResult = await DB.collection("school_class")
        .add({
          data: {
            _adminid: wxContext.OPENID,
            _numberid: maxClassNumberId,
            _schoolid,
            album_count: 0,
            build_date: buildDate,
            grade: new Date(buildDate).getFullYear(),
            number: gradeNumber,
            profession,
            students: 1,
            allow_join: allowJoin,
          },
        })
        .then((res) => {
          return res;
        });
      if (addResult["_id"]) {
        await DB.collection("user_joined_class").add({
          data: {
            _classid: addResult["_id"],
            _userid: wxContext.OPENID,
            _schoolid,
            join_time: Date.now(),
          },
        });
        await DB.collection("school")
          .doc(_schoolid)
          .update({
            data: {
              classes: _.inc(1),
            },
          });
        DB.collection("system_parameters")
          .where({
            identifier: "max_class_numberid",
          })
          .update({
            data: {
              value: _.inc(1),
            },
          });
        return {
          _classid: addResult["_id"],
          message: "创建成功",
        };
      }
    } else {
      let updateResult = await DB.collection("school_class")
        .where({
          _id: _classid,
        })
        .update({
          data: {
            build_date: buildDate,
            grade: new Date(buildDate).getFullYear(),
            number: gradeNumber,
            profession,
            allow_join: allowJoin,
          },
        })
        .then((res) => {
          if (res.errMsg == "collection.update:ok") {
            return true;
          }
        });
      if (updateResult) {
        return {
          message: "保存成功",
        };
      }
    }
  },
  /**
   * 根据学校ID 和 用户ID 获取在该学校加入的班级信息
   */
  async getClassBySchoolId(event) {
    const wxContext = cloud.getWXContext();
    let _schoolid = event._schoolid;

    let schoolClass = await DB.collection("user_joined_class")
      .where({
        _schoolid,
        _userid: wxContext.OPENID,
      })
      .get()
      .then((res) => {
        return res["data"];
      });

    if (schoolClass.length == 0) {
      return Response.result(null);
    }
    schoolClass = schoolClass[0];
    let classInfo = await DB.collection("school_class")
      .where({
        _id: schoolClass["_classid"],
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (classInfo.length == 0) {
      return {
        error: 404,
        code: 404001,
        message: "抱歉，班级不存在",
      };
    }
    classInfo = classInfo[0];

    return classInfo;
  },
  /*
  获取班级的申请加入的新同学
  */
  async getNewClassmate(event) {
    let newClassmate = await DB.collection("school_class_apply")
      .where({
        _classid: event._classid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (newClassmate.length == 0) {
      return [];
    }
    let classmateUserId = [];
    newClassmate.forEach((item) => {
      classmateUserId.push(item._userid);
    });
    let userInfo = await DB.collection("user")
      .aggregate()
      .lookup({
        from: "user_profile",
        localField: "_id",
        foreignField: "_userid",
        as: "profile",
      })
      .match({
        _id: _.in(classmateUserId),
      })
      .end()
      .then((res) => {
        return res["list"];
      });
    userInfo.forEach((userInfoItem) => {
      userInfoItem = Object.assign(userInfoItem, userInfoItem["profile"][0]);
      delete userInfoItem["profile"];
      newClassmate.forEach((classmateItem) => {
        if (userInfoItem["_id"] == classmateItem["_userid"]) {
          userInfoItem["apply_date"] = classmateItem["date"];
        }
      });
    });
    return userInfo;
  },
  /* 拒绝新同学加入 */
  async rejectNewClassmateJoin(event) {
    let _classid = event._classid;
    let _userid = event._userid;

    let removeResult = await DB.collection("school_class_apply")
      .where({
        _classid,
        _userid,
      })
      .remove()
      .then((res) => {
        if (res.errMsg == "collection.remove:ok") {
          return res.stats.removed;
        }
      });
    return removeResult;
  },
  /* 同意新同学加入 */
  async agreeNewClassmateJoin(event) {
    let _classid = event._classid;
    let _userid = event._userid;

    /* 查询班级信息 */
    let classInfo = await DB.collection("school_class")
      .where({
        _id: _classid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (classInfo.length == 0) {
      return {
        error: 404,
        code: 404001,
        message: "班级不存在",
      };
    }
    classInfo = classInfo[0];

    /* 加入班级 */
    let joinClassResult = await joinClass(
      _userid,
      classInfo["_schoolid"],
      _classid
    );
    //已经加入了
    if (joinClassResult.error && joinClassResult.code == 409001) {
      /*更新班级同学数量*/
      //获取班级同学数量
      await DB.collection("user_joined_class")
        .where({
          _classid,
        })
        .count()
        .then(async (res) => {
          await DB.collection("school_class")
            .where({
              _classid,
            })
            .update({
              data: {
                students: res.total,
              },
            });
        });
      //删除申请记录
      await DB.collection("school_class_apply")
        .where({
          _classid,
          _userid,
        })
        .remove();

      return {
        message: "同意成功409",
      };
    }

    /* 查询是否已经加入班级所在学校 */
    let joinClassSchoolLog = await DB.collection("user_joined_school")
      .where({
        _schoolid: classInfo["_schoolid"],
        _userid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    //没有加入该班级所在的学校
    if (joinClassSchoolLog.length == 0) {
      await DB.collection("user_joined_school")
        .add({
          data: {
            _schoolid: classInfo["_schoolid"],
            join_time: Date.now(),
            admission_time: Date.now(),
            _userid,
          },
        })
        .then(async (res) => {
          await DB.collection("school")
            .where({
              _id: classInfo["_schoolid"],
            })
            .update({
              data: {
                students: _.inc(1),
              },
            });
        });
    }

    //删除申请记录
    await DB.collection("school_class_apply")
      .where({
        _classid,
        _userid,
      })
      .remove();
    return {
      message: "同意成功",
    };
  },
  /* 获取同学列表 */
  async getStudent(event) {
    let _classid = event._classid;

    let students = await DB.collection("user_joined_class")
      .where({
        _classid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });

    if (students.length == 0) {
      return [];
    }
    let userId = [];

    students.forEach((item) => {
      userId.push(item._userid);
    });

    let userInfo = await DB.collection("user")
      .aggregate()
      .lookup({
        from: "user_profile",
        localField: "_id",
        foreignField: "_userid",
        as: "profile",
      })
      .match({
        _id: _.in(userId),
      })
      .end()
      .then((res) => {
        return res["list"];
      });
    userInfo.forEach((item, index) => {
      item = Object.assign(item, item["profile"][0]);
      delete item["profile"];
      userInfo[index] = item;
    });

    return userInfo;
  },
  /* 保存到相册 */
  async saveAlbum(event) {
    const wxContext = cloud.getWXContext();
    let _classid = event._classid;
    let _fileid = event._fileid;
    let type = event.type;

    let data = {
      _classid,
      _fileid,
      _author: wxContext.OPENID,
      dateline: Date.now(),
      likes: 0,
      type,
    };
    if (type == "video") {
      data["duration"] = event.duration;
      data["cover"] = event.cover;
    }
    let addResult = await DB.collection("school_class_album")
      .add({
        data,
      })
      .then((res) => {
        return res;
      })
      .catch((res) => {
        return res;
      });
    if (addResult._id) {
      await DB.collection("school_class")
        .doc(_classid)
        .update({
          data: {
            album_count: _.inc(1),
          },
        });
    }
    return {
      message: "保存成功",
      _id: addResult["_id"],
    };
  },
  /* 删除相册内容 */
  async deleteAlbumContent(event) {
    let _fileid = event._fileid;
    let _classid = event._classid;
    let _id = event._id;
    let type = event.type;

    let fileList = [_fileid];
    if (type == "video") {
      if (event.cover) {
        fileList.push(event.cover);
      }
    }
    await cloud.deleteFile({
      fileList,
    });

    await DB.collection("school_class_album")
      .where({
        _id,
        _classid,
      })
      .remove();

    await DB.collection("school_class")
      .doc(_classid)
      .update({
        data: {
          album_count: _.inc(-1),
        },
      });
    return {
      message: "删除成功",
    };
  },
  async inviteAgreeJoinClass(event) {
    let _classid = event._classid;
    let _schoolid = event._schoolid;
    const wxContext = cloud.getWXContext();

    let classInfo = await DB.collection("school_class")
      .where({
        _id: _classid,
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    if (classInfo.length == 0) {
      return {
        error: 404,
        code: 404001,
        message: "班级不存在",
      };
    }
    classInfo = classInfo[0];

    let joinClassResult = await joinClass(
      wxContext.OPENID,
      _schoolid,
      _classid
    );

    if (joinClassResult.error) {
      return joinClassResult;
    }

    /* 查询是否已经加入班级所在学校 */
    let joinClassSchoolLog = await DB.collection("user_joined_school")
      .where({
        _schoolid: classInfo["_schoolid"],
      })
      .get()
      .then((res) => {
        return res["data"];
      });
    //没有加入该班级所在的学校
    if (joinClassSchoolLog.length == 0) {
      DB.collection("user_joined_school")
        .add({
          data: {
            _schoolid: classInfo["_schoolid"],
            join_time: Date.now(),
            admission_time: Date.now(),
            _userid: wxContext.OPENID,
          },
        })
        .then((res) => {
          DB.collection("school")
            .where({
              _id: classInfo["_schoolid"],
            })
            .update({
              data: {
                students: _.inc(1),
              },
            });
        });
    }

    return {
      message: "加入成功",
    };
  },
  /* 退出班级 */
  async quitClass(event) {
    const wxContext = cloud.getWXContext();
    let classId = event.classId;
    await Class.where({
      _id: classId,
    }).update({
      data: {
        students: _.inc(-1),
      },
    });
    await DB.collection("user_joined_class")
      .where({
        _classid: classId,
        _userid: wxContext.OPENID,
      })
      .remove();

    return Response.result(true);
  },
  async getClassApplyJoinedCount(event) {
    let _classid = event._classid;

    let result= await DB.collection("school_class_apply")
      .where({
        _classid,
      })
      .count()
      .then(r=>r['total']);

      return result;
  },
  async getAlbumContent(event){
    let _classid=event._classid;
    let limit=event.limit||15;
    let page=event.page||0;
    let type=event.type||"photo";

    let result=await DB.collection('school_class_album').where({
      _classid,
      type
    })
    .limit(limit)
    .skip(page*limit)
    .get().then(res=>res['data']);

    return result;
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  const methods = [
    "getClassByNumberId",
    "applyJoinClass",
    "saveClassInfo",
    "getClassBySchoolId",
    "getNewClassmate",
    "rejectNewClassmateJoin",
    "agreeNewClassmateJoin",
    "getStudent",
    "saveAlbum",
    "deleteAlbumContent",
    "inviteAgreeJoinClass",
    "getClassByClassId",
    "quitClass",
    "getClassApplyJoinedCount",
    "getAlbumContent"
  ];
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
