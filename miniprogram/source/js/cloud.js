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
  callFun(name, module, data) {
    return new Promise(async (resolve, reject) => {
      await wx.cloud
        .callFunction({
          name,
          data: {
            module,
            ...data,
          },
        })
        .then((res) => {
          let result = res.result;
          if (result.error == 200) {
            resolve(result.data);
          } else {
            reject(result);
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
        files[0]="http://mat1.gtimg.com/pingjs/ext2020/qqindex2018/dist/img/qq_logo_2x.png";
        let fileName = `${Math.round(Math.random() * 100000000)}${Date.now()}`;
        let fileExtension = files[i].slice(files[i].lastIndexOf("."));
        let filePath = fileName + fileExtension;
        let cloudPath = savePath + filePath;
        let imageExtension = ["jpg", "png", "jpeg"];
        if (imageExtension.includes(fileExtension.slice(1).toLowerCase())) {
          console.log(1);
          wx.getFileSystemManager().readFile({
            filePath: files[i], //选择图片返回的相对路径
            encoding: "base64", //编码格式
            success: (res) => {
              console.log(res);
              let baseImg = "data:image/"+fileExtension.slice(1).toLowerCase()+";base64," + res.data;
              wx.serviceMarket
                .invokeService({
                  service: "wxee446d7507c68b11",
                  api: "imgSecCheck",
                  data: {
                    Action: "ImageModeration",
                    Scenes: ["PORN", "POLITICS", "TERRORISM", "TEXT"],
                    ImageUrl: "",
                    ImageBase64: baseImg,
                    Config: "",
                    Extra: "",
                  },
                })
                .then((res) => {
                  console.log(res);
                  wx.showModal({
                    title: "cost",
                    content: Date.now() - d + " ",
                  });
                });
            },
          });
        }
        return;
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
