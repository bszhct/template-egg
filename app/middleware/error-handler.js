
'use strict'

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next()
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      ctx.app.emit('error', err, ctx)
      const status = err.status || 500
      const message = err.message || '服务器异常'

      // HTTP Code
      ctx.status = status

      // 生产环境
      const isProd = ctx.app.config.env === 'prod'

      // 错误响应对象
      ctx.body = {
        code: 500,
        message: (status === 500 && isProd) ? '服务器异常' : message
      }
    }
  }
}
