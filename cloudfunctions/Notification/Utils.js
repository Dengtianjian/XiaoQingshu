module.exports = {
  getType(value) {
    let type = Object.prototype.toString.call(value);
    return type.slice(type.lastIndexOf(" ") + 1, type.indexOf("]"));
  },
};
