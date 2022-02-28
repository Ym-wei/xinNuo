<template>
  <div>
    <div v-for="(item, index) in login" :key="`${item}_${index}`" @click="handle">
      <p>名称: 阿斯达四大</p>
      <p>职业: {{ item.job }}</p>
    </div>
    <div class="content">
    </div>
  </div>
</template>

<script>
  import { apiGetCommonUse } from '@/api'
  export default {
    name: 'example',
    components: {
    },
    props: {},
    data() {
      return {
        value: '',
        itemList: [
          {
            title: 'First',
            text: 'text',
            url: '#',
            image: 'https://uat.ipipa.cn:9008/commons/file/p6t1foqlhrqpf54f6grf0lr6?mark=1'
          },
          {
            title: 'First',
            text: 'text',
            url: '#',
            image: 'https://uat.ipipa.cn:9008/commons/file/p6t1foqlhrqpf54f6grf0lr6?mark=1'
          },
          {
            title: 'First',
            text: 'text',
            url: '#',
            image: 'https://uat.ipipa.cn:9008/commons/file/p6t1foqlhrqpf54f6grf0lr6?mark=1'
          }
        ],
        login: [
          1, 2, 3, 4, 5, 6, 7, 8
        ]
      }
    },
    created() {
      this.getMock()
    },
    methods: {
      async  getMock() {
        const { data: { result } } = await apiGetCommonUse()
        this.login = result
      },
      handle() {
        this.login.forEach(item => {
          console.log('item :', item)
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  body {
    font-size: 15px;
    color: #aaa;
    height: 100px;
    width: 200px;
    background-color: #fff;
  }

  .content {
    width: 1000px;
    height: 300px;
  }
  div {
    color: #aaa;
  }
</style>
