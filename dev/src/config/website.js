/*
 * @Author: zhongzhixin
 * @Date: 2022-03-24 15:53:23
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-02-09 15:43:10
 */
/**
 * 全局配置文件
 */
export default {
  title: '小配同学',
  indexTitle: '小配同学',
  clientId: 'saber', // 客户端id
  clientSecret: 'saber_secret', // 客户端密钥
  logo: 'S',
  key: 'saber', // 配置主键,目前用于存储
  lockPage: '/lock',
  tokenTime: 6000,
  // http的status默认放行不才用统一处理的,
  statusWhiteList: []
}
