const cloud = require("wx-server-sdk");
const Response = require("../response");

cloud.init();

const DB = cloud.database();
const _ = DB.command;
const $ = _.aggregate;

const SortIdentifier = DB.collection("post_sort_field");

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
      .get()
      .then((res) => res["data"]);
    if (userGroup.length == 0) {
      userGroup = [];
    } else {
      userGroup = userGroup[0]["group"];
    }
    let result = await DB.collection("post_sort")
      .where({
        allow_group: _.eq(userGroup).or(_.eq(null)).or(_.exists(false)),
      })
      .get();

    return result;
  },
  async getSortField(event) {
    let sortIdentifier = event.sort_identifier;

    let sortField = await SortIdentifier.where({
      sort_identifier: sortIdentifier,
    })
      .get()
      .then((res) => res["data"]);

    return sortField;
  },
};

module.exports = functions;
