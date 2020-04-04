import { getOrderList } from "../../api/index";

// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasMore: false,
    listQuery: {
      page: 1,
      pageSize: 10
    },
    total: 0,
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.data.listQuery.page += 1
      this.getOrderData()
    }
  },

  getOrderData: function () {
    const listQuery = this.data.listQuery
    const params = {
      'PageInfo.pageNum': listQuery.page,
      'PageInfo.pageSize': listQuery.pageSize
    }
    getOrderList(params).then((result) => {
      this.setData({
        orderList: result.infos.map(item => {
          item.pdImage = item.pdImage.split(';')[0] //第一张图
          return item
        }),
        total: result.pageInfo.total,
        hasMore: result.pageInfo.total > listQuery.page * listQuery.pageSize
      })
    })
  },

  onOrderRemove: function (e) {
    const { index } = e.detail
    console.log(index);
  }

})
