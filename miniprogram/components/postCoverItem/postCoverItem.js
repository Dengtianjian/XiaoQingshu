// components/postCoverItem/postCoverItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: "common"
    },
    post:{
      type:Object,
      observe(value){
        if(!value){
          console.error("帖子组件必须传入 data");
        }
      }
    }
  },

  ready() {
    let templateName = "dynamic-post";
    let postBodyClass = "";
    let templateData={};
    switch (this.data.post.sort) {
      case "dynamic":
        templateName = "dynamic-post";
        postBodyClass = "post-body-dynamic";
        break;
      case "qa":
        templateName = "qa-post";
        postBodyClass = "post-body-qa";
        templateData={};
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
    templateName: "dynamic-post",
    postBodyClass: "post-body-dynamic",
    templateData:null
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
