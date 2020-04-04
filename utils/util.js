export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export const showToast = obj => {
  if (!obj || !obj.title) {
    return console.warn('title is required!')
  }
  try {
    obj.icon = obj.icon || 'none'
    obj.duration = obj.duration || 3000
    obj.mask = obj.mask || false
    wx.showToast(obj)
  } catch (e) {
    // Do something when catch error
  }
}

export const showModal = obj => {
  if (!obj || !obj.content) {
    return console.warn('content is required!')
  }
  try {
    wx.showModal({
      title: obj.title || '',
      content: obj.content || '',
      showCancel: obj.showCancel ? true : false,
      cancelText: obj.cancelText || '取消',
      confirmText: obj.confirmText || '确定',
      success: function (res) {
        if (obj.success) obj.success(res)
      }
    })
  } catch (e) {
    // Do something when catch error
  }
}

// 由于wx.getStorageSync有一定概率取不到值，若取不到再取一次
export const getStorageSync = key => {
  try {
    let value = wx.getStorageSync(key)
    if (!value) {
      value = wx.getStorageSync(key)
    }
    return value
  } catch (e) {
    return ''
  }
}

export const setStorageSync = (key, value) => {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {}
}

export const requestPayment = data => {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      ...data,
      success: result => {
        resolve(result)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
