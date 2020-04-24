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
          if (res.result) {
            if (res.result.error) {
              reject(res.result);
            } else {
              resolve(res.result);
            }
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
