'use strict'

module.exports = (options, app) => {
  return async function checkToken(ctx, next) {
    const whiteUrls = options.whiteUrls || []
    // 如果 ctx.url 在白名单中
    const isWhiteUrl = whiteUrls.some(whiteUrl => ctx.url.startsWith(whiteUrl))
    if (!isWhiteUrl) {
      const config = ctx.app.config.adminSession
      if (
        // 管理系统的权限判断
        (!ctx.cookies.get(config.key, config) && ctx.url.match(/^\/admin/)) ||
        // 小程序的权限判断
        (!ctx.session.id && ctx.url.match(/^\/bs/))
      ) {
        ctx.body = {
          code: 601,
          message: '请先登录后再操作'
        }
      } else {
        await next()
      }
    } else {
      await next()
    }
  }
}
