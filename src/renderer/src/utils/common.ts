import { ElNotification } from 'element-plus'

export { debounce, throttle } from 'lodash-es'

export function pad(num, n = 2) {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num
    len++
  }
  return num
}

export function formatDate(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  date = date instanceof Date ? date : new Date(date)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

export function formatTime(interval) {
  interval = interval | 0
  const minute = pad((interval / 60) | 0)
  const second = pad(interval % 60)
  return `${minute}:${second}`
}

export function formatNumber(number) {
  number = Number(number) || 0
  if (number >= 100000000) {
    return `${Math.floor(number / 100000000)}亿`
  } else if (number >= 10000) {
    return `${Math.floor(number / 10000)}万`
  } else {
    return number.toString()
  }
}

export function genImgUrl(url, w, h) {
  if (!h) {
    h = w
  }
  url += `?param=${w}y${h}`
  return url
}

export function isLast(index, arr) {
  return index === arr.length - 1
}

export function shallowEqual(a, b, compareKey) {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    let compareA = a[i]
    let compareB = b[i]
    if (compareKey) {
      compareA = compareA[compareKey]
      compareB = compareB[compareKey]
    }
    if (!Object.is(a[i], b[i])) {
      return false
    }
  }
  return true
}

export function notify(message, type?: string) {
  const params = {
    message,
    duration: 1500
  }
  const fn = type ? ElNotification[type] : Notification
  return fn(params)
}
;['success', 'warning', 'info', 'error'].forEach((key) => {
  notify[key] = (message) => {
    return notify(message, key)
  }
})

export function isUndef(v) {
  return v === undefined || v === null
}

export function isDef(v) {
  return v !== undefined && v !== null
}

export function isTrue(v) {
  return v === true
}

export function isFalse(v) {
  return v === false
}

export function getPageOffset(page, limit) {
  return page * limit
}
export function replaceSearchKeyword(result, keyword) {
  // 转义正则表达式中的特殊字符
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const Reg = new RegExp(escapedKeyword, 'ig')
  let res = ''
  if (result) {
    res = result.replace(Reg, `<span style="color: #507DAF;">$&</span>`)
    return res
  }
  return result
}
