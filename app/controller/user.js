'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  // 模拟登录
  async mock() {
    const { ctx } = this
    const { id } = ctx.query

    if (!id) {
      ctx.body = {
        code: 602,
        message: '用户标识不能为空'
      }
      return
    }

    const data = await ctx.service.user.info(id)
    if (data) {
      ctx.session.id = data.id
      ctx.rotateCsrfSecret()
    }
    ctx.body = {
      code: 0,
      data
    }
  }

  // 微信登录
  async login() {
    const { ctx } = this
    const { code, nickName, avatarUrl, phone, gender, province, city, language } = ctx.request.body

    if (!code) {
      ctx.body = {
        code: 602,
        message: 'code 不能为空'
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
      const params = {
        appid: appId,
        secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
      const paramsString = Object.entries(params).map(([ k, v ]) => `${k}=${v}`).join('&')
      const codeUrl = `https://api.weixin.qq.com/sns/jscode2session?${paramsString}`
      const res = await ctx.curl(codeUrl, {
        contentType: 'json',
        dataType: 'json'
      })
        // 只返回需要的数据
        .then(res => res.data)

      console.log('授权之后拿到的数据')
      console.log(res)

      // 拿到 openId
      openId = res.openid
      if (res.unionid) {
        unionId = res.unionid
      }
      sessionKey = res.session_key
    } catch (error) {
      ctx.body = {
        code: 602,
        message: '通过 code 获取授权失败'
      }
      return
    }
    // 空值判断
    if (!nickName) {
      ctx.body = {
        code: 602,
        message: '用户昵称不能为空'
      }
      return
    }
    if (!avatarUrl) {
      ctx.body = {
        code: 602,
        message: '用户头像不能为空'
      }
      return
    }

    const data = await ctx.service.user.login(openId, {
      openId, unionId, nickName, avatarUrl, phone, gender, province, city, language
    })
    if (data) {
      data.sessionKey = sessionKey
      ctx.body = {
        code: 0,
        data
      }
    } else {
      ctx.body = {
        code: 602,
        message: '授权出现未知错误'
      }
    }
  }

  // 解密手机号信息
  async phone() {
    const { ctx } = this
    const { sessionKey, userId, iv, encryptedData } = ctx.request.body

    if (!sessionKey) {
      ctx.body = {
        code: 602,
        message: '凭证不能为空'
      }
      return
    }
    if (!userId) {
      ctx.body = {
        code: 602,
        message: '用户标识不能为空'
      }
      return
    }
    if (!iv) {
      ctx.body = {
        code: 602,
        message: '初始向量不能为空'
      }
      return
    }
    if (!encryptedData) {
      ctx.body = {
        code: 602,
        message: '加密的用户数据不能为空'
      }
      return
    }

    const { appId } = ctx.app.config.wxapp
    // 解密后的手机号数据
    const phoneData = ctx.helper.wxCrypt({ appId, sessionKey, iv, encryptedData })
    if (phoneData) {
      // 完整的用户数据
      const data = await ctx.service.user.savePhone(userId, phoneData.phoneNumber)
      if (data) {
        // 只有获取到手机号了才进行登录
        ctx.session.id = data.id
        ctx.body = {
          code: 0,
          data
        }
      } else {
        ctx.body = {
          code: 603,
          message: '手机号保存失败'
        }
      }
    } else {
      ctx.body = {
        code: 602,
        message: '手机号获取失败'
      }
    }
  }

  // 获取用户信息
  async info() {
    const { ctx } = this
    const data = await ctx.service.user.info(ctx.session.id)
    if (data){
      ctx.body = {
        code: 0,
        data
      }
    } else {
      ctx.body = {
        code: 602,
        message: '用户信息获取失败'
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
