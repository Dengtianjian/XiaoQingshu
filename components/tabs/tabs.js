// components/tabs/tabs.js
Component({
  options: {
    multipleSlots: true
  },
  lifetimes: {
    ready() {
      let tabs = this.data.tabs;
      tabs = Object.keys(tabs);
      this.setData({
        "current": tabs[this.data.current]
      });
      setTimeout(()=>{
        this.computedSwiperHeight()
      },1000);
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    swiperHeight: 200,
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
      this.computedSwiperHeight();
    },
    switchPostSwiper(e) {
      let tabs = this.data.tabs;
      tabs = Object.keys(tabs);
      let key = e.currentTarget.dataset.index;
      this.setData({
        "active": tabs.indexOf(key),
        "current": key
      });
      this.computedSwiperHeight();
    },
    computedSwiperHeight() {
      let query = wx.createSelectorQuery().in(this);
      query.select(`.swiper-item-${this.data.current}`).boundingClientRect();
      query.exec((res) => {
        console.log(res);
        this.setData({
          "swiperHeight": res[0].height
        });
      });
    }
  }
})
