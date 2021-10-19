'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  // 模拟登录
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
    ctx.body = {
      code: 0, data
    }
  }

  // 微信登录
  async login() {
    const { ctx } = this
    const { code, nickName, avatarUrl, phone, gender, province, city, language } = ctx.request.body

    if (!code) {
      ctx.body = {
        code: 602, message: '鉴权需要的 code 不能为空'
      }
      return
    }

    // 通过 code 换取用户信息
    const { appId, secret } = ctx.app.config.wxapp
    let openId = null
    let unionId = null
    let sessionKey = null
    try {
      // 发起授权
      const queryString = ctx.helper.objectToUrlString({
        appid: appId, secret, js_code: code, grant_type: 'authorization_code'
      })
      const res = await ctx.curl(`https://api.weixin.qq.com/sns/jscode2session${queryString}`, {
        contentType: 'json', dataType: 'json'
      })
        // 只返回需要的数据
        .then(res => res.data)

      // 输出一下日志
      ctx.logger.info(`授权之后拿到的数据 => ${res}`)
      console.log('授权之后拿到的数据')
      console.log(res)

      // 拿到 openId
      openId = res.openid
      if (res.unionid) unionId = res.unionid
      sessionKey = res.session_key
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = {
        code: 602, message: '授权失败'
      }
      return
    }
    // 空值判断
    if (!nickName) {
      ctx.body = {
        code: 602, message: '昵称不能为空'
      }
      return
    }
    if (!avatarUrl) {
      ctx.body = {
        code: 602, message: '头像不能为空'
      }
      return
    }

    const data = await ctx.service.user.login(openId, {
      openId, unionId, nickName, avatarUrl, phone, gender, province, city, language
    })
    if (data) {
      ctx.session.id = data.id
      data.sessionKey = sessionKey
      ctx.body = {
        code: 0, data
      }
    } else {
      ctx.body = {
        code: 602, message: '授权出现未知错误'
      }
    }
  }

  // 解密手机号信息
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
    const passed = await ctx.validate(rules, ctx.request.query)
    if (!passed) return

    const { appId } = ctx.app.config.wxapp
    // 解密后的手机号数据
    let phoneData = null
    try {
      phoneData = ctx.helper.wxCrypt({ appId, sessionKey, iv, encryptedData })
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = {
        code: 602, message: '手机号解密失败'
      }
      return
    }

    if (phoneData) {
      // 完整的用户数据
      const data = await ctx.service.user.savePhone(userId, phoneData.phoneNumber)
      if (data) {
        ctx.body = {
          code: 0, data
        }
      } else {
        ctx.body = {
          code: 603, message: '手机号保存失败'
        }
      }
    } else {
      ctx.body = {
        code: 602, message: '手机号获取失败'
      }
    }
  }

  // 获取用户信息
  async info() {
    const { ctx } = this
    const data = await ctx.service.user.info(ctx.session.id)
    if (data) {
      ctx.body = {
        code: 0, data
      }
    } else {
      ctx.body = {
        code: 602, message: '用户信息获取失败'
      }
    }
  }

  // 登出
  async logout() {
    const { ctx } = this
    ctx.session.id = null
    ctx.body = {
      code: 0
    }
  }
}

module.exports = UserController
