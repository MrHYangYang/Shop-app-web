<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { login } from '@/composables/useUser'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = reactive({
  phone: '13800000000',
  password: '123456',
})

const onSubmit = () => {
  if (!/^1\d{10}$/.test(form.phone)) {
    showToast('请输入正确手机号')
    return
  }
  if (!form.password) {
    showToast('请输入密码')
    return
  }
  loading.value = true
  window.setTimeout(() => {
    const result = login(form)
    loading.value = false
    if (!result.ok) {
      showToast(result.message)
      return
    }
    showToast('登录成功')
    router.replace(route.query.redirect || '/home')
  }, 400)
}
</script>

<template>
  <div class="auth">
    <van-nav-bar left-arrow @click="router.back()" />
    <div class="head">
      <img src="/favicon.svg" alt="数码优选" />
      <h1>欢迎来到数码优选</h1>
      <p>体验账号 13800000000 / 123456</p>
    </div>
    <van-form @submit="onSubmit">
      <van-field v-model="form.phone" type="tel" maxlength="11" label="手机号" placeholder="请输入手机号" />
      <van-field v-model="form.password" type="password" label="密码" placeholder="请输入登录密码" />
      <div class="actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">登录</van-button>
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

.head {
  padding: 12px 24px 24px;
  text-align: center;
}

.head img {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
}

h1 {
  margin: 0 0 8px;
  font-size: 22px;
}

p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.van-form {
  margin: 0 16px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08);
}

.actions {
  padding: 20px 16px 16px;
}

.link {
  width: 100%;
  margin-top: 12px;
  border: 0;
  background: transparent;
  color: var(--brand-blue);
  font-size: 13px;
}

:deep(.van-nav-bar) {
  background: transparent;
}

@media (min-width: 960px) {
  .auth {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-h));
    padding: 40px 0;
  }

  .head {
    padding-top: 0;
  }

  h1 {
    font-size: 28px;
  }

  .van-form {
    width: 440px;
    margin: 0;
  }
}
</style>
