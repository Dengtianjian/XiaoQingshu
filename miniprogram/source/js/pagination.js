class Pagination {
  key = null;
  data = null;
  pageThis = null;
  dataName = null;
  startHeaderIndex = 0;
  limit = 5;
  constructor(
    pageThis,
    dataName,
    startHeaderIndex = 0,
    key = false,
    limit = 5
  ) {
    this.pageThis = pageThis;
    this.dataName = dataName;
    this.startHeaderIndex = startHeaderIndex;
    this.key = key;
    this.limit = limit;
    if (key) {
      this.data = [];
    } else {
      if (
        !this.pageThis[dataName] ||
        (this.pageThis[dataName] instanceof Array &&
          this.pageThis[dataName].length == 0)
      ) {
        let insertData = [];
        for (let i = 0; i < startHeaderIndex; i++) {
          insertData.push([]);
        }
        this.pageThis.setData({
          [this.dataName]: insertData,
        });
      } else {
        for (let i = 0; i < startHeaderIndex; i++) {
          this.pageThis.setData({
            [`${this.dataName}[${i}]`]: [],
          });
        }
      }

      this.data = {
        finished: false,
        loading: false,
        page: 0,
        headerIndex: startHeaderIndex,
      };
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
        console.log(this.dataName, pageKey);
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
  insertNew(data, pageKey = null) {
    if (this.key) {
      for (let i = 0; i < this.startHeaderIndex; i++) {
        if (
          this.pageThis["data"][this.dataName][`${pageKey}`][i].length <=
          this.limit
        ) {
          let currentLength = this.pageThis["data"][this.dataName][
            `${pageKey}`
          ][i].length;
          this.pageThis.setData({
            [`${this.dataName}.${pageKey}[${currentLength}][${i}]`]: data,
          });
          break;
        }
        let index =
          this.startHeaderIndex - 1 < 0 ? 0 : this.startHeaderIndex - 1;
        let currentLength = this.pageThis["data"][this.dataName][index].length;
        this.pageThis.setData({
          [`${this.dataName}.${pageKey}[${i}][${currentLength}]`]: data,
        });
      }
    } else {
      for (let i = 0; i < this.startHeaderIndex; i++) {
        if (this.pageThis["data"][this.dataName][i].length <= this.limit) {
          let currentLength = this.pageThis["data"][this.dataName][i].length;
          this.pageThis.setData({
            [`${this.dataName}[${i}][${currentLength}]`]: data,
          });
          break;
        }
        let index =
          this.startHeaderIndex - 1 < 0 ? 0 : this.startHeaderIndex - 1;
        let currentLength = this.pageThis["data"][this.dataName][index].length;
        this.pageThis.setData({
          [`${this.dataName}[${i}][${currentLength}]`]: data,
        });
      }
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
  setLoading(flag = true, pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        return;
      }
      this.data[pageKey]["loading"] = flag;
    } else {
      this.data["loading"] = flag;
    }
  }
  setFinished(flag = true, pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        return;
      }
      this.data[pageKey]["finished"] = flag;
    } else {
      this.data["finished"] = flag;
    }
  }
  isLoading(pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        return false;
      }
      return this.data[pageKey]["loading"];
    } else {
      return this.data["loading"];
    }
  }
  isFinished(pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        return false;
      }
      return this.data[pageKey]["finished"];
    } else {
      return this.data["finished"];
    }
  }
  getPage(pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        return 0;
      }
      return this.data[pageKey]["page"];
    } else {
      return this.data["page"];
    }
  }
}

export default Pagination;
