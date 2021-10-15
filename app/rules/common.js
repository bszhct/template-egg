'use strict'

// 支持的规则：https://github.com/yiminghe/async-validator
module.exports = {
  user: {
    phone: [{
      required: true, message: '手机号不能为空'
    }, {
      pattern: /^1[3456789]\d{9}$/, message: '手机号格式错误'
    }]
  }
}
