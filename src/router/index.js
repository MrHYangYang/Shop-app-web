import { createRouter, createWebHistory } from 'vue-router'
import TabLayout from '@/layouts/TabLayout.vue'

const routes = [
  {
    path: '/',
    component: TabLayout,
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
      { path: 'category', name: 'Category', component: () => import('@/views/Category.vue'), meta: { title: '分类' } },
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue'), meta: { title: '购物车' } },
      { path: 'mine', name: 'Mine', component: () => import('@/views/Mine.vue'), meta: { title: '我的' } },
    ],
  },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue'), meta: { title: '注册' } },
  { path: '/search', name: 'Search', component: () => import('@/views/Search.vue'), meta: { title: '搜索' } },
  { path: '/goods', name: 'GoodsList', component: () => import('@/views/GoodsList.vue'), meta: { title: '商品列表' } },
  { path: '/goods/:id', name: 'GoodsDetail', component: () => import('@/views/GoodsDetail.vue'), meta: { title: '商品详情' } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/views/Checkout.vue'), meta: { title: '确认订单', auth: true } },
  { path: '/orders', name: 'OrderList', component: () => import('@/views/OrderList.vue'), meta: { title: '我的订单', auth: true } },
  { path: '/orders/:id', name: 'OrderDetail', component: () => import('@/views/OrderDetail.vue'), meta: { title: '订单详情', auth: true } },
  { path: '/after-sales', name: 'AfterSaleList', component: () => import('@/views/AfterSaleList.vue'), meta: { title: '退款/售后', auth: true } },
  { path: '/after-sales/apply/:orderId', name: 'AfterSaleApply', component: () => import('@/views/AfterSaleApply.vue'), meta: { title: '申请售后', auth: true } },
  { path: '/after-sales/:id', name: 'AfterSaleDetail', component: () => import('@/views/AfterSaleDetail.vue'), meta: { title: '售后详情', auth: true } },
  { path: '/reviews', name: 'ReviewList', component: () => import('@/views/ReviewList.vue'), meta: { title: '我的评价', auth: true } },
  { path: '/reviews/write/:orderId/:goodsId', name: 'ReviewForm', component: () => import('@/views/ReviewForm.vue'), meta: { title: '发表评价', auth: true } },
  { path: '/address', name: 'AddressList', component: () => import('@/views/AddressList.vue'), meta: { title: '收货地址', auth: true } },
  { path: '/address/edit/:id?', name: 'AddressForm', component: () => import('@/views/AddressForm.vue'), meta: { title: '编辑地址', auth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { title: '个人资料', auth: true } },
  { path: '/browse-history', name: 'BrowseHistory', component: () => import('@/views/BrowseHistory.vue'), meta: { title: '浏览记录', auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.auth) {
    const token = localStorage.getItem('shop-app-token')
    if (!token) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
  return true
})

router.afterEach((to) => {
  const page = to.meta.title
  document.title = page && page !== '首页' ? `数码优选 - ${page}` : '数码优选'
})

export default router
