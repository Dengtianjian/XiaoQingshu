Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/material/tabbar/home.png",
      selectedIconPath: "/material/temp/20.png",
      text: "首页"
    }, {
        pagePath: "/pages/school/index/index",
        iconPath: "/material/tabbar/school.png",
        selectedIconPath: "/material/temp/19.png",
        text: "学校"
      }, {
        pagePath: "/pages/class/index/index",
        iconPath: "/material/tabbar/class.png",
        selectedIconPath: "/material/temp/18.png",
        text: "班级"
      }, {
        pagePath: "/pages/my/index/index",
        iconPath: "/material/tabbar/my.png",
        selectedIconPath: "/material/temp/17.png",
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