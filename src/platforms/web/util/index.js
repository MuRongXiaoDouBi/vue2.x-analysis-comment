/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 * 如果不是一个Element类型，则查找Element
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    // 如果el传入的是一个字符串
    // 则通过document.querySelector进行查找
    const selected = document.querySelector(el)
    if (!selected) {
      // 如果没有则报一个错误
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      // 并且返回一个空的div
      return document.createElement('div')
    }
    // 如果找到DOM，则直接返回
    return selected
  } else {
    // 如果不是字符串则是一个Element，直接返回
    return el
  }
}
