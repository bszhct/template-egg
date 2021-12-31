'use strict'

const Controller = require('egg').Controller

/**
 * @controller User 用户模块
 */
class UserController extends Controller {
  /**
   * @summary 模拟登录
   * @description 通过 mock 的方式登录
   * @router get /user/mock
   * @request query string *id 用户 id
   * @response 0 userInfo 登录成功
   */
  async mock() {
    const { ctx } = this
    const { id } = ctx.request.query
    // 参数校验
    const rules = {
      id: { required: true, message: '用户标识不能为空' }
    }
    const passed = await ctx.validate(rules, ctx.request.query)
    if (!passed) return

    const data = await ctx.service.user.info(id)
    if (data) {
      ctx.session.id = data.id
      ctx.rotateCsrfSecret()
    }
    this.ctx.helper.success(data)
  }

  /**
   * @summary 小程序登录
   * @description 目前仅支持微信小程序登录
   * @router post /user/login
   * @request body login *body
   * @response 0 userInfo 登录成功
   */
  async login() {
    const { ctx } = this
    const { code, nickName, avatarUrl, phone, gender, province, city, language } = ctx.request.body

    if (!code) {
      this.ctx.helper.error(null, '鉴权需要的 code 不能为空')
      return
    }

    // 通过 code 换取用户信息
    const { appId, secret } = ctx.app.config.wxapp
    let openId = null
    let unionId = null
    let sessionKey = null
    try {
      // 发起授权
      const queryString = new URLSearchParams({
        appid: appId, secret, js_code: code, grant_type: 'authorization_code'
      }).toString()
      const res = await ctx.curl(`https://api.weixin.qq.com/sns/jscode2session?${queryString}`, {
        contentType: 'json', dataType: 'json'
      })
        // 只返回需要的数据
        .then(res => res.data)

      // 输出授权数据方便调试
      ctx.logger.info(`授权之后拿到的数据 => ${res}`)
      console.log('授权之后拿到的数据')
      console.log(res)

      // 拿到 openId
      openId = res.openid
      if (res.unionid) unionId = res.unionid
      sessionKey = res.session_key
    } catch (error) {
      ctx.logger.error(error)
      this.ctx.helper.error(null, '授权失败')
      return
    }
    // 空值判断
    if (!nickName) {
      this.ctx.helper.error(null, '昵称不能为空')
      return
    }
    if (!avatarUrl) {
      this.ctx.helper.error(null, '头像不能为空')
      return
    }

    const data = await ctx.service.user.login(openId, {
      openId, unionId, nickName, avatarUrl, phone, gender, province, city, language
    })
    if (data) {
      ctx.session.id = data.id
      data.sessionKey = sessionKey
      this.ctx.helper.success(data)
    } else {
      this.ctx.helper.error(null, '授权出现未知错误')
    }
  }

  /**
   * @summary 解密手机号信息
   * @description 获取用户当前绑定的手机号
   * @router post /user/phone
   * @request body phone *body
   */
  async phone() {
    const { ctx } = this
    const { sessionKey, userId, iv, encryptedData } = ctx.request.body

    // 参数校验
    const rules = {
      sessionKey: { required: true, message: '凭证不能为空' },
      userId: { required: true, message: '用户标识不能为空' },
      iv: { required: true, message: '初始向量不能为空' },
      encryptedData: { required: true, message: '加密数据不能为空' }
    }
    const passed = await ctx.validate(rules, ctx.request.body)
    // 复用 egg-swagger-doc 结构来校验
    // const passed = await ctx.validate(ctx.rule.phone, ctx.request.body)
    if (!passed) return

    const { appId } = ctx.app.config.wxapp
    // 解密后的手机号数据
    let phoneData = null
    try {
      phoneData = ctx.helper.wxCrypt({ appId, sessionKey, iv, encryptedData })
    } catch (error) {
      ctx.logger.error(error)
      this.ctx.helper.error(null, '手机号解密失败')
      return
    }

    if (phoneData) {
      // 完整的用户数据
      const data = await ctx.service.user.savePhone(userId, phoneData.phoneNumber)
      if (data) {
        this.ctx.helper.success(data)
      } else {
        this.ctx.helper.error(null, '手机号保存失败')
      }
    } else {
      this.ctx.helper.error(null, '手机号获取失败')
    }
  }

  /**
   * @summary 获取用户信息
   * @description 只有登录成功了才会返回用户信息
   * @router get /user/info
   * @response 0 userInfo 用户信息
   */
  async info() {
    const { ctx } = this
    const data = await ctx.service.user.info(ctx.session.id)
    if (data) {
      this.ctx.helper.success(data)
    } else {
      this.ctx.helper.error(null, '用户信息获取失败')
    }
  }

  /**
   * @summary 登出
   * @description 退出登录
   * @router get /user/logout
   */
  async logout() {
    const { ctx } = this
    ctx.session.id = null
    this.ctx.helper.success(null)
  }
}

module.exports = UserController
