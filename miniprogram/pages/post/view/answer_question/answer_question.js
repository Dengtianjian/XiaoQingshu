// miniprogram/pages/post/view/answer_question/answer_question.js
import { Cloud,Prompt } from "../../../../Qing";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    postid: null,
    formats: {},
    keyboardHeight: 0,
    editorHeight: 300,
    isIOS: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let postid = options.postid;
    postid ="baada3ac5ee07048008d64d20578dec1";

    let platform = wx.getSystemInfoSync().platform;

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
        // wx.pageScrollTo({
        //   scrollTop: 0,
        //   success() {
        //     that.updatePosition(keyboardHeight);
        //     that.answerEditorContext.scrollIntoView();
        //   },
        // });
        that.updatePosition(keyboardHeight);
        that.answerEditorContext.scrollIntoView();
      }, duration);
    });

    this.setData({
      postid,
    });
  },

  answerEditorContext: null,
  answerEditorReady() {
    wx.createSelectorQuery()
      .select("#answerEditor")
      .context((res) => {
        this.answerEditorContext = res.context;
      })
      .exec();
  },

  updatePosition(keyboardHeight) {
    const toolbarHeight = 50;
    const { windowHeight, platform } = wx.getSystemInfoSync();
    let editorHeight = windowHeight - keyboardHeight;
    editorHeight-=60+30+toolbarHeight;
    this.setData({ editorHeight, keyboardHeight });
  },

  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync();
    const { statusBarHeight, platform } = systemInfo;
    const isIOS = platform === "ios";
    const navigationBarHeight = isIOS ? 44 : 48;
    return statusBarHeight + navigationBarHeight;
  },

  answerEditorBlur() {
    this.answerEditorContext.blur();
  },

  format({
    target: {
      dataset: { name, value },
    },
  }) {
    if (!name) return;
    this.answerEditorContext.format(name, value);
  },
  removeFormat() {
    this.answerEditorContext.removeFormat();
  },

  answerEditorStatusChange({ detail: formats }) {
    this.setData({
      formats,
    });
  },
  editorUndo() {
    this.answerEditorContext.undo();
  },
  editorRedo() {
    this.answerEditorContext.redo();
  },
  insertDivider() {
    this.answerEditorContext.insertDivider();
  },
  insertImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      success(res) {
        that.answerEditorContext.insertImage({
          src: res.tempFilePaths[0],
          alt: "图片加载失败",
          width:"80%",
          extClass:"answer-question-content-image"
        });
      },
    });
  },
  sendAnswer(){
    const that=this;
    this.answerEditorContext.getContents({
      async success(res){
        let content=res.html;
        // let files=content.match(/(?<=(src="))[^"]*?(?=")/ig);
        let files=[];
        let imgReg=/<img.*?(?:>|\/>)/gi;
        let imgs=content.match(imgReg);
        if(imgs){
          let srcReg=/src=[\'\"]?([^\'\"]*)[\'\"]?/i;
          for(let i=0;i<imgs.length;i++){
            let src=imgs[i].match(srcReg);

            files.push(src[1]);
          }
        }
        if(files&&files.length>0){
          let fileList=await Cloud.uploadFile(files).then(res=>res);
          await wx.cloud.getTempFileURL({
            fileList
          }).then(res=>{
            let tempFiles=res.fileList;
            files.forEach((item,index)=>{
              content=content.replace(item,tempFiles[index]['tempFileURL']);
            });
          });
        }

        wx.showLoading({
          title: "发送中",
        });
        Cloud.cfunction("Post", "saveAnswer", {
          content,
          postid: that.data.postid,
        }).then((res) => {
          wx.hideLoading();

          Prompt.toast("回答成功", {
            success() {
              wx.redirectTo({
                url:"/pages/post/view/index/index?postid="+that.data.postid
              });
            },
          });
        });
      }
    })
  }
});
