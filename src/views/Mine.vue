<script setup>
import { computed, onActivated, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useUser, logout, refreshProfile, hydrateFromStorage } from '@/composables/useUser'
import { useOrders } from '@/composables/useOrders'
import { useAfterSales } from '@/composables/useAfterSales'
import { useReviews } from '@/composables/useReviews'
import { getToken } from '@/utils/request'

defineOptions({ name: 'Mine' })
const router = useRouter()
const { user, isLogin } = useUser()
const { pendingPay, pendingShip, pendingReceive, loadOrders } = useOrders()
const { pendingCount, loadAfterSales } = useAfterSales()
const { pendingCount: pendingReviewCount } = useReviews()
const orderMenus = computed(() => [
  { label: '待付款', icon: 'pending-payment', status: '待付款', count: pendingPay.value },
  { label: '待发货', icon: 'logistics', status: '待发货', count: pendingShip.value },
  { label: '待收货', icon: 'send-gift-o', status: '待收货', count: pendingReceive.value },
  { label: '售后', icon: 'after-sale', status: '售后中', count: pendingCount.value },
])
const go = (path) => router.push(path)
const onLogout = async () => {
  await showConfirmDialog({ title: '退出登录' })
  logout()
  router.replace('/login')
}

async function loadMine() {
  hydrateFromStorage()
  if (!getToken()) return
  await refreshProfile().catch(() => {})
  await Promise.all([
    loadOrders({ page: 1, size: 50 }).catch(() => {}),
    loadAfterSales({ page: 1, size: 50 }).catch(() => {}),
  ])
}

onMounted(loadMine)
onActivated(loadMine)
watch(isLogin, (v) => {
  if (v) loadMine()
})
</script>

<template>
  <div class="mine">
    <header class="hero">
      <div v-if="isLogin" class="user" @click="go('/profile')">
        <div class="avatar">{{ user.name.slice(0, 1) }}</div>
        <div>
          <strong>{{ user.name }}</strong>
          <p>{{ user.phone }}</p>
        </div>
        <van-icon name="arrow" />
      </div>
      <div v-else class="user" @click="router.push('/login')">
        <div class="avatar">优选</div>
        <div>
          <strong>登录 / 注册</strong>
          <p>登录后享受更多会员权益</p>
        </div>
        <van-icon name="arrow" />
      </div>
    </header>

    <section class="card">
      <div class="card-head">
        <h3>我的订单</h3>
        <button type="button" @click="go('/orders')">全部订单 <van-icon name="arrow" /></button>
      </div>
      <div class="order-grid">
        <button v-for="item in orderMenus" :key="item.label" type="button" @click="go(`/orders?status=${item.status}`)">
          <van-badge :content="item.count || undefined">
            <van-icon :name="item.icon" size="22" />
          </van-badge>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section class="card list">
      <van-cell title="我的评价" is-link icon="comment-o" :value="pendingReviewCount ? `${pendingReviewCount}条待评价` : ''" @click="go('/reviews')" />
      <van-cell title="退款/售后" is-link icon="refund-o" :value="pendingCount ? `${pendingCount}笔进行中` : ''" @click="go('/after-sales')" />
      <van-cell title="收货地址" is-link icon="location-o" @click="go('/address')" />
      <van-cell title="个人资料" is-link icon="contact" @click="go('/profile')" />
      <van-cell title="客服帮助" is-link icon="service-o" value="XXX-XXX-XXXX" />
    </section>

    <van-button v-if="isLogin" block round class="logout" @click="onLogout">退出登录</van-button>
  </div>
</template>

<style scoped>
.mine {
  padding-bottom: 24px;
}

.hero {
  padding: 28px 16px 36px;
  background: var(--brand-gradient);
  color: #fff;
}

.user {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.user strong {
  font-size: 18px;
}

.user p {
  margin: 4px 0 0;
  opacity: 0.84;
  font-size: 12px;
}

.card {
  margin: -18px 16px 12px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 12px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-head h3,
.card-head button {
  margin: 0;
  border: 0;
  background: transparent;
}

.card-head button {
  color: var(--text-secondary);
  font-size: 12px;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.order-grid button {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #3d4454;
  font-size: 12px;
}

.list {
  padding: 0;
  overflow: hidden;
}

.logout {
  width: calc(100% - 32px);
  margin: 16px auto 0;
  background: #fff;
  border: 0;
  color: #ef4444;
}

@media (min-width: 960px) {
  .mine {
    width: min(800px, calc(100% - 48px));
    margin: 24px auto 40px;
    padding-bottom: 0;
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08);
  }

  .hero {
    padding: 36px 28px;
  }

  .card {
    margin: 0 20px 16px;
  }

  .logout {
    width: calc(100% - 40px);
    margin: 8px auto 24px;
  }
}
</style>
