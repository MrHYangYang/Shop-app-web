<script setup>
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { removeAddress, setDefaultAddress, useAddress } from '@/composables/useAddress'

const router = useRouter()
const { addresses } = useAddress()

const onDelete = async (item) => {
  await showConfirmDialog({ title: '删除地址', message: '确定删除该收货地址吗？' })
  removeAddress(item.id)
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="收货地址" left-arrow @click="router.back()" />
    <h2 class="pc-title">收货地址</h2>
    <div v-if="addresses.length" class="list">
      <article v-for="item in addresses" :key="item.id" class="card">
        <div class="info" @click="router.push(`/address/edit/${item.id}`)">
          <strong>{{ item.name }} {{ item.phone }}</strong>
          <p>{{ item.region }}{{ item.detail }}</p>
          <van-tag v-if="item.isDefault" type="primary" plain>默认</van-tag>
        </div>
        <div class="ops">
          <van-button v-if="!item.isDefault" size="mini" @click="setDefaultAddress(item.id)">设为默认</van-button>
          <van-button size="mini" @click="router.push(`/address/edit/${item.id}`)">编辑</van-button>
          <van-button size="mini" @click="onDelete(item)">删除</van-button>
        </div>
      </article>
    </div>
    <van-empty v-else description="暂无收货地址" />
    <div class="bar fixed-bottom-bar">
      <van-button type="primary" round block to="/address/edit">新增收货地址</van-button>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 80px;
}

.list {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
}

.info strong {
  display: block;
}

.info p {
  margin: 8px 0;
  color: #4a5160;
  font-size: 13px;
}

.ops {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #fff;
}

@media (min-width: 960px) {
  .page {
    width: min(860px, calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 100px;
  }

  .list {
    padding: 8px 0 24px;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
