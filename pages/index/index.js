// index.js
import { getBannerList, getProductList, addShoppingCart } from '../../api/index'
import { showToast } from '../../utils/util'
import { getUserInfo } from '../../utils/auth'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    autoplay: true,
    interval: 2500,
    duration: 500,
    circular: true,
    userInfo: null,
    showData: false,
    hasMore: false,
    listQuery: {
      type: '1',
      page: 1,
      pageSize: 10
    },
    menuList: [
      {
        icon: '/images/index/icon-1.png',
        type: '1',
        text: '分类1'
      },
      {
        icon: '/images/index/icon-2.png',
        type: '2',
        text: '分类2'
      },
      {
        icon: '/images/index/icon-3.png',
        type: '3',
        text: '分类3'
      },
      {
        icon: '/images/index/icon-4.png',
        type: '4',
        text: '分类4'
      },
      {
        icon: '/images/index/icon-5.png',
        type: '5',
        text: '分类5'
      }
    ],
    bannerList: null,
    goodList: null
  },

  /**
   * 生命周期函数--监听页面加载
   * options 启动参数
   */
  onLoad: function (options) {
    this.getBanners()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const userInfo = getUserInfo()
    this.data.userInfo = userInfo || null
    // 每次点击首页刷新 显示推荐
    // this.getBanners()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.data.listQuery.page += 1
      this.getGoodList()
    }
  },

  /**
   * 获取banner
   */
  getBanners: function () {
    getBannerList().then((result) => {
      this.setData({
        showData: true,
        bannerList: result.bannerConfigs,
        goodList: result.products.map(item => {
          item.imgUrl = item.imgUrl.split(';')[0] //第一张图
          return item
        })
      })
    })
  },

  /**
   * 获取产品展示列表
   */
  getGoodList: function () {
    const listQuery = this.data.listQuery
    const params = {
      productSeries: listQuery.type,
      'PageInfo.pageNum': listQuery.page,
      'PageInfo.pageSize': listQuery.pageSize
    }
    getProductList(params).then((result) => {
      this.setData({
        goodList: result.infos.map(item => {
          item.imgUrl = item.imgUrl.split(';')[0] //第一张图
          return item
        }),
        hasMore: result.pageInfo.total > listQuery.page * listQuery.pageSize
      })
    })
  },

  onBannerTap: function (e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/good/good?id=${id}`
    })
  },

  onMenuTap: function (e) {
    const { type } = e.currentTarget.dataset
    this.data.listQuery.type = type
    this.data.listQuery.page = 1
    this.getGoodList()
  },

  onGoodClick: function (e) {
    const { id } = e.detail
    wx.navigateTo({
      url: `/pages/good/good?id=${id}`
    })
  },

  onAddCart: function (e) {
    if (!this.data.userInfo) {
      return wx.navigateTo({
        url: '/pages/login/login'
      })
    }

    const { index } = e.detail
    const checked = this.data.goodList[index]
    const params = {
      pdId: checked.id,
      pdName: checked.productName,
      pdImage: checked.imgUrl,
      pdAttribute: checked.productAttribute,
      pdCount: 1,
      pdUnitPrice: checked.price
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
  }
})
