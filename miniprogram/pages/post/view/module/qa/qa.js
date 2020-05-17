export default Behavior({
  data: {
    templateData:{
      showAllContent: false,
    }
  },
  methods: {
    displayAllContent() {
      this.setData({
        "templateData.showAllContent": true,
      });
    },
  },
});
