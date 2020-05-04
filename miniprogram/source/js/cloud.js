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
          let result=res.result;
          if (result.error == undefined) {
            resolve(result);
          } else {
            console.log(res,result);
            if (result.error == 200 ) {
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
  DB(){
    return wx.cloud.database()
  }
};
