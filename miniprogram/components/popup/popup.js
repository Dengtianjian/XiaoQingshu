// components/popup/popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hidden: {
      type: Boolean,
      observer(e) {

      },
    },
    position: {
      type: String,
      observer(e) {
        switch (e) {
          case "center":
            this.setData({
              positionStyle:
                "top:0;left:0;right:0;bottom:0;margin:auto;border-radius:30rpx;width:690rpx;height:400rpx;",
            });
            break;
          case "top":
            this.setData({
              positionStyle:
                "top:0;min-height:60rpx;width:100%;border-radius:0 0 30rpx 30rpx;",
            });
            break;
          case "right":
            this.setData({
              positionStyle: "right:0;height:100%;min-width:140rpx;",
            });
            break;
          case "left":
            this.setData({
              positionStyle: "left:0;height:100%;min-width:140rpx;",
            });
            break;
          case "bottom":
            this.setData({
              positionStyle:
                "bottom:0;min-height:60rpx;width:100%;border-radius:30rpx 30rpx 0 0;",
            });
            break;
        }
      },
    },
    customStyle: {
      type: String,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    positionStyle: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hiddenPopup() {
      this.setData({
        hidden: true,
      });
    },
  },
});
