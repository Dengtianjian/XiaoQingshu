import Cloud from "../../../../../source/js/cloud";
import Pagination from "../../../../../source/js/pagination";
export default Behavior({
  CommentPagination:null,
  created(){

  },
  onReachBottom() {
    if (this.commentLoad.finished == false) {
      this.getComment();
    }
  },
})