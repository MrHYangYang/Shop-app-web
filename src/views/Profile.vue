<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { refreshProfile, updateProfile, changePassword, useUser } from '@/composables/useUser'

const router = useRouter()
const goBack = () => {
  if (window.history.state && window.history.state.back != null) router.back()
  else router.replace('/mine')
}
const { user } = useUser()
const form = reactive({ name: '', gender: '保密', avatar: '' })
const pwd = reactive({ oldPassword: '', newPassword: '', confirm: '' })
const save = async () => { await updateProfile(form); showToast('保存成功') }
const savePwd = async () => {
  if (pwd.newPassword !== pwd.confirm) { showToast('两次密码不一致'); return }
  await changePassword(pwd)
  showToast('密码已修改')
  pwd.oldPassword=''; pwd.newPassword=''; pwd.confirm=''
}
onMounted(async () => {
  const p = await refreshProfile()
  if (p) Object.assign(form, { name: p.name || '', gender: p.gender || '保密', avatar: p.avatar || '' })
})
</script>

<template>
  <div class="page">
    <van-nav-bar title="个人资料" left-arrow @click-left="goBack" />
    <h2 class="pc-title">个人资料</h2>
    <div class="avatar">{{ form.name.slice(0, 1) || '优' }}</div>
    <van-form @submit="onSave">
      <van-field v-model="form.name" label="昵称" placeholder="请输入昵称" />
      <van-field v-model="form.phone" label="手机号" readonly />
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="form.gender" direction="horizontal">
            <van-radio name="男">男</van-radio>
            <van-radio name="女">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <div class="save">
        <van-button type="primary" round block native-type="submit">保存资料</van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
}

.avatar {
  width: 72px;
  height: 72px;
  margin: 24px auto 8px;
  border-radius: 50%;
  background: var(--brand-gradient);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 700;
}

.save {
  padding: 24px 16px;
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
