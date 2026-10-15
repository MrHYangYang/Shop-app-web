<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { register } from '@/composables/useUser'

const router = useRouter()
const loading = ref(false)
const form = reactive({ name: '', phone: '', password: '', confirmPassword: '' })

const onSubmit = async () => {
  if (!form.name) { showToast('请输入昵称'); return }
  if (!/^1\d{10}$/.test(form.phone)) { showToast('请输入正确手机号'); return }
  if (!form.password || form.password.length < 6) { showToast('密码至少六位'); return }
  if (form.password !== form.confirmPassword) { showToast('两次密码不一致'); return }
  loading.value = true
  try {
    await register(form)
    showToast('注册成功，请登录')
    router.replace('/login')
  } catch (e) {
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth">
    <van-nav-bar title="用户注册" left-arrow @click="router.back()" />
    <div class="head">
      <h1>创建账号</h1>
      <p>注册后即可下单购买好物</p>
    </div>
    <van-form @submit="onSubmit">
      <van-field v-model="form.name" label="昵称" placeholder="请输入昵称" />
      <van-field v-model="form.phone" type="tel" maxlength="11" label="手机号" placeholder="请输入手机号" />
      <van-field v-model="form.password" type="password" label="密码" placeholder="至少 6 位密码" />
      <van-field v-model="form.confirmPassword" type="password" label="确认密码" placeholder="请再次输入密码" />
      <div class="actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">注册</van-button>
        <button type="button" class="link" @click="router.push('/login')">已有账号？去登录</button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2ff 0%, #f4f7ff 40%, #fff 100%);
}
.head { padding: 8px 24px 20px; }
h1 { margin: 0 0 8px; font-size: 22px; }
p { margin: 0; color: var(--text-secondary); font-size: 13px; }
.van-form { margin: 0 16px; background: #fff; border-radius: 16px; overflow: hidden; }
.actions { padding: 20px 16px 16px; }
.link {
  width: 100%; margin-top: 12px; border: 0; background: transparent; color: var(--brand-blue);
}
:deep(.van-nav-bar) { background: transparent; }
@media (min-width: 960px) {
  .auth {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: calc(100vh - var(--header-h)); padding: 40px 0;
  }
  .head { width: 440px; padding-left: 0; }
  .van-form { width: 440px; margin: 0; box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08); }
}
</style>
