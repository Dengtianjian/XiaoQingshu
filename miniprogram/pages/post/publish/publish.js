// pages/publish_post/publish_post.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList:[],
    topic:{
      id:"",
      text:""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  uploadImage(){
    let currentCount=this.data.imageList.length;
    if(currentCount>=9){
      wx.showToast({
        icon:"none",
        title:"最多只允许上传9张图片"
      });
      return;
    }
    wx.chooseImage({
      count:9-currentCount,
    }).then(res=>{
      let filePaths=res.tempFilePaths;
      if(filePaths.length>0){
        let imageList=this.data.imageList;
        for(let i=0;i<filePaths.length;i++){
          filePaths[i]={
            id:currentCount+i,
            url:filePaths[i]
          }
        }
        imageList.unshift(...filePaths);
        this.setData({
          imageList
        });
      }
    });
  },
  previewImage(option){
    let index=option.currentTarget.dataset.index;
    let imageList=this.data.imageList;
    let urls=[];
    imageList.forEach(item=>{
      urls.push(item.url);
    });
    wx.previewImage({
      urls,
      current:imageList[index]['url']
    });
  },
  publishPost(option){
    console.log(option);
  }
})