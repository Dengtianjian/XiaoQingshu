module.exports = {
  /**
   * 响应请求
   * @param {*} data 响应的数据
   */
  result(data){
    return {
      error:200,
      message:"请求成功",
      data,
    }
  },
  /**
   * 响应错误
   * @param {Number} error 错误号
   * @param {Number} code 错误码
   * @param {String} message 错误信息
   * @param {*} data 响应的数据
   */
  error(error=400,code,message="请求失败",data={}){
    return {
      error,
      code,
      message,
      data
    }
  }
};
