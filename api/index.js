// pc, wechat
import { request, wxRequest } from '../utils/request'

// pcApi
// banner列表
export const getBannerList = () => request({ url: '/product/indexInfoList' })
// 产品列表
export const getProductList = (data) => request({ url: '/product/productList', data })
// 产品详情
export const getProductDetail = ({ id }) => request({ url: '/product/getProductById', data: { id } })
// 加入购物车
export const addShoppingCart = (data) => request({ url: '/product/addShoppingCart', data })
// 购物车列表
export const getShoppingCarts = (data) => request({ url: '/product/shoppingCartList', data })
// 修改购物车信息
export const editShoppingCart = (data) => request({ url: '/product/modShoppingCartCount', data })
// 删除购物车
export const delShoppingCart = (data) => request({ url: '/product/delShoppingCart', data })
// 结算 生成订单
export const createOrder = (data) => request({ url: '/product/addOrder', data })
// 订单列表
export const getOrderList = (data) => request({ url: '/product/webOrderList', data })
// 添加收货地址
export const addAddress = (data) => request({ url: '/user/address/addUserAddress', data })

// wechatApi
// 登陆换取openId
export const wxLogin = ({ code }) => wxRequest({ url: '/wechat/wxAuth', data: { code } })
// 登陆
export const loginByPhone = ({ openId, mobile, password }) => wxRequest({ url: '/wechat/pcLogin', data: { openId, mobile, password } })
// 结算
export const paymentByWeChat = ({ openId, userId, orderId, pcToken }) => wxRequest({ url: '/wechat/toPay', data: { openId, userId, orderId, pcToken } })
