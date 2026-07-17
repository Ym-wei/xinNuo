<template>
  <div class="wrapper">
    1

    <div @click="jump">跳转</div>
    <div @click="jumpJSON">json</div>
  </div>
</template>
<script setup>
import router from "@/router";

const jump = () => {
  router.push({
    name: 'synopsisList'
  })
}
const jumpJSON = () => {
  router.push({
    name: 'jsonIndex'
  })
}
</script>
<style lang="scss" scoped>

</style>
