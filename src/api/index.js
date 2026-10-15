import request from '@/utils/request'

export const getCaptcha = () => request.get('/auth/captcha')
export const login = (data) => request.post('/auth/login', data)
export const register = (data) => request.post('/auth/register', data)

export const getProfile = () => request.get('/user/profile')
export const updateProfile = (data) => request.put('/user/profile', data)
export const changePassword = (data) => request.put('/user/password', data)

export const getCategories = () => request.get('/categories')
export const getBanners = (params) => request.get('/banners', { params })
export const getBrands = () => request.get('/brands')
export const getGoods = (params) => request.get('/goods', { params })
export const getRecommendGoods = (params) => request.get('/goods/recommend', { params })
export const getGoodsDetail = (id) => request.get(`/goods/${id}`)
export const getGoodsReviews = (id, params) => request.get(`/goods/${id}/reviews`, { params })

export const getCart = () => request.get('/cart')
export const addCart = (data) => request.post('/cart', data)
export const updateCart = (id, data) => request.put(`/cart/${id}`, data)
export const deleteCart = (id) => request.delete(`/cart/${id}`)

export const getAddresses = () => request.get('/addresses')
export const getAddress = (id) => request.get(`/addresses/${id}`)
export const createAddress = (data) => request.post('/addresses', data)
export const updateAddress = (id, data) => request.put(`/addresses/${id}`, data)
export const deleteAddress = (id) => request.delete(`/addresses/${id}`)
export const setDefaultAddress = (id) => request.post(`/addresses/${id}/default`)

export const createOrder = (data) => request.post('/orders', data)
export const getOrders = (params) => request.get('/orders', { params })
export const getOrder = (id) => request.get(`/orders/${id}`)
export const payOrder = (id, data) => request.post(`/orders/${id}/pay`, data || {})
export const cancelOrder = (id) => request.post(`/orders/${id}/cancel`)
export const confirmOrder = (id) => request.post(`/orders/${id}/confirm`)

export const createReview = (data) => request.post('/reviews', data)
export const myReviews = (params) => request.get('/reviews/mine', { params })

export const applyAfterSale = (data) => request.post('/after-sales', data)
export const getAfterSales = (params) => request.get('/after-sales', { params })
export const getAfterSale = (id) => request.get(`/after-sales/${id}`)
export const cancelAfterSale = (id) => request.post(`/after-sales/${id}/cancel`)
export const returnExpress = (id, data) => request.post(`/after-sales/${id}/return-express`, data)

export const browseHistory = (params) => request.get('/browse-history', { params })
export const clearBrowse = () => request.delete('/browse-history')
export const searchHistory = (params) => request.get('/search-history', { params })
export const clearSearch = () => request.delete('/search-history')
