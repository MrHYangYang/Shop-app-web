<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { login } from '@/composables/useUser'
import { getCaptcha } from '@/api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const captchaImg = ref('')
const form = reactive({ phone: '', password: '', captchaId: '', captchaCode: '' })

const refreshCaptcha = async () => {
  try {
    const data = await getCaptcha()
    form.captchaId = data.captchaId
    form.captchaCode = ''
    captchaImg.value = data.imageBase64
  } catch (e) { /* handled */ }
}

const onSubmit = async () => {
  if (!/^1\d{10}$/.test(form.phone)) { showToast('请输入正确手机号'); return }
  if (!form.password) { showToast('请输入密码'); return }
  if (!form.captchaCode) { showToast('请输入验证码'); return }
  loading.value = true
  try {
    await login(form)
    showToast('登录成功')
    router.replace(route.query.redirect || '/home')
  } catch (e) {
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(refreshCaptcha)
</script>

<template>
  <div class="auth">
    <van-nav-bar left-arrow @click="router.back()" />
    <div class="head">
      <img src="/favicon.svg" alt="智选好物" />
      <h1>欢迎回来 · 智选好物</h1>
      <p>演示账号 13800000000 / 123456</p>
    </div>
    <van-form @submit="onSubmit">
      <van-field v-model="form.phone" type="tel" maxlength="11" label="手机号" placeholder="请输入手机号" />
      <van-field v-model="form.password" type="password" label="密码" placeholder="请输入登录密码" />
      <van-field v-model="form.captchaCode" maxlength="4" label="验证码" placeholder="请输入验证码">
        <template #button>
          <img v-if="captchaImg" class="captcha" :src="captchaImg" alt="验证码" @click="refreshCaptcha" />
          <van-button v-else size="small" type="primary" plain @click="refreshCaptcha">获取</van-button>
        </template>
      </van-field>
      <div class="actions">
        <van-button data-testid="login-submit" class="login-submit" round block type="primary" native-type="button" :loading="loading" @click="onSubmit">登录</van-button>
        <button type="button" class="link" @click="router.push('/register')">没有账号？去注册</button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2ff 0%, #f4f7ff 40%, #fff 100%);
}
.head { padding: 12px 24px 24px; text-align: center; }
.head img { width: 56px; height: 56px; margin: 0 auto 12px; }
h1 { margin: 0 0 8px; font-size: 22px; }
p { margin: 0; color: var(--text-secondary); font-size: 13px; }
.van-form {
  margin: 0 16px; background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08);
}
.actions { padding: 20px 16px 16px; }
.link {
  width: 100%; margin-top: 12px; border: 0; background: transparent;
  color: var(--brand-blue); font-size: 13px;
}
.captcha { height: 36px; border-radius: 6px; cursor: pointer; }
:deep(.van-nav-bar) { background: transparent; }
@media (min-width: 960px) {
  .auth {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: calc(100vh - var(--header-h)); padding: 40px 0;
  }
  .head { padding-top: 0; }
  h1 { font-size: 28px; }
  .van-form { width: 440px; margin: 0; }
}
</style>
