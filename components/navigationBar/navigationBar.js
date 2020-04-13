// components/navigationBar/navigationBar.js
const app=getApp();
Component({

  lifetimes:{
    attached(){
      this.setData({
        statusBarHeight:app.globalData.statusBarHeight
      });
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    pageScrollTop:{
      type:Number
    }
  },
  observers:{
    pageScrollTop(scrollTop){
      // 50 2 25 3
      let oldValue=this.data.barOpacity;
      let newValue=oldValue+parseFloat(`0.${scrollTop}`);
      if(scrollTop<50){
        this.setData({
          barOpacity:newValue
        })
      }else{
        this.setData({
          barOpacity:1
        });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight:0,
    barOpacity:0
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
