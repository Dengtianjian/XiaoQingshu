// pages/post/view/view.js
const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navigationBarHeight:0,
    post: {
      title: "广东确定开学时间，“乐疯的”家长还需站好最后一岗",
      author: {
        nickname: "May",
        avatar:
          "https://template.canva.cn/EADcc0Btzak/1/0/400w-4d-QTEYrdNI.jpg",
        school: "西南大学",
        prefessional: "金融",
        isAttention: false,
      },
      content: `“神兽回归！👨老师们辛苦了”，这恐怕是很多家长在
      4月9日下午得知广东省开学时间后 😄
      特别是中小学开学时间后的心情。广东省新冠肺
      炎疫情防控指挥部经研究决定，全省各级各类学校学生
      📅4月27日起，分期、分批、错峰返校。
      大家用“重磅”“终于”“广东退出群聊”表达着
      内心的激动🤩`,
      images: [
        "https://template.canva.cn/EADcCF_XVWk/1/0/400w-j88eWZY7WPo.jpg",
        "https://template.canva.cn/EADcCqn6Y9M/1/0/400w-i6daPhDo2K4.jpg",
        "https://template.canva.cn/EADhZkiUSdg/1/0/400w-P_Ai1uZE8Lo.jpg",
        "https://template.canva.cn/EADcCNWSPPg/1/0/400w-Ox2UTg-Ww-Y.jpg",
      ],
      type: "qa",
      topic: "全国性哀悼活动",
      dataline: "昨晚 凌晨02:45",
    },
    isHiddenCommentPopup: true,
    hiddenCommentPopupTextarea: true,
    isHiddenCommentReplyPopup:true
  },
  onReady() {
    this.setData({
      navigationBarHeight:app.globalData.navigationBarHeight
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let config = { title: post.title, path: "/pages/post/view/view" };
    if (post.images.length > 0) {
      config["imageUrl"] = post["images"][0];
    }
    return config;
  },
  showCommentPopup() {
    this.setData({
      isHiddenCommentPopup: false,
    });
    this.animate(
      ".comment-post-form",
      [{ top: "100%", ease: "ease-out" }, { top: 0 }],
      300,
      () => {
        this.setData({
          hiddenCommentPopupTextarea: false,
        });
      }
    );
  },
  hiddenCommentPopup() {
    this.animate(
      ".comment-post-form",
      [
        { top: "0" },
        { top: "-100%" },
      ],
      300,
      () => {
        this.setData({
          isHiddenCommentPopup: true,
          hiddenCommentPopupTextarea: true,
        });
      }
    );
  },
  showAllCommentReply(){
    this.setData({
      isHiddenCommentReplyPopup:false
    })
  }
});
