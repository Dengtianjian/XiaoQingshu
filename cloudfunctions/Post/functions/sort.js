const cloud = require("wx-server-sdk");
const Response = require("../response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const $ = _.aggregate;

let functions = {
  async getSort() {
    const wxContext = cloud.getWXContext();

    let userGroup = await DB.collection("user")
      .where({
        _id: wxContext.OPENID,
      })
      .field({
        group: true,
      })
      .get();
    userGroup = userGroup["data"][0]["group"];
    let result = await DB.collection("post_sort")
      .where({
        allow_group: _.eq(userGroup).or(_.eq(null)),
      })
      .get();

    return result;
  },
};

module.exports = functions;
