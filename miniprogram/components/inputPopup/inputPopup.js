// components/inputPopup/inputPopup.js
const App = getApp();
Component({
  options:{
    multipleSlots:true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    hidden: {
      type: Boolean,
      value: true,
    },
    submitButtonText: {
      type: String,
      value: "保存",
    },
    contentPlaceholder: {
      type: String,
      value: "请注意文明发言，做一个有素质的学生",
    },
  },

  lifetimes: {
    attached() {
      this.setData({
        navigatorHeight: App.globalData.navigationBarHeight,
      });
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    navigatorHeight: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    submit(e){
      this.triggerEvent("submit",e.detail.value);
    }
  },
});
