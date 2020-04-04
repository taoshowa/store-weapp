import { getShoppingCarts, delShoppingCart, editShoppingCart, createOrder, paymentByWeChat } from "../../api/index"
import { getUserInfo } from "../../utils/auth"
import { showToast, getStorageSync, setStorageSync, requestPayment } from "../../utils/util"

// pages/cart/cart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canRefush: true,
    hasAddressAuth: true,
    userInfo: null,
    checkAll: false,
    priceTotal: 0,
    pdFreight: 0,
    cartList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const userInfo = getUserInfo()
    if (!userInfo || !userInfo.token) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
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
    if (userInfo && userInfo.token) {
      this.data.userInfo = userInfo || null
      this.data.canRefush && this.getCartList()
    } else {
      setStorageSync('cartChecked', null)
    }
  },

  onHide: function () {
    // 隐藏时记录checked商品
    const cartList = this.data.cartList
    const idList = cartList.filter(item => item.checked).map(item => item.id)
    setStorageSync('cartChecked', idList.length ? idList : null)
  },

  /**
   * 获取购物车列表
   */
  getCartList: function () {
    getShoppingCarts({ id: this.data.userInfo.userId }).then((result) => {
      const cartChecked = getStorageSync('cartChecked')
      this.setData({
        cartList: Array.isArray(result) ? result.map(item => {
          item.pdImage = item.pdImage.split(';')[0] // 取第一张图
          item.checked = Array.isArray(cartChecked) ? cartChecked.some(id => id === item.id) : false,
          // 总价已处理
          item.pdTotalFee = item.pdUnitPrice * item.pdCount
          return item
        }) : []
      })
      if (cartChecked) {
        this.getPriceTotal()
      } else {
        this.setData({ checkAll: false })
      }
    })
  },
  /**
   * 价格合计(选中商品)
   */
  getPriceTotal: function () {
    const cartList = this.data.cartList
    const checkdList = cartList.filter(item => item.checked)
    const priceTotal = checkdList.reduce((res, cur) => res + cur.pdTotalFee, 0)
    const pdFreight = priceTotal !== 0 ? priceTotal < 100 ? 15 : 0 : 0
    this.setData({
      pdFreight,
      priceTotal: priceTotal + pdFreight,
      checkAll: cartList.length === checkdList.length
    })
  },
  /**
   * 商品checkbox点击
   */
  onGoodCheck: function (e) {
    const { index, checked } = e.detail
    const cartList = this.data.cartList
    cartList[index].checked = checked
    this.setData({
      [`cartList[${index}].checked`]: checked
    })
    this.getPriceTotal()
  },
  /**
   * 商品数量增加
   */
  onGoodChange: function (e) {
    const { index, pdCount } = e.detail
    const cartList = this.data.cartList
    const pdTotalFee = pdCount * cartList[index].pdUnitPrice
    const params = {
      id: cartList[index].id,
      pdCount: pdCount,
      pdTotalFee: pdTotalFee
    }
    editShoppingCart(params).then((result) => {
      if (result == 'true') {
        this.setData({
          [`cartList[${index}].pdCount`]: pdCount,
          [`cartList[${index}].pdTotalFee`]: pdTotalFee,
        })
        this.getPriceTotal()
      }
    }).catch((err) => {
      showToast({
        title: '操作失败'
      })
    })
  },
  /**
   * 商品移除
   */
  onGoodRemove: function (e) {
    const { index } = e.detail
    const cartList = this.data.cartList
    delShoppingCart({ shoppingCartId: cartList[index].id }).then((result) => {
      if (result == 'true') {
        cartList.splice(index, 1)
        this.setData({ cartList })
        this.getPriceTotal()
      }
    }).catch((err) => {
      showToast({
        title: '删除失败'
      })
    })
  },
  /**
   * 商品全选
   */
  checkAllGoods : function () {
    const { checkAll, cartList } = this.data
    this.setData({
      cartList: cartList.map(item => (item.checked = !checkAll, item))
    })
    this.getPriceTotal()
  },
  /**
   * 打开权限设置
   */
  openSetting() {
    wx.openSetting()
  },
  /**
   * 结算
   */
  onSettleTap () {
    const cartList = this.data.cartList
    const checkedList = cartList.filter(item => item.checked)
    if (!checkedList.length) {
      return showToast({ title: '请先勾选结算商品' })
    }

    wx.chooseAddress({
      success: res => {
        this.data.canRefush = false;
        const userId = this.data.userInfo.userId
        const openId = getStorageSync('qg_openId')
        const pdCount = checkedList.reduce((res, cur) => (res += cur.pdCount, res), 0)
        const orderInfo = {
          userId,
          pdCount,
          payMode: 0, //微信
          pdFreight: this.data.pdFreight,
          pdTotalFee: this.data.priceTotal, //总价
          toProvince: res.provinceName,
          toCity: res.cityName,
          toArea: res.countyName,
          toAddress: res.detailInfo,
          toName: res.userName,
          toMobile: res.telNumber,
          remark: '',
          orderDetails: [...checkedList]
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
            }).finally(end => {
              // 清空已勾选
              setStorageSync('cartChecked', null)
            })
          })
        }).finally(done => {
          this.data.canRefush = true;
        })
      },
      fail: err => {
        this.setData({
          hasAddressAuth: false
        })
      }
    })
  }
})
