'use strict'

const Service = require('egg').Service
const moment = require('moment')

// 用户信息要返回的字段
const attributes = [ 'id', 'openId', 'nickName', 'avatarUrl', 'phone', 'loggedAt' ]

class UserService extends Service {
  // 登录
  async login(openId, defaults) {
    const res = await this.ctx.model.User.findOne({
      where: { openId }
    })
      .then(async res => {
        if (res) {
          // 更新用户信息
          return await res.update(defaults)
        }
        // 这里重新查询一次，否则 loggedAt 和 updatedAt 字段返回的还是没有格式化的（上面的更新操作影响的）
        return await this.ctx.model.User.create({
          openId,
          ...defaults
        })
      })

    return JSON.parse(JSON.stringify(res))
  }

  // 保存手机号
  async savePhone(id, phone) {
    const res = await this.ctx.model.User.findOne({
      where: { id }
    })
      .then(async res => {
        if (res) {
          await res.update({ phone })
        }
        return res
      })
    return res
  }

  // 获取用户信息
  async info(id) {
    try {
      const res = await this.ctx.model.User.findOne({
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
          return await this.ctx.model.User.findOne({
            where: { id },
            attributes
          })
        })
      return res
    } catch (error) {
      this.ctx.logger.error(error)
    }
    return false
  }
}

module.exports = UserService
