<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useCart } from '@/composables/useCart'
import { useAddress } from '@/composables/useAddress'
import { createOrder } from '@/composables/useOrders'

const router = useRouter()
const { checkoutItems, checkoutAmount, completeCheckout, updateCheckoutQty, loadCart } = useCart()
const { defaultAddress, loadAddresses } = useAddress()
const payType = ref('微信支付')
const submitting = ref(false)
const goodsList = computed(() => checkoutItems.value)
const stockOf = (item) => Math.max(1, Number(item.stock || 99))

const submit = async () => {
  if (!goodsList.value.length) {
    showToast('请先选择商品')
    router.replace('/cart')
    return
  }
  if (!defaultAddress.value) {
    showToast('请先添加收货地址')
    router.push('/address')
    return
  }
  submitting.value = true
  try {
    const orders = await createOrder({
      addressId: defaultAddress.value.id,
      payType: payType.value,
      items: goodsList.value.map((i) => ({
        goodsId: i.goodsId,
        skuName: i.spec || i.skuName || '标准版',
        qty: i.quantity || i.qty || 1,
      })),
    })
    await completeCheckout()
    showToast('下单成功')
    const first = Array.isArray(orders) ? orders[0] : orders
    router.replace(first?.id ? '/orders/' + first.id : '/orders')
  } catch (e) {
    // toast already shown by request interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadAddresses(), loadCart()])
})
</script>

<template>
  <div class="page">
    <van-nav-bar title="确认订单" left-arrow @click="router.back()" />
    <h2 class="pc-title">确认订单</h2>

    <section class="card address" @click="router.push('/address')">
      <div v-if="defaultAddress">
        <strong>{{ defaultAddress.name }} {{ defaultAddress.phone }}</strong>
        <p>{{ defaultAddress.region }}{{ defaultAddress.detail }}</p>
      </div>
      <p v-else>请添加收货地址</p>
      <van-icon name="arrow" />
    </section>

    <section class="card">
      <div v-for="item in goodsList" :key="`${item.goodsId}-${item.spec}`" class="goods">
        <img :src="item.image" :alt="item.name" />
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.spec }}</p>
          <div class="row">
            <span class="price"><em>¥</em>{{ item.price }}</span>
            <van-stepper
              :model-value="item.quantity"
              min="1"
              :max="stockOf(item)"
              @change="(val) => updateCheckoutQty(item.goodsId, item.spec, val)"
            />
          </div>
        </div>
      </div>
      <van-empty v-if="!goodsList.length" description="暂无待结算商品" />
    </section>

    <section class="card">
      <van-cell title="支付方式">
        <template #right-icon>
          <van-radio-group v-model="payType" direction="horizontal">
            <van-radio name="微信支付">微信</van-radio>
            <van-radio name="支付宝">支付宝</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
      <van-cell title="商品金额" :value="`¥${checkoutAmount}`" />
      <van-cell title="运费" value="免运费" />
    </section>

    <div class="bar fixed-bottom-bar">
      <div>应付 <span class="price"><em>¥</em>{{ checkoutAmount }}</span></div>
      <van-button type="primary" round :loading="submitting" :disabled="!goodsList.length" @click="submit">
        提交订单
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; padding-bottom: 72px; }
.card { margin: 12px; background: #fff; border-radius: 16px; overflow: hidden; }
.address { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.address strong { display: block; }
.address p { margin: 6px 0 0; color: var(--text-secondary); font-size: 13px; }
.goods { display: grid; grid-template-columns: 72px 1fr; gap: 10px; padding: 12px; }
.goods img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; }
.goods p { color: var(--text-secondary); font-size: 12px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: #fff; box-shadow: 0 -6px 18px rgba(31, 36, 48, 0.06);
}
.bar .van-button { width: 128px; }
@media (min-width: 960px) {
  .page { width: min(860px, calc(100% - 48px)); margin: 0 auto; padding-bottom: 96px; }
  .card { margin: 0 0 16px; }
  .bar { height: 72px; }
  .bar .van-button { width: 180px; }
}
</style>
