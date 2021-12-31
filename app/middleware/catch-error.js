'use strict'

/**
 * 用户是否已登录判断和异常捕获处理
 * @param {*} options 中间件的配置项，框架会将 app.config[${middlewareName}] 传递进来
 * @param {*} app Application 实例
 * @return {Object} 返回一个中间件
 */
module.exports = (options, app) => {
  return async function(ctx, next) {
    try {
      const whiteUrls = options.whiteUrls || []
      // 如果 ctx.url 在白名单中
      const isWhiteUrl = whiteUrls.some(whiteUrl => ctx.url.startsWith(whiteUrl))
      if (!isWhiteUrl) {
        const { config } = ctx.app
        const cookie = config.manageSession
        if (
          // 管理系统的登录权限判断
          (!ctx.cookies.get(cookie.key, cookie) && ctx.url.match(new RegExp(`^${config.manageApiPrefix}`))) ||
          // 小程序的登录权限判断
          (!ctx.session.id && ctx.url.match(new RegExp(`^${config.apiPrefix}`)))
        ) {
          ctx.body = config.resCode.notLogged
        } else {
          await next()
        }
      } else {
        await next()
      }
    } catch (error) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志，用于线上环境排查问题
      ctx.app.emit('error', error, ctx)
      const status = error.status || app.config.resCode.serverError.code
      const message = error.message || '服务器异常'
      // HTTP Code
      ctx.status = status

      // 将生产环境的错误日志信息隐藏
      if (ctx.app.config.env === 'prod') {
        ctx.body = app.config.resCode.serverError
      } else {
        ctx.body = {
          code: status,
          message
        }
      }
    }
  }
}
