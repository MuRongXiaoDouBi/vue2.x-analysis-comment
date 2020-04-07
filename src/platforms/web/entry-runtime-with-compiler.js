/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})
// $mount已经在runtime里定义了一遍，在这里对$mount做一个缓存
const mount = Vue.prototype.$mount
// 重新定义$mount
// 此$mount在init时被调用
// 最终目的是调用mount方法进行DOM挂载
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 通过query方法转换DOM对象
  el = el && query(el)

  /* istanbul ignore if */
  // 判断是否为body或者documentElement，如果是则报出错误（不允许为<html> 或者 <body>）  
  // document.body：https://developer.mozilla.org/zh-CN/docs/Web/API/Document/body
  // document.documentElement：https://developer.mozilla.org/zh-CN/docs/Web/API/Document/documentElement
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  // options缓存
  const options = this.$options
  // resolve template/el and convert to render function
  // Vue支持传入render函数
  // 如果不存在render函数，则判断是否有template，再把template转换成一个render函数
  // 所有template最终都会被转换成render
  if (!options.render) {
    // 缓存template
    let template = options.template
    // 如果存在template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          // 如果template是一个字符串,并且第一个字符为'#'
          // 则此时的template是一个DOM的ID名
          // 通过idToTemplate方法转换成真实DOM
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }r
        }
      } else if (template.nodeType) {
        // 如果template是一个Node节点
        // 则将template赋值为template.innerHTML(DOM字符串)
        // nodeType：https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
        // innerHTML：https://developer.mozilla.org/zh-CN/docs/Web/API/Element/innerHTML
        template = template.innerHTML
      } else {
        // 如果以上都不是,则报错
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 如果el存在,则调用getOuterHTML获取outerHTML
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      // 通过compileToFunctions获取到render
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 * 获取outerHTML
 * outerHTML:https://developer.mozilla.org/zh-CN/docs/Web/API/Element/outerHTML
 * appendChild:https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
 * cloneNode:https://developer.mozilla.org/zh-CN/docs/Web/API/Node/cloneNode
 * polyfill:https://developer.mozilla.org/zh-CN/docs/Glossary/Polyfill
 */
function getOuterHTML (el: Element): string {
  // 如果outerHTML存在，则直接return
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    // 如果不存在，则创建一个空的div，将el深度克隆到新的div的尾部
    // 做一个outerHTML的polyfill
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    // 返回当前innerHTML
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
