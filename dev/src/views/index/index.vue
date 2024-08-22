<template>
  <div class="wrapper">
    <div class="title">
      <div class="desc"></div>
      训练次数
    </div>
    <div class="wrap">
      <div
        class="btn"
        @click="count--"
      >
        减少
      </div>
      <div
        class="count"
        @click="resetCount"
      >
        {{ count }}
      </div>
      <div
        class="btn add"
        @click="count++"
      >
        增加
      </div>
    </div>
    <div class="title">
      <div class="desc"></div>
      组间休息
    </div>
    <div class="time-tit">
      顺计时
    </div>
    <Timer
      :initial-time="0"
      :countdown="false"
    />
    <div class="time-tit">
      倒计时
    </div>
    <Timer
      :initial-time="countDownTime"
      :countdown="true"
    />
    <div class="count-down-wrap">
      <div
        v-for="item in countDownTimeList"
        :key="item"
        class="item"
        @click="countDownTime = item"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
<script setup>
  import Timer from './components/timer.vue'
  import { ref } from 'vue'

  const count = ref(0)

  const confirmCount = ref(0)
  const resetCount = () => {
    confirmCount.value++
    if (confirmCount.value >= 2) {
      count.value = 0
      confirmCount.value = 0
    }
  }

  const countDownTime = ref(60)

  const countDownTimeList = ref([
    30, 60, 90, 120
  ])
</script>
<style lang="scss" scoped>
.wrapper {
  padding: 20px;
}

.title {
  position: relative;
  font-size: 40px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  margin-bottom: 30px;

  .desc {
    width: 15px;
    height: 40px;
    background: #333333;
    margin-right: 20px;
  }
}

.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;

  .btn {
    width: 150px;
    height: 150px;
    border-radius: 10px;
    background: #f85649;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 50px;
    color: #fff;

    &.add {
      background: #136aea;
    }
  }

  .count {
    width: 300px;
    height: 300px;
    margin: 30px;
    border-radius: 50%;
    border: 6px solid #333333;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 150px;
    font-weight: bold;
  }
}

.time-tit {
  font-size: 40px;
  text-align: center;
  margin: 50px;
  font-weight: bold;
}

.count-down-wrap {
  padding: 30px;
  display: flex;
  justify-content: space-between;

  .item {
    width: 150px;
    height: 150px;
    background: #333333;
    color: #ffffff;
    font-weight: bold;
    font-size: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
  }
}
</style>
