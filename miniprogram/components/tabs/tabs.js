// components/tabs/tabs.js
Component({
  options: {
    multipleSlots: true
  },
  lifetimes: {
    attached() {
      let tabs = this.data.tabs;
      tabs = Object.keys(tabs);
      let current = "";
      if (this.data.current) {
        current = this.data.current;
      } else {
        current = tabs[0];
      }
      this.setData({
        current,
        active: tabs.indexOf(current)
      });
    },
    ready() {
      setTimeout(() => {
        this.computedSwiperHeight()
      }, 1000);
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: {
      required: true,
      type: Object
    },
    current: {
      type: [String, Number],
      value: ""
    },
    swiperHeight:{
      type:Number,
      value:"200"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    postSwiperSwitch(e) {
      let index = e.detail.current;
      let tabs = this.data.tabs;
      tabs = Object.keys(tabs);
      this.setData({
        "active": index,
        "current": tabs[index]
      });
      wx.pageScrollTo({
        scrollTop:0
      });
      this.triggerEvent("change",{
        current:this.data.current
      });
    },
    switchPostSwiper(e) {
      let tabs = this.data.tabs;
      tabs = Object.keys(tabs);
      let key = e.currentTarget.dataset.index;
      this.setData({
        "active": tabs.indexOf(key),
        "current": key
      });
      wx.pageScrollTo({
        scrollTop:0
      });
    },
    computedSwiperHeight() {
      let query = wx.createSelectorQuery().in(this);
      query.select(`.swiper-item-${this.data.current}`).boundingClientRect();
      query.exec((res) => {
        if(parseInt(res[0].height)>parseInt(this.data.swiperHeight)){
          this.setData({
            "swiperHeight": res[0].height
          });
        }
      });
    }
  }
})
