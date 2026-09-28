<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getAddressById, saveAddress } from '@/composables/useAddress'

const router = useRouter()
const route = useRoute()
const showPicker = ref(false)
const current = getAddressById(route.params.id)
const regions = [
  '上海市黄浦区',
  '杭州市西湖区',
  '成都市锦江区',
  '广州市天河区',
  '深圳市南山区',
  '北京市朝阳区',
]

const form = reactive({
  id: current?.id || '',
  name: current?.name || '',
  phone: current?.phone || '',
  region: current?.region || regions[0],
  detail: current?.detail || '',
  isDefault: current?.isDefault || false,
})

const onConfirm = ({ selectedValues }) => {
  form.region = selectedValues[0]
  showPicker.value = false
}

const onSave = () => {
  if (!form.name.trim()) return showToast('请输入收货人')
  if (!/^1\d{10}$/.test(form.phone)) return showToast('请输入正确手机号')
  if (!form.detail.trim()) return showToast('请输入详细地址')
  saveAddress(form)
  showToast('保存成功')
  router.back()
}
</script>

<template>
  <div class="page">
    <van-nav-bar :title="form.id ? '编辑地址' : '新增地址'" left-arrow @click="router.back()" />
    <h2 class="pc-title">{{ form.id ? '编辑地址' : '新增地址' }}</h2>
    <van-form @submit="onSave">
      <van-field v-model="form.name" label="收货人" placeholder="请输入姓名" />
      <van-field v-model="form.phone" type="tel" maxlength="11" label="手机号" placeholder="请输入手机号" />
      <van-field v-model="form.region" is-link readonly label="所在地区" @click="showPicker = true" />
      <van-field v-model="form.detail" label="详细地址" placeholder="街道、门牌号" />
      <van-cell title="设为默认地址">
        <template #right-icon>
          <van-switch v-model="form.isDefault" size="20" />
        </template>
      </van-cell>
      <div class="save">
        <van-button type="primary" round block native-type="submit">保存</van-button>
      </div>
    </van-form>
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="regions.map((text) => ({ text, value: text }))"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
}

.save {
  padding: 24px 16px;
}

:deep(.van-form) {
  background: #fff;
}

@media (min-width: 960px) {
  .page {
    width: min(640px, calc(100% - 48px));
    margin: 24px auto 40px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08);
  }
}
</style>
