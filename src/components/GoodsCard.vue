<script setup>
import { computed } from 'vue'

const props = defineProps({
  goods: { type: Object, required: true },
  hideHotTag: { type: Boolean, default: false },
  hideNewTag: { type: Boolean, default: false },
  /** 隐藏全部状态标签（热销/新品/推荐） */
  hideTags: { type: Boolean, default: false },
})

/** 移动端只展示一个标签：推荐 > 热销 > 新品 */
const statusTag = computed(() => {
  if (props.hideTags) return null
  const g = props.goods || {}
  if (g.recommend) return { key: 'recommend', text: '推荐', cls: 'tag-rec' }
  if (g.hot && !props.hideHotTag) return { key: 'hot', text: '热销', cls: 'tag-hot' }
  if (g.isNew && !props.hideNewTag) return { key: 'new', text: '新品', cls: 'tag-new' }
  return null
})
</script>

<template>
  <router-link class="goods-card" :to="`/goods/${goods.id}`">
    <div class="thumb">
      <img :src="goods.image" :alt="goods.name" />
      <div v-if="statusTag" class="tags">
        <span class="tag" :class="statusTag.cls">{{ statusTag.text }}</span>
      </div>
    </div>
    <div class="info">
      <h3>{{ goods.name }}</h3>
      <p v-if="goods.shopName" class="shop-name">{{ goods.shopName }}</p>
      <div class="row">
        <span class="price"><em>¥</em>{{ goods.price }}</span>
        <span class="sales">已售 {{ goods.sales }}</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.goods-card {
  display: block;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(77, 124, 255, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@media (hover: hover) {
  .goods-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px rgba(77, 124, 255, 0.14);
  }
}

.thumb {
  position: relative;
  aspect-ratio: 1;
  background: #f3f5fb;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tags {
  position: absolute;
  left: 8px;
  top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: calc(100% - 16px);
}

.tag {
  padding: 2px 8px;
  border-radius: 999px;
  color: #fff;
  font-size: 11px;
  line-height: 1.4;
}

.tag-hot { background: linear-gradient(135deg, #ff7a59, #ef4444); }
.tag-rec { background: linear-gradient(135deg, #4d7cff, #7c5cff); }
.tag-new { background: linear-gradient(135deg, #22c3c8, #10b981); }

.info {
  padding: 10px 10px 12px;
}

h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.shop-name {
  margin: 6px 0 8px;
  color: var(--text-secondary, #98a0b3);
  font-size: 11px;
  line-height: 1.3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.price {
  color: #ef4444;
  font-size: 16px;
  font-weight: 800;
}

.price em {
  font-style: normal;
  font-size: 11px;
}

.sales {
  color: #a0a6b3;
  font-size: 11px;
}
</style>