<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useCart } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'

defineOptions({ name: 'Cart' })
const router = useRouter()
const { isLogin } = useUser()
const { items, allSelected, selectedCount, selectedAmount, updateQty, removeItem, toggleItem, toggleAll, clearBuyNow, loadCart } = useCart()
const checkout = async () => {
  if (!items.value.length) { showToast('购物车是空的'); return }
  if (!selectedCount.value) {
    await toggleAll(true)
  }
  if (!selectedCount.value) { showToast('请先选择商品'); return }
  if (!isLogin.value) { router.push({ path: '/login', query: { redirect: '/checkout' } }); return }
  clearBuyNow()
  router.push('/checkout')
}
const onDelete = async (item) => {
  await showConfirmDialog({ title: '删除商品', message: '确定删除「' + item.name + '」吗？' })
  await removeItem(item.goodsId, item.spec)
}
onMounted(loadCart)
</script>

<template>
  <div class="cart">
    <van-nav-bar title="购物车" />
    <h2 class="pc-title">购物车</h2>
    <div v-if="items.length" class="list">
      <div v-for="item in items" :key="`${item.goodsId}-${item.spec}`" class="card">
        <van-checkbox :model-value="item.selected" @click="toggleItem(item.goodsId, item.spec)" />
        <img :src="item.image" :alt="item.name" @click="router.push(`/goods/${item.goodsId}`)" />
        <div class="info">
          <strong>{{ item.name }}</strong>
          <p>{{ item.spec }} · {{ item.shopName }}</p>
          <div class="row">
            <span class="price"><em>¥</em>{{ item.price }}</span>
            <van-stepper :model-value="item.quantity" min="1" @change="(val) => updateQty(item.goodsId, item.spec, val)" />
          </div>
        </div>
        <van-icon name="delete-o" class="del" @click="onDelete(item)" />
      </div>
    </div>
    <van-empty v-else description="购物车还是空的" image="search">
      <van-button round type="primary" size="small" to="/home">去逛逛</van-button>
    </van-empty>

    <div v-if="items.length" class="bar fixed-bottom-bar">
      <van-checkbox :model-value="allSelected" @click="toggleAll(!allSelected)">全选</van-checkbox>
      <div class="sum">
        合计 <span class="price"><em>¥</em>{{ selectedAmount }}</span>
      </div>
      <van-button type="primary" round :disabled="!items.length" @click="checkout">
        结算({{ selectedCount }})
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.cart {
  min-height: calc(100vh - 50px);
  padding-bottom: 64px;
}

.list {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.card {
  display: grid;
  grid-template-columns: auto 78px 1fr auto;
  gap: 10px;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 12px;
}

.card img {
  width: 78px;
  height: 78px;
  border-radius: 10px;
  object-fit: cover;
}

.info strong {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
}

.info p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.del {
  color: #98a0b3;
  align-self: flex-start;
}

.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 50px;
  width: 100%;
  height: 56px;
  padding: 0 12px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 -6px 18px rgba(31, 36, 48, 0.06);
}

.sum {
  margin-left: auto;
  font-size: 13px;
}

.bar .van-button {
  width: 108px;
}

@media (min-width: 960px) {
  .cart {
    min-height: calc(100vh - var(--header-h));
    padding-bottom: 88px;
  }

  .list {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto;
    padding: 8px 0 24px;
    gap: 12px;
  }

  .card {
    grid-template-columns: auto 110px 1fr auto;
    padding: 16px 20px;
  }

  .card img {
    width: 110px;
    height: 110px;
  }

  .info strong {
    font-size: 16px;
  }

  .bar {
    bottom: 0;
    height: 72px;
  }

  .bar .van-button {
    width: 160px;
  }
}
</style>
