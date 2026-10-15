<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReviews } from '@/composables/useReviews'

const router = useRouter()
const goBack = () => {
  if (window.history.state && window.history.state.back != null) router.back()
  else router.replace('/mine')
}

const { reviews, loadMyReviews } = useReviews()
onMounted(() => loadMyReviews({ page: 1, size: 50 }))
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的评价" left-arrow @click-left="goBack" />
    <h2 class="pc-title">我的评价</h2>
    <van-tabs v-model:active="active" @change="onTab">
      <van-tab
        v-for="item in tabs"
        :key="item.name"
        :title="item.name === 'pending' ? `待评价${pendingItems.length ? `(${pendingItems.length})` : ''}` : `已评价${myReviews.length ? `(${myReviews.length})` : ''}`"
        :name="item.name"
      />
    </van-tabs>

    <div v-if="active === 'pending' && list.length" class="list">
      <article v-for="item in list" :key="`${item.orderId}-${item.goodsId}-${item.spec}`" class="card">
        <div class="goods">
          <img :src="item.image" :alt="item.name" @click="router.push(`/goods/${item.goodsId}`)" />
          <div>
            <strong>{{ item.name }}</strong>
            <p>{{ item.spec }} · {{ item.orderNo }}</p>
          </div>
        </div>
        <div class="foot">
          <van-button size="small" type="primary" @click="goWrite(item)">去评价</van-button>
        </div>
      </article>
    </div>

    <div v-else-if="active === 'done' && list.length" class="list">
      <article v-for="item in list" :key="item.id" class="card">
        <div class="goods" @click="router.push(`/goods/${item.goodsId}`)">
          <img :src="item.goodsImage" :alt="item.goodsName" />
          <div>
            <strong>{{ item.goodsName }}</strong>
            <p>{{ item.spec }} · {{ item.createdAt }}</p>
            <van-rate :model-value="item.star" size="14" readonly color="#f59e0b" />
          </div>
          <em>{{ item.type }}</em>
        </div>
        <p class="content">{{ item.content }}</p>
        <div v-if="item.images?.length" class="photos">
          <button
            v-for="(url, index) in item.images"
            :key="index"
            type="button"
            class="photo"
            @click="previewImages(item.images, index)"
          >
            <img :src="url" alt="评价图片" />
          </button>
        </div>
        <div class="foot">
          <span>{{ item.anonymous ? '匿名评价' : '公开评价' }}</span>
          <van-button size="small" @click="onDelete(item)">删除</van-button>
        </div>
      </article>
    </div>

    <van-empty v-else :description="active === 'pending' ? '暂无待评价商品' : '还没有发表评价'" />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.list {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
}

.goods {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 10px;
  align-items: center;
}

.goods img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.goods p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.goods em {
  font-style: normal;
  color: var(--brand-blue);
  font-size: 13px;
}

.content {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #3d4454;
}

.photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.photo {
  padding: 0;
  border: 0;
  background: transparent;
}

.photo img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.foot span {
  color: var(--text-secondary);
  font-size: 12px;
}

@media (min-width: 960px) {
  .page {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 40px;
  }

  .list {
    padding: 8px 0 24px;
    gap: 16px;
  }

  .card {
    padding: 16px 20px;
  }
}
</style>
