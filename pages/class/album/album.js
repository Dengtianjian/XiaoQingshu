// pages/class/album/album.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: {
      photo: "照片",
      video: "视频"
    },
    photos: [
      {
        id: 0,
        url: "https://template.canva.cn/EADcCHxozWY/1/0/400w-s4rbPjj9a4E.jpg"
      }, {
        id: 1,
        url: "https://template.canva.cn/EADcCNQJ6DU/1/0/400w-SSb0xG6U7Ts.jpg"
      }, {
        id: 2,
        url: "https://template.canva.cn/EADcB6qbIos/1/0/400w-aPcaRy_1Qps.jpg"
      }, {
        id: 3,
        url: "https://template.canva.cn/EADcCLme0bc/1/0/400w-7DXWqxysMXQ.jpg"
      }, {
        id: 4,
        url: "https://template.canva.cn/EADhZsT9UXk/1/0/400w-Klvuo0ABDb4.jpg"
      }, {
        id: 5,
        url: "https://template.canva.cn/EADcCSmIxGc/1/0/400w-ZS9CX4sj6R0.jpg"
      }
    ],
    hiddenPreviewVideoPopup:true,
    currentPreviewVideo:"",
    videos:[
      {
        cover:"/material/images/index.png",
        url:'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/2fcc59275285890794073114126/ySa5LZ3k4EcA.mp4'
      },{
        cover:"/material/images/index.png",
        url:'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ee16a5285890794073203247/okwtzftAVuwA.mp4'
      },{
        cover:"/material/images/index.png",
        url:'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ed9255285890794073203062/JyqT3zzDH4MA.mp4'
      },{
        cover:"/material/images/index.png",
        url:"http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/30287db75285890794073167278/WVQpwkgnb9EA.mp4"
      },{
        cover:"/material/images/index.png",
        url:"http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/30287db75285890794073167278/WVQpwkgnb9EA.mp4"
      }
    ]
  },

  uploadPhoto(){
    wx.chooseImage().then(res=>{
      let length=this.data.photos.length;
      let arrayIndex="";
      res.tempFilePaths.map((item,index)=>{
        arrayIndex=`photos[${length+index}]`;
        this.setData({
          [arrayIndex]:{
            id:arrayIndex,
            url:item
          }
        });
      });
    })
  },
  previewPhoto(e) {
    let index=e.currentTarget.dataset.index;
    let urls = [];
    let photos = this.data.photos;
    photos.forEach(element => {
      urls.push(element.url);
    });
    wx.previewImage({
      current:urls[index],
      urls
    });
  },
  deletePhoto(e){
    let _this=this;
    wx.showModal({
      title:"Are you 确定？",
      content:"确定要删除这张照片吗？",
      success(res){
        if(res.confirm){
          let index=e.currentTarget.dataset.index;
          let key=`photos[${index}]`;
          _this.setData({
            [key]:"deleted"
          });
        }
      }
    });

  },
  uploadVideo(){
    let _this=this;
    let videos=this.data.videos;
    wx.chooseVideo({
      success(e) {
        wx.showLoading({
          title:"上传中"
        });
        wx.cloud.uploadFile({
          cloudPath:`${Math.random()}.jpg`,
          filePath:e.thumbTempFilePath,
          success(res){
            wx.cloud.getTempFileURL({
              fileList:[
                {
                  fileID:res['fileID']
                }
              ]
            }).then(result=>{
              videos.push({
                url:e.tempFilePath,
                cover:result['fileList'][0]['tempFileURL']
              });
              _this.setData({
                videos
              });
              wx.hideLoading();
            });
          }
        });
      }
    })
  },
  previewVideo(e){
    let videos=this.data.videos;
    let dataset=e.currentTarget.dataset;
    if(videos[dataset['index']]=="deleted"){
      wx.showToast({
        title:"视频已被删除",
        icon:"none"
      });
      return;
    }
    this.setData({
      hiddenPreviewVideoPopup:false,
      currentPreviewVideo:videos[dataset['index']]['url']
    });
  },
  deleteVideo(e){
    let _this=this;
    wx.showModal({
      title:"Are you 确定？",
      content:"确定要删除这条视频吗？",
      success(res){
        if(res.confirm){
          let index=e.currentTarget.dataset.index;
          let key=`videos[${index}]`;
          _this.setData({
            [key]:"deleted"
          });
        }
      }
    });

  },
  cancelPreviewVideo(){
    this.setData({
      hiddenPreviewVideoPopup:true
    });
  }
})