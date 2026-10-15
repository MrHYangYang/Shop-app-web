<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getAddressById, loadAddresses, saveAddress } from '@/composables/useAddress'

const route = useRoute()
const router = useRouter()
const showPicker = ref(false)
const regions = ['北京市朝阳区', '上海市浦东新区', '广州市天河区', '深圳市南山区', '杭州市西湖区', '成都市武侯区', '武汉市洪山区', '南京市鼓楼区']
const form = reactive({ id: null, name: '', phone: '', region: '', detail: '', isDefault: false })

const onConfirm = ({ selectedOptions }) => {
  form.region = selectedOptions?.[0]?.value || selectedOptions?.[0]?.text || ''
  showPicker.value = false
}

const onSave = async () => {
  if (!form.name || !/^1\d{10}$/.test(form.phone) || !form.region || !form.detail) {
    showToast('请完整填写收货信息'); return
  }
  await saveAddress({
    id: form.id,
    name: form.name,
    phone: form.phone,
    region: form.region,
    detail: form.detail,
    isDefault: form.isDefault ? 1 : 0,
  })
  showToast('保存成功')
  router.back()
}

onMounted(async () => {
  await loadAddresses()
  if (route.params.id) {
    const a = getAddressById(route.params.id)
    if (a) {
      Object.assign(form, {
        id: a.id,
        name: a.name,
        phone: a.phone,
        region: a.region,
        detail: a.detail,
        isDefault: a.isDefault === 1 || a.isDefault === true,
      })
    }
  }
})
</script>

<template>
  <div class="page">
    <van-nav-bar :title="form.id ? '编辑地址' : '新增地址'" left-arrow @click="router.back()" />
    <h2 class="pc-title">{{ form.id ? '编辑地址' : '新增地址' }}</h2>
    <van-form @submit="onSave">
      <van-field v-model="form.name" label="收货人" placeholder="请输入姓名" />
      <van-field v-model="form.phone" type="tel" maxlength="11" label="手机号" placeholder="请输入手机号" />
      <van-field v-model="form.region" is-link readonly label="所在地区" placeholder="请选择地区" @click="showPicker = true" />
      <van-field v-model="form.detail" label="详细地址" placeholder="街道楼牌号" />
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
.page { min-height: 100vh; background: #fff; }
.save { padding: 24px 16px; }
:deep(.van-form) { background: #fff; }
@media (min-width: 960px) {
  .page {
    width: min(640px, calc(100% - 48px)); margin: 24px auto 40px; border-radius: 16px;
    overflow: hidden; box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08);
  }
}
</style>
