'use strict'

/**
 * 测试环境
 */

module.exports = app => {
  const config = exports = {}

  config.sequelize = {
    username: 'root',
    password: '',
    database: 'template_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  }

  // 测试环境允许跨域
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  }

  // 自定义日志路径
  // https://eggjs.org/zh-cn/core/logger.html
  config.logger = {
    dir: `~/logs/${app.config.appName}-test`
  }

  return config
}
