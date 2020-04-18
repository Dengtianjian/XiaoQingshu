// components/chEditor/chEditor.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    editorContext:null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onEditorReady(){

    },
    insert(){
      wx.createSelectorQuery().select(".toolbar").boundingClientRect().exec(function(res){
        console.log(res);
      });
    }
  }
})
