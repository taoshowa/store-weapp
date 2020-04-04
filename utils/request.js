import { DEBUG } from '../config/setting'
import { wwwApi, wechatApi } from '../config/index'
import { getUserInfo } from './auth'

const isLoginPage = () => {
  // 当前页是否是登陆页面
  const curPages = getCurrentPages();
  const curPage = curPages[curPages.length - 1]
  return curPage.route.indexOf('login/login') !== -1
}

const redirectLogin = () => {
  wx.clearStorage()
  wx.showToast({
    title: '您的用户信息已失效，请重新登录',
    icon: 'none',
    duration: 2000,
    success: () => {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  })
}

export const request = ({ url, data, method, header }) => {
  return new Promise((resolve, reject) => {
    const temp = { ...data } || {}

    const userInfo = getUserInfo()
    if (userInfo && userInfo.token) {
      temp.userId = userInfo.userId
      header = { ...header, jf_token: userInfo.token }
    }

    wx.request({
      url: wwwApi + url,
      data: temp,
      method: method || 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        ...header
      },
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        DEBUG && console.log(result)
        const { header, body } = result.data
        if (header && header.code !== 200) {
          // 未登录
          if (401 === header.code) {
            if (isLoginPage()) {
              return reject(result.data)
            }
            // 跳转登陆页
            redirectLogin()
          } else {
            wx.showToast({
              title: header.desc || 'error',
              icon: 'none',
              duration: 2000
            })
            reject(result.data)
          }
        } else {
          resolve(body)
        }
      },
      fail: (err) => {
        DEBUG && console.log(err)
        reject(err)
      }
    })
  })
}

export const wxRequest = ({ url, data, method, header }) => {
  return new Promise((resolve, reject) => {
    const temp = { ...data } || {}

    const userInfo = getUserInfo()
    if (userInfo && userInfo.token) {
      temp.pcToken = userInfo.token
    }

    wx.request({
      url: wechatApi + url,
      data: temp,
      method: method || 'POST',
      header: {
        'content-type': 'application/json; charset=UTF-8',
        ...header
      },
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        const { code, content, msg } = result.data
        DEBUG && console.log(result)
        if (code != 0) {
          // 未登录
          if (401 === code) {
            if (isLoginPage()) {
              return reject(result.data)
            }
            // 跳转登陆页
            redirectLogin()
          } else {
            wx.showToast({
              title: msg || 'error',
              icon: 'none',
              duration: 2000
            })
            reject(result.data)
          }
        } else {
          resolve(content)
        }
      },
      fail: (err) => {
        DEBUG && console.log(err)
        reject(err)
      }
    })
  })
}
