<template>
  <div class="wrapper">
    1

    <div @click="jump">跳转</div>
  </div>
</template>
<script setup>
import router from "@/router";

const jump = () => {
  router.push({
    name: 'synopsisList'
  })
}
</script>
<style lang="scss" scoped>

</style>
