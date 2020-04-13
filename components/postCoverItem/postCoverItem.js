// components/postCoverItem/postCoverItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: "common"
    }
  },

  ready() {
    let type = this.data.type;
    let templateName = "common-post";
    let postBodyClass = "";
    switch (type) {
      case "common":
        templateName = "common-post";
        postBodyClass = "post-body-common";
        break;
      case "qa":
        templateName = "qa-post";
        postBodyClass = "post-body-qa";
        break;
    }
    this.setData({
      templateName,
      postBodyClass
    });
  },

  /**
   * 组件的初始数据
   */
  data: {
    templateName: "common-post",
    postBodyClass: "post-body-common"
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
