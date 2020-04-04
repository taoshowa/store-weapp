import { getStorageSync, setStorageSync } from './util'

// 获取用户登录信息
export const getUserInfo = () => {
  return getStorageSync('qg_userInfo')
}

// 获取用户登录信息
export const setUserInfo = (data) => {
  return setStorageSync('qg_userInfo', data)
}
