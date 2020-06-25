import Utils from "./utils";
class Pagination {
  key = null;
  data = null;
  pageThis = null;
  dataName = null;
  startHeaderIndex = 0;
  limit = 5;
  /**
   *
   * @param {object} pageThis 页面指向的this
   * @param {string} dataName data对象面的属性名称
   * @param {number} startHeaderIndex 起始索引
   * @param {boolean} key 是否使用键值区分页面
   * @param {number} limit 每次更新的数量
   */
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
  setKeyData(pageKey) {
    if (this.data[pageKey] == undefined) {
      this.data[pageKey] = {
        finished: false,
        loading: false,
        page: 0,
        headerIndex: this.startHeaderIndex,
      };
    }
  }
  insert(data, pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.setKeyData(pageKey)

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
  updateItem(data, itemIndex, page, pageKey = null) {
    if (this.key) {
      if (Utils.getType(data) === "Object") {
        if (
          Utils.getType(
            this.pageThis.data[`${this.dataName}`][`${pageKey}`][page][
              itemIndex
            ]
          ) === "Object"
        ) {
          data = Object.assign(
            this.pageThis.data[`${this.dataName}`][`${pageKey}`][page][
              itemIndex
            ],
            data
          );
        }
      }
      this.pageThis.setData({
        [`${this.dataName}.${pageKey}[${page}][${itemIndex}]`]: data,
      });
    } else {
      if (Utils.getType(data) === "Object") {
        if (
          Utils.getType(
            this.pageThis.data[`${this.dataName}`][page][itemIndex]
          ) === "Object"
        ) {
          data = Object.assign(
            this.pageThis.data[`${this.dataName}`][page][itemIndex],
            data
          );
          console.log(data);
        }
      }
      this.pageThis.setData({
        [`${this.dataName}[${page}][${itemIndex}]`]: data,
      });
    }
  }
  removeItem(itemIndex, page, pageKey = null) {
    let path = null;
    if (this.key) {
      path = `${this.dataName}.${pageKey}[${page}][${itemIndex}]`;
    } else {
      path = `${this.dataName}[${page}][${itemIndex}]`;
    }
    this.pageThis.setData({
      [path]: "deleted",
    });
  }
  remove(page, pageKey = null) {
    if (this.key) {
      delete this.data[pageKey][page];
      this.pageThis.setData({
        [`${this.dataName}['${pageKey}'][${page}]`]: [],
      });
    } else {
      delete this.data[page];
      this.pageThis.setData({
        [`${this.dataName}[${page}]`]: [],
      });
    }
  }
  removeKey(pageKey) {
    delete this.data[pageKey];
    this.pageThis.setData({
      [`${this.dataName}.${pageKey}`]: [],
    });
  }
  setLoading(flag = true, pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.setKeyData(pageKey);
      }
      this.data[pageKey]["loading"] = flag;
    } else {
      this.data["loading"] = flag;
    }
  }
  setFinished(flag = true, pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.setKeyData(pageKey)
      }
      this.data[pageKey]["finished"] = flag;
    } else {
      this.data["finished"] = flag;
    }
  }
  isLoading(pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.setKeyData(pageKey)
      }
      return this.data[pageKey]["loading"];
    } else {
      return this.data["loading"];
    }
  }
  isFinished(pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.setKeyData(pageKey)
      }
      return this.data[pageKey]["finished"];
    } else {
      return this.data["finished"];
    }
  }
  getPage(pageKey = null) {
    if (this.key) {
      if (this.data[pageKey] == undefined) {
        this.setKeyData(pageKey)
      }
      return this.data[pageKey]["page"];
    } else {
      return this.data["page"];
    }
  }
}

export default Pagination;
