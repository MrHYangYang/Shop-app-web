<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, filterGoods } from '@/composables/useGoods'

defineOptions({ name: 'Category' })

const route = useRoute()
const router = useRouter()
const active = ref(route.query.name || categories[0].name)

const list = computed(() => filterGoods({ category: active.value }))

watch(
  () => route.query.name,
  (name) => {
    if (name) active.value = String(name)
  },
)

const onSelect = (name) => {
  active.value = name
  router.replace({ path: '/category', query: { name } })
}
</script>

<template>
  <div class="category">
    <van-nav-bar title="全部分类" />
    <h2 class="pc-title">{{ active }}</h2>
    <div class="body">
      <aside>
        <button
          v-for="item in categories"
          :key="item.name"
          type="button"
          :class="{ active: active === item.name }"
          @click="onSelect(item.name)"
        >
          {{ item.name }}
        </button>
      </aside>
      <section>
        <h3 class="mobile-heading">{{ active }}</h3>
        <div v-if="list.length" class="list">
          <router-link v-for="item in list" :key="item.id" class="row" :to="`/goods/${item.id}`">
            <img :src="item.image" :alt="item.name" />
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.shopName }}</p>
              <span class="price"><em>¥</em>{{ item.price }}</span>
            </div>
          </router-link>
        </div>
        <van-empty v-else description="该分类暂无商品" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.category {
  min-height: calc(100vh - 50px);
  background: #fff;
}

.body {
  display: grid;
  grid-template-columns: 92px 1fr;
  min-height: calc(100vh - 96px);
}

aside {
  background: #f5f7fb;
}

aside button {
  width: 100%;
  height: 48px;
  border: 0;
  background: transparent;
  color: #667085;
  font-size: 13px;
  position: relative;
}

aside button.active {
  background: #fff;
  color: var(--brand-blue);
  font-weight: 700;
}

aside button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  width: 3px;
  height: 24px;
  border-radius: 999px;
  background: var(--brand-gradient);
}

section {
  padding: 12px 12px 24px;
}

h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.row {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f2f4f8;
}

.row img {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  background: #f3f5fb;
}

.row strong {
  display: block;
  font-size: 14px;
}

.row p {
  margin: 6px 0 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

@media (min-width: 960px) {
  .category {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto 32px;
    min-height: calc(100vh - var(--header-h) - 80px);
    border-radius: 16px;
    overflow: hidden;
  }

  .body {
    grid-template-columns: 1fr;
    min-height: calc(100vh - var(--header-h) - 120px);
  }

  aside {
    display: none;
  }

  .mobile-heading {
    display: none;
  }

  section {
    padding: 20px 24px 32px;
  }

  h3 {
    font-size: 20px;
  }

  .list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
    border: 1px solid #eef1f8;
    border-radius: 14px;
  }

  .row img {
    width: 100%;
    height: 180px;
  }

  .row strong {
    font-size: 16px;
  }
}

@media (min-width: 1280px) {
  .list {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
