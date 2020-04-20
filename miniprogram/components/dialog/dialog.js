// components/confirm/confirm.js
Component({
  options:{
    multipleSlots: true,
    styleIsolation:"apply-shared"
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title:String,
    content:String,
    hidden:{
      type:Boolean,
      value:true
    },
    height:{
      type:String,
      value:"400rpx"
    },
    cancelButton:{
      type:String,
      value:"取消"
    },
    confirmButton:{
      type:String,
      value:"确认"
    },
    overlay:{
      type:Boolean,
      value:true
    },
    textAlign:{
      type:String,
      value:"left"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancel(){
      console.log("✋");
      this.triggerEvent("cancel");
    },
    confirm(){
      console.log("👌")
      this.triggerEvent("confirm");
    }
  }
})
