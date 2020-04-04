// components/cartItem/cartItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    good: Object,
    index: Number,
    counts: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    min: 1, // 最小数量
    max: 20 // 最大数量
  },

  /**
   * 组件的方法列表
   */
  methods: {
    checkItem: function () {
      const { index, good } = this.properties
      this.triggerEvent('check', { index, checked: !good.checked })
    },

    removeItem: function () {
      const { index } = this.properties
      this.triggerEvent('remove', { index })
    },

    plusItem: function () {
      const { index, good } = this.properties
      if (good.pdCount === this.data.max) return
      this.triggerEvent('change', { index, pdCount: good.pdCount + 1 })
    },

    minusItem: function () {
      const { index, good } = this.properties
      if (good.pdCount === this.data.min) return
      this.triggerEvent('change', { index, pdCount: good.pdCount - 1 })
    }
  }
})
