'use strict'

/**
 * 正式环境
 * @param {Egg.EggAppInfo} app 实例对象
 */
module.exports = app => {
  const config = exports = {}

  config.sequelize = {
    username: 'root',
    password: null,
    database: 'template_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  }

  // 自定义日志路径
  // https://eggjs.org/zh-cn/core/logger.html
  config.logger = {
    dir: `~/logs/${app.config.appName}`
  }

  return config
}
