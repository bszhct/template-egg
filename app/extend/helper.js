'use strict'

const { v4: uuidv4 } = require('uuid')
const WXCrypt = require('./wx-crypt')

// 新旧接口兼容的版本号标识，有不兼容的代码时更新该版本号，主要为了应对审核以及通过 24h 内没有更新到最新版本的用户
// 当需要发新版本时，用户已全部更新到最新版本，所以每次只要有不兼容的更新，只需要更新该版本号即可
const version = [ 1, 0, 0 ]

module.exports = {
  // 将菜单拆解成顶层的一级菜单和根据 parentId 进行分类好的子菜单
  splitMenu(data) {
    const menus = []
    const children = {}
    data.forEach(menu => {
      delete menu.createdAt
      delete menu.updatedAt
      if (menu.meta) {
        menu.meta = JSON.parse(menu.meta)
      }
      // 取出顶层菜单
      if (menu.parentId === 0 && !menus.find(m => m.id === menu.id)) {
        menus.push(menu)
      } else {
        // 初始化子菜单列表
        if (!children[menu.parentId]) {
          children[menu.parentId] = []
        }
        // 如果当前子菜单在列表里面的话添加进去
        if (!children[menu.parentId].find(child => child.id === menu.id)) {
          children[menu.parentId].push(menu)
        }
      }
    })
    return {
      menus,
      children
    }
  },
  // 将菜单生成树状结构
  treeMenu(menus, children) {
    let currentChildren = []
    if (Object.keys(children).length <= 0) {
      return
    }
    menus.forEach(item => {
      if (children[item.id]) {
        item.children = item.children || []
        item.children = children[item.id]
        currentChildren = currentChildren.concat(children[item.id])
        delete children[item.id]
      }
    })
    if (currentChildren.length) {
      this.treeMenu(currentChildren, children)
    }
  },
  // 生成唯一标识
  createUid() {
    return uuidv4()
  },
  // 解密微信数据
  wxCrypt({ appId, sessionKey, encryptedData, iv }) {
    const pc = new WXCrypt(appId, sessionKey)
    return pc.decryptData(encryptedData, iv)
  },
  // 判断版本号是否大于指定版本
  thanVersion(v) {
    if (!v) {
      return false
    }
    const [ ox, oy, oz ] = version
    const [ nx, ny, nz ] = v.split('.')
    return nx >= ox && ny >= oy && nz >= oz
  },
  // 数据拷贝
  clone(data) {
    return JSON.parse(JSON.stringify(data))
  },
  // 对象转成字符串
  objectToUrlString(data, filterEmpty = true) {
    const res = Object.entries(data).map(([ k, v ]) => {
      if (filterEmpty && !!v) {
        return `${k}=${v}`
      }
      return `${k}=${v}`
    })
      .join('&')
    return `?${res}`
  }
}
