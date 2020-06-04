module.exports = {
  arrayToObject(array, key) {
    let obj = {};
    array.forEach((item) => {
      obj[item[key]] = item;
    });
    return obj;
  },
};
