// components/navigationBar/navigationBar.js
const app=getApp();
Component({

  lifetimes:{
    attached(){
      this.setData({
        statusBarHeight:app.globalData.statusBarHeight
      });
    },
    ready(){
      let pages=getCurrentPages();
      let crititcal=String(this.data.crititcal);
      crititcal=crititcal.split("");
      crititcal=crititcal.reverse();
      if(crititcal.length<3){
        crititcal.splice(0,0,0);
      }
      crititcal=crititcal.join("");
      crititcal=parseFloat(`0.${crititcal}`);
      this.setData({
        count:crititcal,
        isHasBack:pages.length>1
      });
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    pageScrollTop:{
      type:Number,
      value:null
    },
    backgroundColor:{
      type:String,
      value:"#FFFFFF"
    },
    opacity:{
      type:Number,
      value:1
    },
    crititcal:{
      type:Number,
      value:50
    },
    defaultColor:{
      type:String,
      value:"#000000"
    },
    downColor:{
      type:String,
      value:"#000000"
    },
    pageTitle:{
      type:String,
      value:""
    },
    hiddenReturnPage:{
      type:Boolean,
      value:false
    }
  },
  observers:{
    pageScrollTop(scrollTop){
      let colorValue=this.data.count*parseFloat(`${scrollTop}`);
      if(colorValue<1){
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
    barOpacity:0,
    count:0,
    isHasBack:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    returnToPreviousPage(){
      wx.navigateBack({
        delta:1
      });
    }
  }
})
