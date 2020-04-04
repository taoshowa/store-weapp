// pages/user/user.js
import { getUserInfo } from "../../utils/auth"
import { addAddress, getOrderList } from "../../api/index"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCount: 0,
    hasUserInfo: false,
    hasAddressAuth: true,
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.address'] !== undefined) {
          this.setData({
            hasAddressAuth: res.authSetting['scope.address']
          })
        }
      }
    })

    const userInfo = getUserInfo()
    this.data.hasUserInfo = !!userInfo
    this.setData({
      userInfo: userInfo || {}
    })
    // 获取订单数
    this.getOrderData()
  },

  isLogin() {
    if (!this.data.hasUserInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  },

  getOrderData: function () {
    if (!this.data.hasUserInfo) return

    getOrderList().then((result) => {
      this.setData({
        orderCount: result.pageInfo.total || 0
      })
    })
  },

  onOrderTap: function () {
    if (!this.isLogin()) return

    wx.navigateTo({
      url: '/pages/order/order'
    })
  },

  onAvatarTap: function () {
    this.isLogin()
  },

  /**
   * 打开权限设置
   */
  openSetting() {
    wx.openSetting()
  },

  onAddressTap: function () {
    if (!this.isLogin()) return

    wx.chooseAddress({
      success (res) {
        // console.log(res);
        const params = {
          provice: res.provinceName,
          city: res.cityName,
          area: res.countyName,
          address: res.detailInfo,
          userName: res.userName,
          userPhone: res.telNumber,
          isDefault: 1,
          remark: ''
        }
        addAddress(params).catch(() => {})
      },
      fail: err => {
        this.setData({
          hasAddressAuth: false
        })
      }
    })
  }

})
