<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '@/api'
import { getToken } from '@/utils/request'
import { normalizeSearchKeyword } from '@/utils/search'

const router = useRouter()
const keyword = ref('')
const history = ref([])
const hotWords = ['耳机', '笔记本', '华为', '相机', '手表', '键盘']
const loadHistory = async () => {
  if (!getToken()) {
    history.value = JSON.parse(localStorage.getItem('shop-app-search') || '[]')
    return
  }
  try {
    const list = await api.searchHistory({ limit: 8 })
    history.value = (list || []).map((i) => i.keyword).filter(Boolean)
  } catch {
    history.value = JSON.parse(localStorage.getItem('shop-app-search') || '[]')
  }
}
const go = (word) => {
  const value = normalizeSearchKeyword(word || keyword.value)
  if (!value) return
  keyword.value = value
  history.value = [value, ...history.value.filter((item) => item !== value)].slice(0, 8)
  localStorage.setItem('shop-app-search', JSON.stringify(history.value))
  // 模糊搜索：后端按名称/型号/简介/品牌/分类 LIKE 匹配
  router.push({ path: '/goods', query: { keyword: value } })
}
const clearHistory = async () => {
  history.value = []
  localStorage.removeItem('shop-app-search')
  if (getToken()) { try { await api.clearSearch() } catch (e) {} }
}
onMounted(loadHistory)
</script>

<template>
  <div class="search">
    <form class="bar" @submit.prevent="go()">
      <van-search v-model="keyword" show-action placeholder="模糊搜索：名称/品牌/型号" autofocus @search="go()" @cancel="router.back()" />
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
