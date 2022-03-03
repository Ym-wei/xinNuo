<template>
  <div>你好{{ obj.name }}</div>
</template>

<script>
  // import { getA } from './utils'
  import { session } from '@ms/shared'

  const obj = {
    name: '杨明'
  }
  export default {
    name: 'shared',
    data() {
      return {
        obj: obj
      }
    },
    created() {
      // getA()
      session.set('121', '12')
    },
    methods: {}
  }
</script>

<style lang="scss">

</style>
