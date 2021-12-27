'use strict'

/**
 * @param {Egg.Application} app 实例对象
 */
module.exports = app => {
  const { router, controller } = app

  // 首页
  router.get('/', controller.home.index)
  // 设置统一的前缀
  const subRouter = router.namespace('/bs/')
  // 开发环境
  const isDev = app.config.env === 'local' || app.config.env === 'test'

  /**
   * 用户模块
   */
  if (isDev) {
    subRouter.get('user/mock', controller.user.mock)
  }
  subRouter.post('user/login', controller.user.login)
  // 获取用户信息
  subRouter.post('user/info', controller.user.info)
  subRouter.post('user/logout', controller.user.logout)
  subRouter.post('user/phone', controller.user.phone)
}
