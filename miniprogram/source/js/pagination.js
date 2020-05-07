class Pagination {
  key = null;
  data = null;
  pageThis = null;
  dataName = null;
  startHeaderIndex = 0;
  constructor(pageThis, dataName, headerIndex = 0,key = false) {
    this.pageThis = pageThis;
    this.dataName = dataName;
    this.startHeaderIndex = headerIndex;
    this.key = key;
    if (key) {
      this.data = [];
    } else {
      this.data = { finished: false, loading: false, page: 0, headerIndex: 0 };
    }
  }
  insert(data, pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.data[pageKey] = {
          finished: false,
          loading: false,
          page: 0,
          headerIndex: this.startHeaderIndex,
        };
        console.log(this.dataName,pageKey);
        this.pageThis.setData({
          [`${this.dataName}.${pageKey}`]: [data],
        });
      } else {
        let headerIndex = this.data[pageKey]["headerIndex"];
        this.pageThis.setData({
          [`${this.dataName}.${pageKey}[${headerIndex}]`]: [...data],
        });
        this.data[pageKey]["page"]++;
        this.data[pageKey]["headerIndex"]++;
      }
    } else {
      let headerIndex = this.data["headerIndex"];

      this.pageThis.setData(
        {
          [`${this.dataName}[${headerIndex}]`]: [...data],
        },
        () => {
          console.log("update");
        }
      );
      this.data.page++;
      this.data.headerIndex++;
    }
  }
  remove(page, pageKey = null) {
    if (this.key) {
      delete this.data[pageKey][page];
      this.setData({
        [`${this.dataName}['${pageKey}'][${page}]`]: [],
      });
    } else {
      delete this.data[page];
      this.setData({
        [`${this.dataName}[${page}]`]: [],
      });
    }
  }
  setLoading(flag=true,pageKey = null) {
    if (this.key) {
      if(this.data[pageKey]==undefined){
        return;
      }
      this.data[pageKey]["loading"] = flag;
    } else {
      this.data["loading"] = flag;
    }
  }
  setFinished(flag=true,pageKey = null) {
    if (this.key) {
      if(this.data[pageKey]==undefined){
        return;
      }
      this.data[pageKey]["finished"] = flag;
    } else {
      this.data["finished"] = flag;
    }
  }
  isLoading(pageKey = null) {
    if (this.key) {
      if(this.data[pageKey]==undefined){
        return false;
      }
      return this.data[pageKey]["loading"];
    } else {
      return this.data["loading"];
    }
  }
  isFinished(pageKey = null) {
    if (this.key) {
      if(this.data[pageKey]==undefined){
        return false;
      }
      return this.data[pageKey]["finished"];
    } else {
      return this.data["finished"];
    }
  }
  getPage(pageKey = null){
    if (this.key) {
      if(this.data[pageKey]==undefined){
        return 0;
      }
      return this.data[pageKey]["page"];
    } else {
      return this.data["page"];
    }
  }
}

export default Pagination;
