<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { AFTER_SALE_REASONS, availableTypes, createAfterSale, getActiveAfterSale } from '@/composables/useAfterSales'
import { canApplyAfterSale, getOrderById } from '@/composables/useOrders'

const route = useRoute()
const router = useRouter()
const order = computed(() => getOrderById(route.params.orderId))
const types = computed(() => availableTypes(order.value))
const type = ref('')
const reason = ref('')
const description = ref('')
const selected = ref({})
const fileList = ref([])

const reasons = computed(() => AFTER_SALE_REASONS[type.value] || [])

const initSelected = () => {
  const map = {}
  order.value?.goodsList?.forEach((item) => {
    map[`${item.goodsId}-${item.spec}`] = { checked: true, qty: item.qty }
  })
  selected.value = map
}

watch(
  order,
  (item) => {
    if (!item) return
    const active = getActiveAfterSale(item.id)
    if (active) {
      router.replace(`/after-sales/${active.id}`)
      return
    }
    if (!canApplyAfterSale(item)) {
      showToast('当前订单不可申请售后')
      router.replace(`/orders/${item.id}`)
      return
    }
    type.value = types.value[0] || '仅退款'
    reason.value = ''
    description.value = ''
    fileList.value = []
    initSelected()
  },
  { immediate: true },
)

watch(type, () => {
  reason.value = ''
})

const selectedGoods = computed(() => {
  if (!order.value) return []
  return order.value.goodsList
    .filter((item) => selected.value[`${item.goodsId}-${item.spec}`]?.checked)
    .map((item) => ({
      ...item,
      qty: selected.value[`${item.goodsId}-${item.spec}`]?.qty || item.qty,
    }))
})

const refundAmount = computed(() => {
  if (type.value === '换货') return 0
  return selectedGoods.value.reduce((sum, item) => sum + item.price * item.qty, 0)
})

const toggleGoods = (item, checked) => {
  const key = `${item.goodsId}-${item.spec}`
  selected.value[key] = {
    ...(selected.value[key] || { qty: item.qty }),
    checked,
  }
}

const changeQty = (item, qty) => {
  const key = `${item.goodsId}-${item.spec}`
  selected.value[key] = {
    ...(selected.value[key] || { checked: true }),
    qty: Math.max(1, Math.min(item.qty, Number(qty) || 1)),
  }
}

const afterRead = (file) => {
  const items = Array.isArray(file) ? file : [file]
  items.forEach((item) => {
    if (!item.file) return
    item.status = 'uploading'
    const reader = new FileReader()
    reader.onload = () => {
      item.content = reader.result
      item.url = reader.result
      item.status = 'done'
    }
    reader.onerror = () => {
      item.status = 'failed'
      item.message = '上传失败'
    }
    reader.readAsDataURL(item.file)
  })
}

const onOversize = () => {
  showToast('单张图片不能超过 2MB')
}

const submit = () => {
  const result = createAfterSale({
    orderId: order.value.id,
    type: type.value,
    reason: reason.value,
    description: description.value,
    goodsList: selectedGoods.value,
    images: fileList.value.map((item) => item.url || item.content).filter(Boolean),
  })
  if (!result.ok) {
    showToast(result.message)
    return
  }
  showToast('售后申请已提交')
  router.replace(`/after-sales/${result.ticket.id}`)
}
</script>

<template>
  <div v-if="order" class="page">
    <van-nav-bar title="申请售后" left-arrow @click="router.back()" />
    <h2 class="pc-title">申请售后</h2>

    <section class="card">
      <h3>售后商品</h3>
      <div v-for="item in order.goodsList" :key="`${item.goodsId}-${item.spec}`" class="goods">
        <van-checkbox
          :model-value="Boolean(selected[`${item.goodsId}-${item.spec}`]?.checked)"
          @update:model-value="(val) => toggleGoods(item, val)"
        />
        <img :src="item.image" :alt="item.name" />
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.spec }} · 最多 {{ item.qty }} 件</p>
          <van-stepper
            :model-value="selected[`${item.goodsId}-${item.spec}`]?.qty || item.qty"
            min="1"
            :max="item.qty"
            :disabled="!selected[`${item.goodsId}-${item.spec}`]?.checked"
            @change="(val) => changeQty(item, val)"
          />
        </div>
        <span class="price"><em>¥</em>{{ item.price }}</span>
      </div>
    </section>

    <section class="card">
      <h3>售后类型</h3>
      <van-radio-group v-model="type" direction="horizontal">
        <van-radio v-for="item in types" :key="item" :name="item">{{ item }}</van-radio>
      </van-radio-group>
    </section>

    <section class="card">
      <h3>售后原因</h3>
      <div class="reasons">
        <button
          v-for="item in reasons"
          :key="item"
          type="button"
          :class="{ active: reason === item }"
          @click="reason = item"
        >
          {{ item }}
        </button>
      </div>
      <van-field
        v-model="description"
        rows="3"
        autosize
        type="textarea"
        maxlength="120"
        show-word-limit
        placeholder="补充说明（选填）"
      />
    </section>

    <section class="card">
      <h3>凭证图片</h3>
      <p class="tip">最多上传 6 张，单张不超过 2MB</p>
      <van-uploader
        v-model="fileList"
        multiple
        accept="image/*"
        :max-count="6"
        :max-size="2 * 1024 * 1024"
        :after-read="afterRead"
        @oversize="onOversize"
      />
    </section>

    <section class="card summary">
      <van-cell title="订单号" :value="order.orderNo" />
      <van-cell v-if="type !== '换货'" title="预计退款" :value="`¥${refundAmount}`" />
      <van-cell v-else title="处理方式" value="审核通过后寄回换货" />
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button type="primary" round block :disabled="!selectedGoods.length" @click="submit">
        提交申请
      </van-button>
    </div>
  </div>
  <van-empty v-else description="订单不存在">
    <van-button round type="primary" size="small" to="/orders">返回订单</van-button>
  </van-empty>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 80px;
}

.card {
  margin: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 16px;
}

h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.goods {
  display: grid;
  grid-template-columns: auto 64px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
}

.goods img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.goods p {
  margin: 6px 0 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.reasons button {
  border: 0;
  background: #f4f7ff;
  border-radius: 999px;
  padding: 6px 12px;
  color: #3d4454;
}

.reasons button.active {
  background: #e8eeff;
  color: var(--brand-blue);
  font-weight: 700;
}

.tip {
  margin: -4px 0 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

.summary :deep(.van-cell) {
  padding-left: 0;
  padding-right: 0;
}

.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6px 18px rgba(31, 36, 48, 0.06);
}

@media (min-width: 960px) {
  .page {
    width: min(860px, calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 96px;
  }

  .card {
    margin: 16px 0 0;
    padding: 20px;
  }

  .bar {
    height: 72px;
    display: flex;
    align-items: center;
  }
}
</style>
