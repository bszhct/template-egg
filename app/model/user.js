'use strict'

/**
 * 用户表
 */

module.exports = app => {
  const { TEXT, STRING, INTEGER, DATE } = app.Sequelize

  const User = app.model.define('user', {
    openId: {
      type: STRING(255),
      allowNull: false,
      comment: '同微信的 openid，转成驼峰式'
    },
    unionId: {
      type: STRING(255),
      comment: '同微信的 unionid，转成驼峰式，作为预留字段'
    },
    nickName: {
      type: STRING(255),
      allowNull: false,
      comment: '微信昵称'
    },
    password: {
      type: STRING(255),
      comment: '登陆密码，作为预留字段，不一定有值'
    },
    avatarUrl: {
      type: TEXT,
      allowNull: false,
      comment: '头像地址'
    },
    phone: {
      type: STRING(255),
      comment: '电话号码，可能为空'
    },
    gender: {
      type: INTEGER,
      comment: '性别，可能为空'
    },
    country: {
      type: STRING(255),
      comment: '国家，可能为空'
    },
    province: {
      type: STRING(255),
      comment: '省份，可能为空'
    },
    city: {
      type: STRING(255),
      comment: '城市，可能为空'
    },
    language: {
      type: STRING(255),
      comment: '语言，可能为空'
    },
    loggedAt: {
      type: DATE,
      comment: '最后登录时间'
    }
  })

  return User
}
