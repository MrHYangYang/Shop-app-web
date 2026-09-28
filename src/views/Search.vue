<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const history = ref(JSON.parse(localStorage.getItem('shop-app-search') || '[]'))
const hotWords = ['耳机', '笔记本', '华为', '相机', '手表', '键盘']

const persist = () => {
  localStorage.setItem('shop-app-search', JSON.stringify(history.value.slice(0, 8)))
}

const go = (word) => {
  const value = (word || keyword.value).trim()
  if (!value) return
  history.value = [value, ...history.value.filter((item) => item !== value)].slice(0, 8)
  persist()
  router.push({ path: '/goods', query: { keyword: value } })
}

const clearHistory = () => {
  history.value = []
  persist()
}
</script>

<template>
  <div class="search">
    <form class="bar" @submit.prevent="go()">
      <van-search v-model="keyword" show-action placeholder="搜索数码好物" autofocus @search="go()" @cancel="router.back()" />
    </form>
    <section v-if="history.length">
      <div class="head">
        <h3>历史搜索</h3>
        <van-icon name="delete-o" @click="clearHistory" />
      </div>
      <div class="tags">
        <button v-for="item in history" :key="item" type="button" @click="go(item)">{{ item }}</button>
      </div>
    </section>
    <section>
      <div class="head"><h3>热门搜索</h3></div>
      <div class="tags">
        <button v-for="item in hotWords" :key="item" type="button" @click="go(item)">{{ item }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.search {
  min-height: 100vh;
  background: #fff;
}

section {
  padding: 8px 16px 0;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h3 {
  margin: 0;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0;
}

.tags button {
  border: 0;
  background: #f4f7ff;
  color: #4a5160;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
}

@media (min-width: 960px) {
  .search {
    width: min(800px, calc(100% - 48px));
    margin: 24px auto 40px;
    min-height: auto;
    border-radius: 16px;
    padding-bottom: 24px;
    box-shadow: 0 12px 32px rgba(77, 124, 255, 0.08);
  }

  section {
    padding: 8px 24px 0;
  }
}
</style>
