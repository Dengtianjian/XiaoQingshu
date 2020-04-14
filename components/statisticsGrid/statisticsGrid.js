// components/statisticsGrid/statisticsGrid.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    color:{
      type:String,
      value:"white"
    },
    titleFontSize:{
      type:String,
      value:"24rpx"
    },
    countFontSize:{
      type:String,
      value:"36rpx"
    },
    statistics:{
      type:Array,
      value:[]
    }
  },

  lifetimes:{
    ready(){
      let length=this.data.statistics.length;
      let result=Math.round(100/length);
      this.setData({
        itemWidth:`${result}%`
      });
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    itemWidth:"33.3%",
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
