import Cloud from "../../../../../source/js/cloud";
import Pagination from "../../../../../source/js/pagination";
export default Behavior({
  QAPagination:null,
  data: {
    templateData:{
      showAllContent: false,
    }
  },
  created(){
    console.log(1);
    this.QAPagination=new Pagination(this,"comments",1,false,5);
  },
  methods: {
    displayAllContent() {
      this.setData({
        "templateData.showAllContent": true,
      });
    },
    qaGetComment(){
      if(this.QAPagination.isLoading()||this.QAPagination.isFinished()){
        return;
      }
      this.QAPagination.setLoading(true);
      Cloud.cfunction("Post","getQAnswer",{
        page:0,
        limit:5
      }).then(res=>{
        if(res.length<this.QAPagination.limit){
          this.QAPagination.setFinished(true);
        }
        this.QAPagination.insert(res);
        this.QAPagination.setLoading(false);
      })
    }
  },
});
