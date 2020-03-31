import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue(options) {
  // 判断this是否是Vue实例
  // 如果不是则抛出警告
  // 如果是则初始化Vue配置
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化Vue配置
  this._init(options)
}
// 合并配置、初始化生命周期、初始化事件中心、初始化渲染、初始化data、props、computed、watcher等
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
