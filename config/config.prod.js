'use strict'

/**
 * 生成环境
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

  // 自定义日志路径
  // https://eggjs.org/zh-cn/core/logger.html
  config.logger = {
    dir: `~/logs/${app.config.appName}`
  }

  return config
}
