// pages/good/good.js
import { getProductDetail, addShoppingCart, createOrder, paymentByWeChat } from '../../api/index'
import { showToast, requestPayment, getStorageSync } from '../../utils/util'
import { getUserInfo } from '../../utils/auth'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailId: null,
    userInfo: null,
    indicatorDots: true,
    autoplay: true,
    interval: 2500,
    duration: 500,
    circular: true,
    good: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.detailId = options.id
    this.getDetail()

    const userInfo = getUserInfo()
    this.data.userInfo = userInfo || null
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取商品详情
   */
  getDetail: function () {
    getProductDetail({ id: this.data.detailId }).then((result) => {
      const detail = { ...result }
      if (!detail.id) {
        throw Error ('数据错误')
      }
      detail.imgUrl = detail.imgUrl.split(';') // 多图分割

      this.setData({
        good: detail
      })
    }).catch((err) => {
      showToast({
        title: '详情获取失败，请稍后再试',
        success() {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2e3);
        }
      })
    });
  },

  /**
   * banner点击预览
   */
  previewImage: function (e) {
    const { index } = e.currentTarget.dataset
    wx.previewImage({
      current: this.data.good.imgUrl[index],
      urls: this.data.good.imgUrl
    })
  },

  isLogin() {
    if (!this.data.userInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  },

  /**
   * 加入购物车
   */
  onAddTap: function () {
    if (!this.isLogin()) return

    const good = this.data.good
    const params = {
      pdId: good.id,
      pdName: good.productName,
      pdImage: good.imgUrl[0], // 第一张图
      pdAttribute: good.productAttribute,
      pdCount: 1,
      pdUnitPrice: good.price
    }

    addShoppingCart(params).then((result) => {
      if (result == 'true') {
        showToast({
          title: '添加成功，请在购物车中查看'
        })
      }
    }).catch((err) => {
      showToast({
        title: '添加失败'
      })
    })
  },

  /**
   * 购买
   */
  onBuyTap: function () {
    if (!this.isLogin()) return

    const good = this.data.good
    const goodDetail = {
      pdId: good.id,
      pdName: good.productName,
      pdImage: good.imgUrl[0],
      pdAttribute: good.productAttribute,
      pdCount: 1,
      pdUnitPrice: good.price
    }

    wx.chooseAddress({
      success: res => {
        const userId = this.data.userInfo.userId
        const openId = getStorageSync('qg_openId')
         //运费 100以下15
        const pdFreight = good.price < 100 ? 15 : 0
        const orderInfo = {
          userId,
          payMode: 0, // 微信
          pdCount: 1,
          pdFreight: pdFreight, // 运费
          pdTotalFee: good.price + pdFreight, //总价
          toProvince: res.provinceName,
          toCity: res.cityName,
          toArea: res.countyName,
          toAddress: res.detailInfo,
          toName: res.userName,
          toMobile: res.telNumber,
          remark: '',
          orderDetails: [goodDetail]
        }
        // 生成订单
        createOrder({ orderInfo: JSON.stringify(orderInfo) }).then((result) => {
          const res = JSON.parse(result)
          if (!res.orderId) {
            return showToast({ title: '订单创建失败' })
          }

          // 生成支付参数
          paymentByWeChat({ userId, openId, orderId: res.orderId }).then((result) => {
            const payParams = {...result}
            // 发起支付
            requestPayment(payParams).then((result) => {
              // console.log(result)
              showToast({ title: '支付成功，订单中心可查看详情' })
            }).catch((err) => {
              // console.log(err)
              if (err.errMsg !== "requestPayment:fail cancel") {
                showToast({ title: '支付失败' })
              }
            })
          })
        })
      }
    })
  }
})
