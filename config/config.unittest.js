/* eslint-disable no-unused-vars */
'use strict'

/**
 * 单元测试环境
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

  // 本地环境允许跨域
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  }

  return config
}
