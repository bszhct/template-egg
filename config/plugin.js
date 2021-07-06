'use strict'

// 插件配置
module.exports = {
  sequelize: {
    enable: true,
    package: 'egg-sequelize'
  },
  routerPlus: {
    enable: true,
    package: 'egg-router-plus'
  }
  // https://github.com/eggjs/egg-cors
  // 跨域配置
  // cors: {
  //   enable: false,
  //   package: 'egg-cors'
  // }
}
