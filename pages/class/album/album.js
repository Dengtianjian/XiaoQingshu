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
        url: "https://template.canva.cn/EADcCC4Unmk/1/0/400w-miRtx3gVgnc.jpg"
      }, {
        id: 1,
        url: "https://template.canva.cn/EADcCC4Unmk/1/0/400w-miRtx3gVgnc.jpg"
      }, {
        id: 2,
        url: "https://template.canva.cn/EADcCC4Unmk/1/0/400w-miRtx3gVgnc.jpg"
      }, {
        id: 3,
        url: "https://template.canva.cn/EADcCC4Unmk/1/0/400w-miRtx3gVgnc.jpg"
      }, {
        id: 4,
        url: "https://template.canva.cn/EADcCC4Unmk/1/0/400w-miRtx3gVgnc.jpg"
      }, {
        id: 5,
        url: "https://template.canva.cn/EADcCC4Unmk/1/0/400w-miRtx3gVgnc.jpg"
      }
    ],
    hiddenPreviewVideoPopup:true,
    // videos: [
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/2dbe7eca5285890794073052281/447nYOh5H2IA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/302875785285890794073167099/HhGL7OJObiYA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/30287db75285890794073167278/WVQpwkgnb9EA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320e66af5285890794073202694/8ksYlGUevogA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/30010ead5285890794073141537/DGAx2EgLMEYA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ed9255285890794073203062/JyqT3zzDH4MA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ee16a5285890794073203247/okwtzftAVuwA.mp4',
    //   'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/2fcc59275285890794073114126/ySa5LZ3k4EcA.mp4'
    // ],
    videos:[
      {
        url:'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/2fcc59275285890794073114126/ySa5LZ3k4EcA.mp4'
      },{
        url:'http://1252076676.vod2.myqcloud.com/d7eee309vodgzp1252076676/320ee16a5285890794073203247/okwtzftAVuwA.mp4'
      }
    ],
    videoList:[],
  },

  previewImage(e) {
    let urls = [];
    let photos = this.data.photos;
    photos.forEach(element => {
      urls.push(element.url);
    });
    wx.previewImage({
      urls
    });
  },
  chooseVideo() {
    let _this=this;
    let videos=this.data.videos;
    wx.chooseVideo({
      success(e) {
        videos.push({
          url:e.tempFilePath,
          cover:e.thumbTempFilePath
        });
        _this.setData({
          videos
        });
      }
    })
  },
  previewVideo(e){
    let videos=this.data.videos;
    let videoList=videos.map((item,index)=>({ id: index + 1, url:item['url'] }));
    let dataset=e.currentTarget.dataset;
    this.setData({
      hiddenPreviewVideoPopup:false,
      videoList
    });
  },
  cancelPreviewVideo(){
    this.setData({
      hiddenPreviewVideoPopup:true
    });
  }
})