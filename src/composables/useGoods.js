import { computed, ref } from 'vue'

export const categories = [
  { name: '手机', icon: '📱', color: '#4d7cff' },
  { name: '笔记本电脑', icon: '💻', color: '#8b6cf6' },
  { name: '耳机', icon: '🎧', color: '#22c3c8' },
  { name: '相机', icon: '📷', color: '#f59e0b' },
  { name: '智能穿戴', icon: '⌚', color: '#ef4444' },
  { name: '配件', icon: '🔌', color: '#64748b' },
]

export const banners = [
  { id: 'B1001', title: '数码焕新季', subtitle: '换新好物低至 5 折起', tag: 'renew', theme: 'blue' },
  { id: 'B1002', title: '爆款直降', subtitle: '热销数码限时特惠', tag: 'hot', theme: 'navy' },
  { id: 'B1003', title: '新品首发', subtitle: '数码新品抢先体验', tag: 'new', theme: 'purple' },
]

const imageMap = {
  笔记本电脑: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&h=800&q=80',
  手机: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&h=800&q=80',
  耳机: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&h=800&q=80',
  相机: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&h=800&q=80',
  智能穿戴: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&h=800&q=80',
  配件: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&h=800&q=80',
}

const extraImages = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&h=800&q=80',
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&h=800&q=80',
  'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&h=800&q=80',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&h=800&q=80',
]

const shops = [
  '数码旗舰店',
  '笔记本优选店',
  '耳机声学馆',
  '配件专卖店',
  '相机专营店',
  '智能穿戴体验店',
]

const specByCategory = {
  笔记本电脑: { cpu: 'i7-13700H', screen: '14英寸', memory: '16GB', disk: '512GB', battery: '70Wh', warranty: '全国联保两年' },
  手机: { cpu: '骁龙8 Gen3', screen: '6.7英寸', memory: '12GB', disk: '256GB', battery: '5000mAh', warranty: '全国联保一年' },
  耳机: { cpu: '主动降噪芯', screen: '-', memory: '-', disk: '-', battery: '30h', warranty: '全国联保一年' },
  相机: { cpu: 'BIONZ XR', screen: '3.0英寸', memory: '-', disk: '双卡槽', battery: 'NP-FZ100', warranty: '全国联保两年' },
  智能穿戴: { cpu: 'S9 SiP', screen: '1.9英寸', memory: '64GB', disk: '-', battery: '18h', warranty: '全国联保一年' },
  配件: { cpu: '-', screen: '-', memory: '-', disk: '-', battery: '-', warranty: '全国联保一年' },
}

const productSeeds = [
  { name: '华为 Mate 60', category: '手机', price: 4999, sales: 980, brand: '华为', shop: '手机通讯广场' },
  { name: 'iPhone 15 Pro', category: '手机', price: 7999, sales: 1260, brand: '苹果', shop: '数码旗舰店' },
  { name: '小米 14', category: '手机', price: 3999, sales: 860, brand: '小米', shop: '手机通讯广场' },
  { name: 'MacBook Air 13', category: '笔记本电脑', price: 8999, sales: 420, brand: '苹果', shop: '笔记本优选店' },
  { name: 'ProBook 14 笔记本', category: '笔记本电脑', price: 5899, sales: 1345, brand: '联想', shop: '笔记本优选店' },
  { name: '游戏本 16 寸', category: '笔记本电脑', price: 7699, sales: 310, brand: '戴尔', shop: '笔记本优选店' },
  { name: '索尼降噪耳机', category: '耳机', price: 1299, sales: 1120, brand: '索尼', shop: '耳机声学馆' },
  { name: '无线降噪耳机', category: '耳机', price: 899, sales: 1540, brand: '索尼', shop: '耳机声学馆' },
  { name: 'AirPods Pro', category: '耳机', price: 1899, sales: 980, brand: '苹果', shop: '数码旗舰店' },
  { name: '全画幅微单相机', category: '相机', price: 6899, sales: 256, brand: '索尼', shop: '相机专营店' },
  { name: '运动相机', category: '相机', price: 2399, sales: 256, brand: '索尼', shop: '相机专营店' },
  { name: '富士拍立得', category: '相机', price: 799, sales: 640, brand: '富士', shop: '摄影器材社' },
  { name: 'Apple Watch', category: '智能穿戴', price: 2999, sales: 760, brand: '苹果', shop: '智能穿戴体验店' },
  { name: '小米手环', category: '智能穿戴', price: 249, sales: 2100, brand: '小米', shop: '智能穿戴体验店' },
  { name: '华为手表 GT', category: '智能穿戴', price: 1299, sales: 540, brand: '华为', shop: '智能穿戴体验店' },
  { name: '机械键盘', category: '配件', price: 459, sales: 1345, brand: '小米', shop: '配件专卖店' },
  { name: '移动固态硬盘', category: '配件', price: 599, sales: 880, brand: '三星', shop: '存储设备店' },
  { name: '无线鼠标', category: '配件', price: 129, sales: 1660, brand: '罗技', shop: '游戏外设铺' },
  { name: 'Type-C 快充头', category: '配件', price: 79, sales: 3200, brand: '小米', shop: '配件专卖店' },
  { name: '4K 显示器', category: '配件', price: 1899, sales: 210, brand: '戴尔', shop: '配件专卖店' },
  { name: '便携投影仪', category: '配件', price: 1599, sales: 180, brand: '极米', shop: '配件专卖店' },
  { name: '蓝牙音箱', category: '配件', price: 199, sales: 920, brand: '漫步者', shop: '耳机声学馆' },
  { name: 'iPhone 保护壳', category: '配件', price: 59, sales: 2800, brand: '苹果', shop: '配件专卖店' },
  { name: '折叠屏手机', category: '手机', price: 9999, sales: 126, brand: '华为', shop: '手机通讯广场' },
]

