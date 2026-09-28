<script setup>
import { useRouter } from 'vue-router'
import { useGoods } from '@/composables/useGoods'
import GoodsCard from '@/components/GoodsCard.vue'

defineOptions({ name: 'Home' })

const router = useRouter()
const { banners, categories, hotGoods, recommendGoods } = useGoods()

const goSearch = () => router.push('/search')
const goBanner = (item) => router.push({ path: '/goods', query: { tag: item.tag } })
const goCategory = (name) => router.push({ path: '/goods', query: { category: name } })
</script>

<template>
  <div class="home">
    <header class="hero">
      <div class="brand">
        <img src="/favicon.svg" alt="数码优选" />
        <div>
          <strong>数码优选</strong>
          <span>精选数码好物</span>
        </div>
      </div>
      <div class="search" @click="goSearch">
        <van-icon name="search" />
        <span>搜索手机、笔记本、耳机</span>
      </div>
    </header>

    <van-swipe class="banners" :autoplay="3800" indicator-color="#fff">
      <van-swipe-item v-for="item in banners" :key="item.id" @click="goBanner(item)">
        <div class="banner" :class="item.theme">
          <p>{{ item.subtitle }}</p>
          <h2>{{ item.title }}</h2>
          <span>立即选购</span>
        </div>
      </van-swipe-item>
    </van-swipe>

    <section class="cats">
      <button v-for="item in categories" :key="item.name" type="button" @click="goCategory(item.name)">
        <span class="cat-icon" :style="{ background: `${item.color}18` }">
          {{ item.icon }}
        </span>
        <em>{{ item.name }}</em>
      </button>
    </section>

    <section class="block">
      <div class="block-head">
        <h3>热销爆款</h3>
        <router-link to="/goods?tag=hot">更多 <van-icon name="arrow" /></router-link>
      </div>
      <div class="hot-row">
        <router-link v-for="item in hotGoods" :key="item.id" class="hot-item" :to="`/goods/${item.id}`">
          <img :src="item.image" :alt="item.name" />
          <strong>{{ item.name }}</strong>
          <span class="price"><em>¥</em>{{ item.price }}</span>
        </router-link>
      </div>
    </section>

    <section class="block">
      <div class="block-head">
        <h3>为你推荐</h3>
      </div>
      <div class="grid goods-grid">
        <GoodsCard v-for="item in recommendGoods" :key="item.id" :goods="item" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 16px;
}

.hero {
  padding: 18px 16px 12px;
  background: linear-gradient(180deg, #5b7cff 0%, #8b6cf6 48%, #f4f7ff 100%);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.brand img {
  width: 36px;
  height: 36px;
}

.brand strong {
  display: block;
  font-size: 18px;
}

.brand span {
  font-size: 12px;
  opacity: 0.86;
}

.search {
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  color: #98a0b3;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  font-size: 13px;
}

.banners {
  margin: -6px 16px 0;
  border-radius: 16px;
  overflow: hidden;
}

.banner {
  height: 132px;
  padding: 22px 20px;
  color: #fff;
}

.banner.blue {
  background: linear-gradient(135deg, #4d7cff, #6d8dff);
}

.banner.navy {
  background: linear-gradient(135deg, #3347c4, #4d7cff);
}

.banner.purple {
  background: linear-gradient(135deg, #8b6cf6, #b08cff);
}

.banner p {
  margin: 0;
  opacity: 0.9;
  font-size: 13px;
}

.banner h2 {
  margin: 6px 0 14px;
  font-size: 24px;
}

.banner span {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

.cats {
  margin: 16px;
  padding: 14px 8px 8px;
  background: #fff;
  border-radius: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 0;
}

.cats button {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.cats em {
  font-style: normal;
  font-size: 12px;
  color: #3d4454;
}

.block {
  margin: 0 16px 16px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.block-head h3 {
  margin: 0;
  font-size: 16px;
}

.block-head a {
  color: var(--text-secondary);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.hot-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.hot-row::-webkit-scrollbar {
  display: none;
}

.hot-item {
  width: 108px;
  flex: none;
  background: #fff;
  border-radius: 14px;
  padding: 8px;
}

.hot-item img {
  width: 92px;
  height: 92px;
  object-fit: cover;
  border-radius: 10px;
}

.hot-item strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (min-width: 640px) {
  .cats {
    grid-template-columns: repeat(6, 1fr);
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 960px) {
  .home {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto;
    padding: 24px 0 40px;
  }

  .hero {
    display: none;
  }

  .banners {
    margin: 0 0 20px;
  }

  .banner {
    height: 280px;
    padding: 48px 40px;
  }

  .banner h2 {
    font-size: 40px;
  }

  .banner p {
    font-size: 16px;
  }

  .cats {
    margin: 0 0 24px;
    padding: 24px 12px;
    grid-template-columns: repeat(6, 1fr);
  }

  .cat-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .block {
    margin: 0 0 28px;
  }

  .block-head h3 {
    font-size: 20px;
  }

  .hot-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow: visible;
  }

  .hot-item {
    width: auto;
  }

  .hot-item img {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1280px) {
  .hot-row,
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

</style>
