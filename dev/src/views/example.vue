<template>
  <div>
    <div v-for="(item, index) in list" :key="`${item}_${index}`" @click="handle">
      {{ item }}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'example',
    props: {},
    data() {
      return {
        value: '',
        list: [
          1, 2, 3, 4, 5, 6, 7, 8
        ]
      }
    },
    methods: {
      handle() {
        this.list.forEach(item => {
          console.log('item :', item)
        })
      }
    }
  }
</script>

<style lang="scss">
  body {
    font-size: 15px;
    color: #aaa;
    height: 100px;
    width: 200px;
    background-color: #fff;
  }

  div {
    color: #aaa;
  }
</style>
