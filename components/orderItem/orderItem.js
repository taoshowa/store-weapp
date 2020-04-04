// components/orderItem/orderItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order: Object,
    index: Number,
    counts: Number
  },

  // lifetimes: {
  //   attached: function() {
  //     const orderDetails = this.properties.order.orderDetails.concat(this.properties.order.orderDetails)
  //     this.setData({
  //       'order.orderDetails': orderDetails
  //     })
  //   }
  // },

  /**
   * 组件的方法列表
   */
  methods: {
    removeItem: function () {
      const { index } = this.properties
      this.triggerEvent('remove', { index })
    }
  }
})
