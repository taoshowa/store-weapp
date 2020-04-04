// components/goodItem/goodItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object,
    index: Number
  },

  /**
   * 组件的初始数据
   */
  data: {},


  /**
   * 组件的方法列表
   */
  methods: {
    onGoodTap: function (e) {
      this.triggerEvent('click', { id: this.properties.item.id })
    },
    onAddTap: function (e) {
      this.triggerEvent('add', { index: this.properties.index })
    }
  }
})
