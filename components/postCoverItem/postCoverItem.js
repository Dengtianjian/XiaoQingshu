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
    let templateData=null;
    switch (type) {
      case "common":
        templateName = "common-post";
        postBodyClass = "post-body-common";
        templateData={
          images:[
            "http://t7.baidu.com/it/u=378254553,3884800361&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1587393770&t=b98b180f3ea57f9dd2aadba556543e1d",
            "http://t8.baidu.com/it/u=3571592872,3353494284&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1587393770&t=b50575157de1241e59bdc4b0709f3270",
            "http://t7.baidu.com/it/u=3616242789,1098670747&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1587393770&t=fc2c3a31f969369cf4662ccb6e468317",
            "http://img8.zol.com.cn/bbs/upload/23197/23196119.jpg",
            "http://attach.bbs.miui.com/forum/201310/19/235356fyjkkugokokczyo0.jpg"
          ]
        };
        break;
      case "qa":
        templateName = "qa-post";
        postBodyClass = "post-body-qa";
        templateData="";
        break;
    }
    this.setData({
      templateName,
      postBodyClass,
      templateData
    });
  },

  /**
   * 组件的初始数据
   */
  data: {
    templateName: "common-post",
    postBodyClass: "post-body-common",
    templateData:null
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
