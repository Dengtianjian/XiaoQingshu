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
    },
    backgroundColor:{
      type:String,
      value:"white"
    },
    opacity:{
      type:Number,
      value:1
    }
  },
  observers:{
    pageScrollTop(scrollTop){
      let colorValue=0.004*parseFloat(`${scrollTop}`);
      if(scrollTop<300){
        this.setData({
          barOpacity:colorValue
        })
      }else{
        this.setData({
          barOpacity:this.data.opacity
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
