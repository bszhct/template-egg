'use strict'

module.exports = app => {
  // 测试环境强制覆盖表结构
  if (app.config.env === 'local' || app.config.env === 'unittest') {
    app.beforeStart(async () => {
      await app.model.sync({ force: false })
    })
  }
}
