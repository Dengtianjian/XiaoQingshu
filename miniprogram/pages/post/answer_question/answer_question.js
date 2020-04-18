// pages/answer_question/answer_question.js
Page({
  editorContext: null,
  /**
   * 页面的初始数据
   */
  data: {
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    formats:null
  },

  onLoad() {
    const platform = wx.getSystemInfoSync().platform;
    this.setData({
      isIOS: platform === "ios",
    });
    const that = this;
    this.updatePosition(0);
    let keyboardHeight = 0;
    wx.onKeyboardHeightChange((res) => {
      if (res.height === keyboardHeight) {
        return;
      }
      const duration = res.height > 0 ? res.duration * 1000 : 0;
      keyboardHeight = res.height;
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight);
            that.editorContext.scrollIntoView();
          },
        });
      }, duration);
    });
  },

  updatePosition(keyboardHeight) {
    const toolBarHeight = 50;
    const { windowHeight, platform } = wx.getSystemInfoSync();
    let editorHeight =
      keyboardHeight > 0
        ? windowHeight - keyboardHeight - toolBarHeight - 80
        : windowHeight;
    this.setData({
      editorHeight,
      keyboardHeight,
    });
  },

  onEditorReady() {
    wx.createSelectorQuery()
      .select("#editor")
      .context((res) => {
        this.editorContext = res.context;
      })
      .exec();
  },
  format(e) {
    let dataset = e.target.dataset;
    let { name, value } = dataset;
    if(!name){
      return;
    }
    this.editorContext.format(name,value);
  },
  editorStatusChange(e) {
    let formats=e.detail;
    this.setData({formats});
  },
  saveSubmit(){
    this.editorContext.getContents({
      success(res){
        console.log(res);
      }
    })
  }
});
