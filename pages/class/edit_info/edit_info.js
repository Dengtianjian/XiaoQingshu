// pages/class/edit_info/edit_info.js
import CHPrompt from "../../../source/js/prompt";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    createdData:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let date=new Date();
    let dateString=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    this.setData({
      createdData:dateString
    });
  },

  saveClassInfo(e){
    CHPrompt.toast("保存成功",{
      switchTab:"/pages/class/index/index"
    });
  }
})