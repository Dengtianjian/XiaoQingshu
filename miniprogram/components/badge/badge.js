// components/badge/badge.js
Component({
  options:{
    multipleSlots:true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    icon:{
      type:String,
      observer(e){
        if(/qcicon/.test(e)){
          this.setData({
            isIconFont:true
          });
        }else if(/http|cloud/.test(e)){
          this.setData({
            isImageIcon:true
          });
        }
      }
    },
    text:String,
    color:{
      type:String,
      value:"var(--font-color)"
    },
    background:{
      type:String,
      value:"var(--light-color)"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIconFont:false,
    isImageIcon:false
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
