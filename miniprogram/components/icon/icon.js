// components/icon/icon.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    icon: {
      type: String,
      observer(e) {
        if (/qcicon/.test(e)) {
          this.setData({
            isIconFont: true,
          });
        } else if (/http|cloud|material/.test(e)) {
          let setData = {};
          if (!this.data.width && !this.data.height) {
            setData["width"] = this.data.size;
            setData["height"] = this.data.size;
          } else if (!this.data.width) {
            setData["width"] = this.data.height;
          } else if (!this.data.height) {
            setData["height"] = this.data.width;
          }
          setData["isImageIcon"] = true;
          this.setData(setData);
        }
      },
    },
    size: {
      type: String,
      value: "26rpx",
    },
    width: String,
    height: String,
    imageMode:{
      type:String,
      value:"aspectFill"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIconFont: false,
    isImageIcon: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {},
});
