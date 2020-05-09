// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    finished:{
      type:Boolean,
      value:false
    },
    loading:{
      type:Boolean,
      value:false
    },
    finishedText:{
      type:String,
      value:"已经加载完成"
    },
    loadingText:{
      type:String,
      value:"加载中..."
    },
    loadingPrompt:{
      type:String,
      value:"上拉加载更多"
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

  }
})
