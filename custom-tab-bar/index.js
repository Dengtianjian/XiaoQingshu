Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/material/tabbar/home.png",
      selectedIconPath: "/material/tabbar/home.png",
      text: "首页"
    }, {
        pagePath: "/pages/school/school",
        iconPath: "/material/tabbar/school.png",
        selectedIconPath: "/material/tabbar/school.png",
        text: "学校"
      }, {
        pagePath: "/pages/class/class",
        iconPath: "/material/tabbar/class.png",
        selectedIconPath: "/material/tabbar/class.png",
        text: "班级"
      }, {
        pagePath: "/pages/mine/mine",
        iconPath: "/material/tabbar/mine.png",
        selectedIconPath: "/material/tabbar/mine.png",
        text: "自己"
      }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})