'use strict'

const Service = require('egg').Service
const moment = require('moment')

// 用户信息要返回的字段
const attributes = [ 'id', 'openId', 'nickName', 'avatarUrl', 'phone', 'loggedAt' ]

class UserService extends Service {
  // 登录
  async login(openId, defaults) {
    const { ctx } = this
    try {
      // 找到了返回当前用户信息否则新增一个用户
      const data = await this.ctx.model.User.findOrCreate({
        defaults,
        where: { openId },
        attributes
      })
        .then(async ([ user, created ]) => {
          const loggedAt = moment().format('YYYY-MM-DD HH:mm:ss')
          if (created) {
            await user.update({
              loggedAt
            })
          } else {
            defaults.loggedAt = loggedAt
            await user.update(defaults)
          }
          return user
        })
      return ctx.helper.clone(data)
    } catch (error) {
      ctx.logger.error(error)
    }
    return false
  }

  // 保存手机号
  async savePhone(id, phone) {
    const { ctx } = this
    try {
      const data = await ctx.model.User.findOne({
        where: { id }
      })
        .then(async res => {
          if (res) {
            await res.update({ phone })
          }
          return res
        })
      return ctx.helper.clone(data)
    } catch (error) {
      ctx.logger.error(error)
    }
    return false
  }

  // 获取用户信息
  async info(id) {
    const { ctx } = this
    try {
      const data = await ctx.model.User.findOne({
        where: { id }
      })
        .then(async res => {
          if (res) {
            // 更新登录时间
            await res.update({
              loggedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            })
          }
          // 这里重新查询一次，否则 loggedAt 和 updatedAt 字段返回的还是没有格式化的（上面的更新操作影响的）
          return await ctx.model.User.findOne({
            where: { id },
            attributes
          })
        })
      return ctx.helper.clone(data)
    } catch (error) {
      ctx.logger.error(error)
    }
    return false
  }
}

module.exports = UserService
