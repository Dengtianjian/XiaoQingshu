import Cloud from "../source/js/cloud";
export default {
  /**
   *
   * @param {string} type 所属分类
   * @param {string} typeTemplate 分类模板
   * @param {object} params 模板参数
   * @param {string} sender 发送人 默认为0 即为系统
   * @param {string} receiver 接收人 默认为0 即为全部用户
   * @param {string} category 所属类型
   * @param {string} prompt 提示语
   */
  async send(type,typeTemplate,params,sender=0,receiver=0,category="system",prompt="您有新的消息✉"){
    params=Object.assign(params,{
      type,category,sender,receiver,prompt,typeTemplate
    });
    return await Cloud.callFun("Notification", "send", params).then(res=>res);
  }
}