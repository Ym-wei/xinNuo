<template>
  <div>
    <div
      class="wrap"
      @click="resetTimer"
    >
      <div class="time">
        {{ T.minutes }}
      </div>
      <div class="time">
        {{ T.seconds }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onUnmounted, watch } from 'vue'

  const props = defineProps({
    initialTime: {
      type: Number,
      default: 0 // 初始时间，单位为秒
    },
    countdown: {
      type: Boolean,
      default: false // 如果为 true，则倒计时；如果为 false，则正计时
    }
  })

  const time = ref(props.initialTime)
  const timer = ref(null)

  const T = computed(() => {
    const minutes = Math.floor((time.value % 3600) / 60).toString().padStart(2, '0')
    const seconds = (time.value % 60).toString().padStart(2, '0')
    return {
      minutes,
      seconds
    }
  })

  const startTimer = () => {
    if (timer.value) return
    timer.value = setInterval(() => {
      if (props.countdown) {
        if (time.value > 0) {
          time.value--
        } else {
          pauseTimer()
        }
      } else {
        time.value++
      }
    }, 1000)
  }

  const pauseTimer = () => {
    clearInterval(timer.value)
    timer.value = null
  }

  const resetTimer = () => {
    if (props.initialTime === time.value) {
      startTimer()
    } else {
      pauseTimer()
      time.value = props.initialTime
    }
  }

  onUnmounted(() => {
    pauseTimer()
  })

  watch(
    () => props.initialTime,
    (value) => {
      pauseTimer()
      time.value = value
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
.wrap {
 display: flex;
  justify-content: center;
  align-items: center;

  .time {
    width: 250px;
    height: 250px;
    font-size: 150px;
    border: 6px solid #333;
    margin: 0 20px;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
