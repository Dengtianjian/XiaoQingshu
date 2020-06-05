// components/PostStatus/PostStatus.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    status:{
      type:String,
      value:"normal"
    },
    checkResult:{
      type:Array,
      value:[]
    },
    hideEvilKeywords:{
      type:Boolean,
      value:true
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
    displayEvilKeywords(){
      this.setData({
        hideEvilKeywords:!this.data.hideEvilKeywords
      })
    }
  }
})
