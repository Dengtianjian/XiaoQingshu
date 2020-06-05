import Cloud from "../../../source/js/cloud";
import Utils from "../../../source/js/utils";
import Prompt from "../../../source/js/prompt";

// pages/publish_post/publish_post.js
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    post: null,
    images: [],
    topic: null,
    currentSort: "dynamic",
    schoolInfo: null,
    schoolEntry: false,
    evilKeywords:"",
    hideContentCheckPrompt:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let setData = {
      currentSort: options.identifier,
      schoolEntry: options.school,
    };
    if (options.postid) {
      let _postid = options.postid;
      await Cloud.cfunction("Post", "getPost", {
        postid: _postid,
      })
        .then((post) => {
          if (post["images"].length > 0) {
            setData["images"] = post["images"];
          }
          if (post["topic"]) {
            setData["topic"] = post["topic"];
          }
          if (post["_school"]) {
            setData["schoolInfo"] = post["school"];
            setData["schoolEntry"] = true;
          }
          setData["post"] = post;
        })
        .catch((res) => {
          console.log(res);
          setData = {};
          Prompt.codeToast(res.error, res.code, {
            404: {
              404001: {
                title: "帖子不存在😰",
                navigateBack: true,
              },
            },
          });
        });
    }

    this.setData(setData);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  async onReady() {
    await App.getUserInfo().then((userInfo) => {
      if (userInfo["school"]) {
        this.setData({
          schoolInfo: userInfo["school"],
        });
      }
    });
  },

  uploadImage() {
    let currentCount = this.data.images.length;
    if (currentCount >= 9) {
      wx.showToast({
        icon: "none",
        title: "最多只允许上传9张图片",
      });
      return;
    }
    wx.chooseImage({
      count: 9 - currentCount,
    }).then((res) => {
      let filePaths = res.tempFilePaths;
      if (filePaths.length > 0) {
        let isCheckFail=false;
        wx.showLoading({
          title: "上传中!Up up",
        });
        let images = this.data.images;
        let files = [];
        for (let i = 0; i < filePaths.length; i++) {
          filePaths[i] = {
            id: currentCount + i,
            url: filePaths[i],
          };
          files.push(filePaths[i]["url"]);
        }
        Cloud.uploadFile(files, "post/").then((res) => {
          images.unshift(...filePaths);

          this.setData({
            images: [],
          });
          wx.hideLoading();
        });
      }
    });
  },
  previewImage(option) {
    let index = option.currentTarget.dataset.index;
    let images = this.data.images;
    let urls = [];
    images.forEach((item) => {
      urls.push(item.url);
    });
    wx.previewImage({
      urls,
      current: images[index]["url"],
    });
  },
  goToSelectTopic() {
    let that = this;
    wx.navigateTo({
      url: "/pages/post/select_topic/select_topic",
      events: {
        selectTopic(data) {
          that.setData({
            topic: data,
          });
        },
      },
    });
  },
  removeTopic(){
    this.setData({
      topic:null
    });
  },
  async savePost(option) {
    let formValue = option.detail.value;
    let school = null;
    if (this.data.schoolInfo != null) {
      if (formValue.school_only) {
        school = this.data.schoolInfo["_id"];
      }
    }
    delete formValue["school_only"];
    let topic = this.data.topic;
    if(topic!=null){
      topic=topic['_id'];
    }
    let images = this.data.images;
    wx.showLoading({
      title: "保存中",
    });
    let _postid = null;
    if (this.data.post) {
      _postid = this.data.post._id;
    }
    //腾讯内容安全审核
    let checkResult=null;
    let contentArray=[];
    if(formValue.content.length>1990){
      let loopCount=Math.ceil(formValue.content.length/1990);
      for(let i=1;i<=loopCount;i++){
        contentArray.push(formValue.content.substr((i-1)*1990,i*1994));
      }
    }else{
      contentArray=[formValue.content];
    }

    for(let i=0;i<contentArray.length;i++){
      checkResult=await wx.serviceMarket.invokeService({
        service: 'wxee446d7507c68b11',
        api: 'msgSecCheck',
        data: {
          "Action": "TextApproval",
          "Text":contentArray[i]
        },
      }).then((res) => {
        return res.data.Response.EvilTokens;
      });
      if(checkResult.length>0){
        break;
      }
    }
    if(checkResult.length>0){
      let isFail=false;
      for(let i=0;i<checkResult.length;i++){
        if(checkResult[i]['EvilFlag']==1){
          isFail=true;
          break;
        }
      }
      if(isFail){
        Prompt.toast("发布失败，内容存在违规内容，请检查后修改，再重新提交");
        let evilKeywords=[];
        checkResult.forEach(item=>{
          evilKeywords=evilKeywords.concat(item['EvilKeywords']);
        })
        this.setData({
          evilKeywords:evilKeywords.join("、"),
          hideContentCheckPrompt:false
        });
        return;
      }
    }
    Cloud.cfunction("Post", "savePost", {
      _postid,
      ...formValue,
      _school: school,
      topic,
      images,
      sort: this.data.currentSort,
      checkResult
    }).then((res) => {
      wx.hideLoading();
      if (_postid) {
        Prompt.toast("保存成功", {
          icon: "success",
        });
      }else{
        let navigateTo="";
        if(this.data.currentSort=="qa"){
          navigateTo="/pages/post/view/qa/qa?postid="+res['_postid'];
        }else{
          navigateTo="/pages/post/view/common/common?postid="+res['_postid'];
        }
        Prompt.toast("发布成功",{
          icon:"success",
          navigateTo
        });
      }
    });
  },
});
