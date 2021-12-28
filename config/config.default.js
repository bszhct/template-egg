'use strict'

module.exports = app => {
  const config = exports = {}

  // cookie 签名秘钥
  const key = '_1625119468325'
  config.keys = app.name + key

  // 中间件
  config.middleware = [
    'catchError'
  ]

  /**
   * 应用配置
   */
  // 接口前缀名称，跟随业务系统修改
  const apiPrefixName = 'bs'
  // 接口完整前缀
  const apiPrefix = `/${apiPrefixName}/`
  // 后台接口前缀，跟随业务系统修改
  const manageApiPrefixName = 'manage'
  // 后台接口前缀
  const manageApiPrefix = `/${manageApiPrefixName}/`
  const userConfig = {
    // 应用名称，用于日志文件目录指定、cookie 的 key 指定，具有唯一性，跟随业务系统修改
    appName: 'template-egg',
    apiPrefixName,
    apiPrefix,
    manageApiPrefixName,
    manageApiPrefix,
    // 默认的 code 码和错误提示信息配置，只需要改这一个地方即可
    resCode: {
      success: {
        code: 0
      },
      error: {
        code: 602, message: '参数异常'
      },
      serverError: {
        code: 500, message: '服务器异常'
      },
      notLogged: {
        code: 601, message: '请先登录后再操作'
      }
    }
  }

  // cookie 失效时间配置
  config.session = {
    key: `_${userConfig.appName}_${apiPrefixName}_`,
    // 30 天
    maxAge: 24 * 3600 * 1000 * 30,
    httpOnly: true,
    encrypt: true
  }

  // 后台管理 cookie 失效时间配置
  config.manageSession = {
    key: `_${userConfig.appName}_${manageApiPrefixName}_`,
    // 30 天
    maxAge: 24 * 3600 * 1000 * 30,
    httpOnly: true,
    encrypt: true,
    signed: false
  }

  config.sequelize = {
    // 全局配置
    define: {
      // 是否自动进行下划线转换（这里是因为 DB 默认的命名规则是下划线方式，而我们使用的大多数是驼峰方式）
      underscored: true,
      // 启用 sequelize 默认时间戳设置
      timestamps: true,
      // 禁用 sequelize 默认给表名设置复数
      freezeTableName: true
    },
    // 时区修正
    timezone: '+08:00',
    // 格式化返回的数据结构
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    }
  }

  // 配置安全策略
  config.security = {
    // 关闭 CSRF 攻击防御（伪造用户请求向网站发起恶意请求）
    // csrf: {
    //   enable: false
    // }
  }

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  }

  // 启动端口配置
  config.cluster = {
    listen: {
      path: '',
      port: 7001,
      hostname: '0.0.0.0'
    }
  }

  // 权限配置
  config.catchError = {
    // 接口白名单配置
    whiteUrls: [
      `${apiPrefix}user/mock`,
      `${apiPrefix}user/login`,
      `${apiPrefix}user/logout`,
      `${apiPrefix}user/phone`
    ]
  }

  // 微信小程序配置
  config.wxapp = {
    appId: '',
    secret: ''
  }

  // 参数校验配置
  config.validatePlus = {
    // 校验通过了始终返回 true，不通过返回 false
    resolveError(ctx, errors) {
      if (errors.length) {
        // 始终返回第一个错误
        ctx.body = {
          code: userConfig.resCode.error.code,
          message: errors[0].message
        }
      }
    }
  }

  return {
    ...config,
    ...userConfig
  }
}
