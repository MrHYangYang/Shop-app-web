import { onMounted, onUnmounted, ref } from 'vue'

const PC_MIN = 960

export function useBreakpoint() {
  const isPc = ref(typeof window !== 'undefined' && window.innerWidth >= PC_MIN)

  const onResize = () => {
    isPc.value = window.innerWidth >= PC_MIN
  }

  onMounted(() => {
    onResize()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return { isPc }
}
