'use strict'

/**
 * 本地环境
 * @param {Egg.EggAppInfo} app 实例对象
 */
module.exports = app => {
  const config = exports = {}

  config.sequelize = {
    username: 'root',
    password: 'fyl121212',
    database: 'template_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  }

  return config
}
