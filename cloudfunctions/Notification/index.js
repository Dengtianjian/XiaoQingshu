// 云函数入口文件
const cloud = require("wx-server-sdk");
const Response = require("./response");
const Utils = require("./Utils");
const Types = require("./Types");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const Notification = DB.collection("notification");
const NotificationType = DB.collection("notification_type");
const NotificationCategory = DB.collection("notification_category");

const MODULES = {
  async send(event) {
    let type = event.type;
    let category = event.category;
    let receiver = event.receiver || null;
    let sender = event.sender || null;
    let typeTemplate=event.typeTemplate||null;
    delete event.type;
    let typeParameter = await Types.getParam(type, event);
    if (typeParameter == null) {
      return Response.error(400, 400001, "发送失败，信息类型不存在");
    }

    let addResult = await Notification.add({
      data: {
        _category: category,
        _receiver: receiver,
        _sender: sender,
        date: Date.now(),
        _type: type,
        parameter: typeParameter["parameter"],
        content: typeParameter["content"],
        _type_template:typeTemplate
      },
    });
    return Response.result({
      notifyId: addResult["_id"],
    });
  },
  async getAllCategory(event) {
    const wxContext = cloud.getWXContext();
    let types = await NotificationCategory.get().then((res) => res["data"]);

    for (let i = 0; i < types.length; i++) {
      types[i]["latest"] = await MODULES["getNotification"]({
        category: types[i]["identifier"],
        _receiver: [0, null, wxContext.OPENID],
        page: 0,
        limit: 1,
      }).then((res) => {
        if (res["data"].length > 0) {
          return res["data"][0];
        } else {
          return null;
        }
      });
    }
    return Response.result(types);
  },
  async getNotification(event) {
    let category = event.category;
    let page = event.page || 0;
    let limit = event.limit || 6;
    let read = event.read || 0;
    let updateRead = event.updateRead || false;
    let sender = event.sender || null;
    let receiver = event.receiver || null;
    let type = event.type || null;
    let where = {};

    if (category) {
      if (Utils.getType(category) == "Array") {
        where["_category"] = _.in(category);
      } else {
        where["_category"] = category;
      }
    }
    if (read) {
      where["read"] = Boolean(read);
    }
    if (sender) {
      if (Utils.getType(sender) == "Array") {
        where["_sender"] = _.in(sender);
      } else {
        where["_sender"] = sender;
      }
    }
    if (receiver) {
      if (Utils.getType(receiver) == "Array") {
        where["_receiver"] = _.in(receiver);
      } else {
        where["_receiver"] = receiver;
      }
    }
    if (type) {
      if (Utils.getType(type) == "Array") {
        where["_type"] = _.in(type);
      } else {
        where["_type"] = type;
      }
    }

    let data = await Notification.where(where)
      .orderBy("date", "desc")
      .limit(limit)
      .skip(limit * page)
      .get()
      .then((res) => res["data"]);

    return Response.result(data);
  },
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const AllowModules = [
    "getAllCategory",
    "getNotificationByCategory",
    "getNotification",
    "send",
  ];

  let moduleName = event.module;
  if (!AllowModules.includes(moduleName)) {
    return Response.error(403, 403001, "请求参数错误");
  }
  delete event.module;
  return MODULES[moduleName](event);

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
