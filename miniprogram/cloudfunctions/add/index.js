// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const result = await cloud.openapi.templateMessage.send({
    touser: cloud.getWXContext().OPENID, // 通过 getWXContext 获取 OPENID
    page: 'index',
    data: {
      keyword1: {
        value: '339208499'
      },
      keyword2: {
        value: '2015年01月05日 12:30'
      },
      keyword3: {
        value: '腾讯微信总部'
      },
      keyword4: {
        value: '广州市海珠区新港中路397号'
      }
    },
    templateId: 'TEMPLATE_ID',
    formId: 'FORMID',
    emphasisKeyword: 'keyword1.DATA'
  })
  // result 结构
  // { errCode: 0, errMsg: 'openapi.templateMessage.send:ok' }
  return result
}