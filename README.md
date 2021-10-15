# template-egg


## 快速开始

```bash
# 安装
yarn install


# 启动本地开发模式
yarn run dev

# 在测试环境启动开发模式（可以用来同步新增的数据表以及短暂的功能调试，更方便）
yarn run dev:test

# 在正式环境启动开发模式
yarn run dev:prod

# 测试环境部署
yarn run start:dev

# 正式环境部署
yarn run start
```


## sequelize 常用场景代码

### 数据操作支持回滚

```js
// https://sequelize.org/master/manual/transactions.html
async save() {
  const { ctx } = this
  let transaction
  try {
    transaction = await ctx.model.transaction()
    // 保存专业
    ctx.model.Major.findOne({
      where: { id },
      transaction
    })
      .then(async res => {
        if (res) {
          await res.update(values)
        }
      })
    transaction.submit()
  } catch (error) {
    // 只要出错就回滚
    if (transaction) await transaction.rollback()
    this.logger.error(error)
  }
}

```


### 多表查询使用 required 参数


```js
async info() {
  const { ctx } = this
  try {
    const res = await ctx.model.School.findOne({
      where: { id },
      include: [{
        model: ctx.model.College,
        as: 'colleges',
        attributes: [ 'id', 'name' ]
      }],
      // https://sequelize.org/master/manual/eager-loading.html#required-eager-loading
      // 查不到数据的时候，返回带结构的数据，例如返回空数组、空对象
      required: false
    })
      .then(async res => {
        if (res) {
          await res.update(values)
        }
      })
    return ctx.helper.clone(res)
  } catch (error) {
    // 只要出错就回滚
    if (transaction) await transaction.rollback()
    this.logger.error(error)
  }
}

```


## 文档

[eggjs](https://eggjs.org/zh-cn/intro/quickstart.html)

