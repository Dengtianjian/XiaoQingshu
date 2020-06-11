// components/commentItem/commentItem.js
import Cloud from "../../source/js/cloud";
import Prompt from "../../source/js/prompt";
const App=getApp();
Component({
  options: {
    multipleSlots: true,
    styleIsolation: "apply-shared",
  },
  /**
   * 组件的属性列表
   */
  properties: {
    comment: {
      type: Object,
    },
    showLike: {
      type: Boolean,
      value: true,
    },
  },
  lifetimes: {

  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  commentContentEditorContext: null,
  methods: {
    async like() {
      if(App.userInfo.isLogin==false){
        Prompt.toast("请登录后再点赞哦");
        return;
      }
      if (this.data.comment.isLike) {
        await Cloud.cfunction("Post", "cancelLikeComment", {
          commentid: this.data.comment._id,
        }).then((res) => {
          this.setData({
            [`comment.isLike`]: false,
            [`comment.likes`]: this.data.comment.likes - 1,
          });
        });
      } else {
        let that = this;
        await Cloud.cfunction("Post", "likeComment", {
          commentid: this.data.comment._id,
        })
          .then((res) => {
            this.setData({
              [`comment.isLike`]: true,
              [`comment.likes`]: this.data.comment.likes + 1,
            });
          })
          .catch((res) => {
            Prompt.codeToast(res.error, res.code, {
              409: {
                409001: {
                  title: "已经点赞过了",
                  success() {
                    that.setData({
                      [`comment.isLike`]: true,
                    });
                  },
                },
              },
            });
          });
      }
    },
  },
});
