<script setup>
defineProps({
  goods: { type: Object, required: true },
})
</script>

<template>
  <router-link class="goods-card" :to="`/goods/${goods.id}`">
    <div class="thumb">
      <img :src="goods.image" :alt="goods.name" />
      <span v-if="goods.hot" class="tag">热销</span>
    </div>
    <div class="info">
      <h3>{{ goods.name }}</h3>
      <p>{{ goods.shopName }}</p>
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

.tag {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7a59, #ef4444);
  color: #fff;
  font-size: 11px;
}

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

p {
  margin: 6px 0 8px;
  color: var(--text-secondary);
  font-size: 11px;
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
