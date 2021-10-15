'use strict'

module.exports = app => {
  if (app.config.env === 'local' || app.config.env === 'unittest') {
    app.beforeStart(async () => {
      // 本地环境强制覆盖表结构
      await app.model.sync({ force: false })
    })
  }
}
