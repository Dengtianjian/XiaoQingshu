const cloud = require("wx-server-sdk");
cloud.init();
const DB = cloud.database();
const _ = DB.command;
const NotificationType = DB.collection("notification_type");

module.exports = {
  async getType(identifier) {
    let type = await NotificationType.where({
      identifier,
    })
      .get()
      .then((res) => res["data"]);
    return type;
  },
  async getParam(type, parameter) {
    let returnData = {
      template: null,
      parameter: {},
      identifier: null,
    };
    let typeConfig = await this.getType(type);
    if (typeConfig.length > 0) {
      typeConfig = typeConfig[0];
    } else {
      return null;
    }
    returnData["identifier"] = typeConfig["identifier"];

    returnData["content"] = typeConfig["template"];
    if (typeConfig["template"] != null && typeConfig["parameter"] != null) {
      for (let i = 0; i < typeConfig["parameter"].length; i++) {
        returnData["content"]=returnData["content"].replace(
          `{${typeConfig["parameter"][i]}}`,
          parameter[typeConfig["parameter"][i]]
        );
      }
    }
    if (typeConfig["parameter"] != null) {
      for (let i = 0; i < typeConfig["parameter"].length; i++) {
        returnData["parameter"][typeConfig["parameter"][i]] =
          parameter[typeConfig["parameter"][i]];
      }
    }

    return returnData;
  },
};
