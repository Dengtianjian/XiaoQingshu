export default {
  collection(name) {
    return wx.cloud.database().collection(name);
  },
  cfunction(name, method, data) {
    return new Promise(async (resolve, reject) => {
      await wx.cloud
        .callFunction({
          name,
          data: {
            method,
            ...data,
          },
        })
        .then((res) => {
          let result = res.result;
          if (result.error == undefined) {
            resolve(result);
          } else {
            console.log(res, result);
            if (result.error == 200) {
              resolve(result.data);
            } else {
              reject(result);
            }
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  DB() {
    return wx.cloud.database();
  },
  async uploadFile(files, savePath = "temp/") {
    if (files instanceof Array) {
      let fileId = [];
      for (let i = 0; i < files.length; i++) {
        let fileName = `${Math.round(Math.random() * 100000000)}${Date.now()}`;
        let fileExtension = files[i].slice(files[i].lastIndexOf("."));
        let filePath = fileName + fileExtension;
        let cloudPath = savePath + filePath;
        await wx.cloud
          .uploadFile({
            cloudPath,
            filePath: files[i],
          })
          .then((res) => {
            fileId.push(res.fileID);
          });
      }
      return fileId;
    } else {
      let fileId = "";
      let fileName = `${Math.round(Math.random() * 100000000)}${Date.now()}`;
      let fileExtension = files.slice(files.lastIndexOf("."));
      let filePath = fileName + fileExtension;
      let cloudPath = savePath + filePath;
      await wx.cloud
        .uploadFile({
          cloudPath,
          filePath: files,
        })
        .then((res) => {
          fileId = res.fileID;
        });
      return fileId;
    }
  },
};
