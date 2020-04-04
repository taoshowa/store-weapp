// pages/login/login.js
import { wxLogin, loginByPhone } from '../../api/index'
import { showToast, setStorageSync } from '../../utils/util'
import { setUserInfo } from '../../utils/auth'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  handleLogin: function (e) {
    const form = e.detail.value
    if (!form.mobile) {
      return showToast({ title: '请输入手机号' })
    }
    if (!form.password) {
      return showToast({ title: '请输入密码' })
    }

    this.setData({ isLoading: true })
    wx.login({
      success: (result) => {
        const { code } = result
        wxLogin({ code }).then((result) => {
          const { openid } = result
          setStorageSync('qg_openId', openid)
          const params = { openId: openid, ...form }
          loginByPhone(params).then((result) => {
            if (result.userId) {
              setUserInfo(result)
              showToast({ title: '登陆成功' })
              const curPages = getCurrentPages();
              let url
              if (curPages.length > 1) {
                url = '/' + curPages[curPages.length - 2].route
              }
              wx.reLaunch({
                url: url || '/pages/index/index'
              });
            } else {
              showToast({ title: '系统维护，请联系客服' })
            }

            this.setData({ isLoading: false })
          }).catch((err) => {
            this.setData({ isLoading: false })
            showToast({ title: err.msg || '手机号或密码不正确，请重新输入' })
          })
        }).catch((err) => {
          this.setData({ isLoading: false })
          showToast({ title: err.msg || '网络出错，请重新操作' })
        })
      }
    })
  }
})
