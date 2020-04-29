module.exports = {
  result(data){
    return {
      error:200,
      message:"请求成功",
      data,
    }
  },
  error(error=400,code,message="请求失败",data={}){
    return {
      error,
      code,
      message,
      data
    }
  }
};