const reviewSeeds = [
  { userName: '陈思琪', content: '音质清晰，降噪效果很好，出门通勤很合适，包装也完整。', star: 5 },
  { userName: '李雨桐', content: '整体做工不错，发货快，实际使用体验比预期更好，会推荐给朋友。', star: 5 },
  { userName: '王嘉宁', content: '外观精致，按键手感扎实，长时间使用也不容易累。', star: 4 },
  { userName: '赵婉清', content: '拍照效果出色，成色和描述一致，客服回复也很及时。', star: 5 },
  { userName: '刘子涵', content: '续航一般，其他方面都可以，性价比还行。', star: 3 },
]

const createGoodsList = () =>
  productSeeds.map((seed, i) => {
    const image = i % 5 === 2 ? extraImages[i % extraImages.length] : imageMap[seed.category]
    const salePrice = seed.price
    const marketPrice = salePrice + Math.round(salePrice * 0.12)
    return {
      id: `G${String(1001 + i)}`,
      name: seed.name,
      category: seed.category,
      brand: seed.brand,
      shopName: seed.shop || shops[i % shops.length],
      price: salePrice,
      salePrice,
      marketPrice,
      stock: 20 + (i % 40),
      sales: seed.sales,
      recommend: i % 3 === 0,
      hot: seed.sales > 900,
      isNew: i % 7 === 0,
      image,
      images: [image, extraImages[i % extraImages.length], extraImages[(i + 1) % extraImages.length]],
      description: `${seed.name}，面向数码优选商城的热销型号，支持七天无理由退货。`,
      detailText: `${seed.name} 采用优质元器件与精细工艺，日常使用流畅稳定。全国联保，支持七天无理由退货。`,
      specs: [{ ...(specByCategory[seed.category] || specByCategory['配件']) }],
      skuOptions: ['标准版', '高配版', '旗舰版'],
      reviews: reviewSeeds.map((item, index) => ({
        ...item,
        id: `R${i}-${index}`,
        createdAt: `2026-0${(index % 9) + 1}-${String((index % 27) + 1).padStart(2, '0')}`,
      })),
    }
  })

const allGoods = ref(createGoodsList())

export const getGoodsById = (id) => allGoods.value.find((item) => item.id === id) || null

export function addGoodsReview(goodsId, review) {
  const goods = getGoodsById(goodsId)
  if (!goods || !review?.id) return
  if (goods.reviews.some((item) => item.id === review.id)) return
  goods.reviews.unshift(review)
}

export function removeGoodsReview(reviewId) {
  allGoods.value.forEach((goods) => {
    goods.reviews = goods.reviews.filter((item) => item.id !== reviewId)
  })
}

export const filterGoods = ({ category = '', keyword = '', tag = '' } = {}) => {
  return allGoods.value.filter((item) => {
    const matchCategory = !category || item.category === category
    const matchKeyword =
      !keyword ||
      item.name.includes(keyword) ||
      item.brand.includes(keyword) ||
      item.shopName.includes(keyword)
    const matchTag =
      !tag ||
      (tag === 'hot' && item.hot) ||
      (tag === 'new' && item.isNew) ||
      (tag === 'renew' && item.recommend)
    return matchCategory && matchKeyword && matchTag
  })
}

export function useGoods() {
  const hotGoods = computed(() => allGoods.value.filter((item) => item.hot).slice(0, 8))
  const recommendGoods = computed(() => allGoods.value.filter((item) => item.recommend))
  const newGoods = computed(() => allGoods.value.filter((item) => item.isNew))

  return {
    allGoods,
    categories,
    banners,
    hotGoods,
    recommendGoods,
    newGoods,
    getGoodsById,
    addGoodsReview,
    removeGoodsReview,
    filterGoods,
  }
}
