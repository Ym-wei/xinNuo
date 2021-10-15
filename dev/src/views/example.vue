<template>
  <div>
    <div v-for="(item, index) in list" :key="`${item}_${index}`" @click="handle">
      {{ item }}
    </div>
    <div class="content">
    </div>
  </div>
</template>

<script>
  // import { apiGetMenu } from '@/api/common'

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
        list: [
          1, 2, 3, 4, 5, 6, 7, 8
        ]
      }
    },
    created() {
      this.getMock()
    },
    methods: {
      async  getMock() {
        const { data } = await this.$http.post('/user/list', { })
        console.log('data :', data)

        debugger
        // const data = await apiGetMenu()
        // console.log('data :', data)
        // debugger
      },
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

  .content {
    width: 1000px;
    height: 300px;
  }
  div {
    color: #aaa;
  }
</style>
