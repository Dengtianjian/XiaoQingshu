// components/popup/popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hidden: {
      type: Boolean
    },
    position: {
      type: String,
      observer(e) {
        let roundCss="";
        switch (e) {
          case "center":
            if(this.data.round){
              roundCss="border-radius:30rpx;";
            }
            this.setData({
              style:
                "top:0;left:0;right:0;bottom:0;margin:auto;width:690rpx;height:400rpx;"+roundCss,
            });
            break;
          case "top":
            if(this.data.round){
              roundCss="border-radius:0 0 30rpx 30rpx;";
            }
            this.setData({
              style:
                "top:0;min-height:60rpx;width:100%;"+roundCss,
            });
            break;
          case "right":
            if(this.data.round){
              roundCss="border-radius:30rpx 0 0 30rpx;";
            }
            this.setData({
              style: "right:0;height:100%;min-width:140rpx;"+roundCss,
            });
            break;
          case "left":
            if(this.data.round){
              roundCss="border-radius:0 30rpx 30rpx 0;";
            }
            this.setData({
              style: "left:0;height:100%;min-width:140rpx;"+roundCss,
            });
            break;
          case "bottom":
            if(this.data.round){
              roundCss="border-radius:30rpx 30rpx 0 0;";
            }
            this.setData({
              style:
                "bottom:0;min-height:60rpx;width:100%;"+roundCss,
            });
            break;
        }
      }
    },
    customStyle: {
      type: String,
    },
    overlay:{
      type:Boolean,
      value:true
    },
    round:{
      type:Boolean,
      value:true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    style:""
  },

  attache(){

  },

  /**
   * 组件的方法列表
   */
  methods: {
    hiddenPopup() {
      this.setData({
        hidden: true,
      });
      this.triggerEvent("hiddenPopup",{hidden:this.data.hidden});
    },
  },
});
