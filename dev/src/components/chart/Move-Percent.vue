<template>
  <div class="ms-chart-move-percent">
    <div v-for="index in 3" :key="index">
      <div v-if="chartList[index - 1]" class="name">{{ chartList[index - 1] && chartList[index - 1].name }}</div>
      <div v-if="chartList[index - 1]" class="chart-content">
        <EChart
          :ref="`echart_move_${moduleCardRef}_${index - 1}`"
          :options="createOption(chartList[index - 1], index - 1)"
          class="chart-ele"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import chartMixins from '../mixins/mixins'
  export default {
    name: 'ms-chart-move-percent',
    mixins: [chartMixins],
    data() {
      return {
        timer: null,
        // 角度，用来做简单的动画效果的
        angle: 0,
        moduleCardRef: Math.random()
          .toString(36)
          .slice(-8),
        colorList: [
          ['#C654F7', '#44018D'],
          ['#40A6F4', '#074CA1'],
          ['#6DA211', '#25680A']
        ]
      }
    },
    computed: {
      chartList() {
        return this.options || []
      }
    },
    async created() {
      await this.$nextTick()
      this.timer = setInterval(() => {
        this.draw()
      }, 100)
    },
    destroyed() {
      clearInterval(this.timer)
      this.timer = null
    },
    methods: {
      draw() {
        this.angle = this.angle + 3
        for (let i = 0; i < this.chartList.length; i++) {
          const item = this.chartList[i]
          const refs = this.$refs[`echart_move_${this.moduleCardRef}_${i}`]
          refs && refs[0] && refs[0].mergeOptions(this.createOption(item, i), true)
        }
      },
      createOption(item, index) {
        if (!item) return
        const value = item.value
        const option = {
          title: {
            text: '{a|' + value + '}{c|%}',
            x: 'center',
            y: 'center',
            textStyle: {
              rich: {
                a: {
                  fontSize: 16,
                  color: '#fff'
                },

                c: {
                  fontSize: 12,
                  color: '#ffffff'
                }
              }
            }
          },
          series: [
            {
              name: '第一条线',
              type: 'custom',
              coordinateSystem: 'none',
              renderItem: (params, api) => {
                return {
                  type: 'arc',
                  shape: {
                    cx: api.getWidth() / 2,
                    cy: api.getHeight() / 2,
                    r: (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.8,
                    startAngle: ((0 + this.angle) * Math.PI) / 180,
                    endAngle: ((90 + this.angle) * Math.PI) / 180
                  },
                  style: {
                    stroke: this.colorList[index][0],
                    fill: 'transparent',
                    lineWidth: 2
                  },
                  silent: true
                }
              },
              data: [0]
            },
            {
              name: '第二条线',
              type: 'custom',
              coordinateSystem: 'none',
              renderItem: (params, api) => {
                return {
                  type: 'arc',
                  shape: {
                    cx: api.getWidth() / 2,
                    cy: api.getHeight() / 2,
                    r: (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.8,
                    startAngle: ((180 + this.angle) * Math.PI) / 180,
                    endAngle: ((270 + this.angle) * Math.PI) / 180
                  },
                  style: {
                    stroke: this.colorList[index][0],
                    fill: 'transparent',
                    lineWidth: 2
                  },
                  silent: true
                }
              },
              data: [0]
            },
            {
              name: '第三条线',
              type: 'custom',
              coordinateSystem: 'none',
              renderItem: (params, api) => {
                return {
                  type: 'arc',
                  shape: {
                    cx: api.getWidth() / 2,
                    cy: api.getHeight() / 2,
                    r: (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.75,
                    startAngle: ((270 + -this.angle) * Math.PI) / 180,
                    endAngle: ((40 + -this.angle) * Math.PI) / 180
                  },
                  style: {
                    stroke: this.colorList[index][1],
                    fill: 'transparent',
                    lineWidth: 2
                  },
                  silent: true
                }
              },
              data: [0]
            },
            {
              name: '第四条线',
              type: 'custom',
              coordinateSystem: 'none',
              renderItem: (params, api) => {
                return {
                  type: 'arc',
                  shape: {
                    cx: api.getWidth() / 2,
                    cy: api.getHeight() / 2,
                    r: (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.75,
                    startAngle: ((90 + -this.angle) * Math.PI) / 180,
                    endAngle: ((220 + -this.angle) * Math.PI) / 180
                  },
                  style: {
                    stroke: this.colorList[index][1],
                    fill: 'transparent',
                    lineWidth: 2
                  },
                  silent: true
                }
              },
              data: [0]
            },
            {
              name: '内饼图',
              type: 'pie',
              radius: ['65%', '50%'],
              silent: true,
              clockwise: false,
              z: 0,
              zlevel: 0,
              label: {
                normal: {
                  position: 'center'
                }
              },
              data: [
                {
                  value: value,
                  name: '',
                  itemStyle: {
                    normal: {
                      color: {
                        // 完成的圆环的颜色
                        colorStops: [
                          {
                            offset: 0,
                            color: this.colorList[index][0] // 0% 处的颜色
                          },
                          {
                            offset: 1,
                            color: this.colorList[index][1] // 100% 处的颜色
                          }
                        ]
                      }
                    }
                  }
                },
                {
                  value: 100 - value,
                  name: '',
                  label: {
                    normal: {
                      show: false
                    }
                  },
                  itemStyle: {
                    normal: {
                      color: '#173164'
                    }
                  }
                }
              ]
            },
            {
              name: '内容环形',
              type: 'pie',
              radius: ['0%', '45%'],
              silent: true,
              clockwise: false,
              startAngle: 90,
              label: {
                normal: {
                  position: 'center'
                }
              },
              data: [
                {
                  value: value,
                  name: '',
                  itemStyle: {
                    normal: {
                      color: {
                        // 完成的圆环的颜色
                        colorStops: [
                          {
                            offset: 0,
                            color: this.colorList[index][0] // 0% 处的颜色
                          },
                          {
                            offset: 1,
                            color: this.colorList[index][1] // 100% 处的颜色
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
            // {
            //   name: '111',
            //   type: 'gauge',
            //   radius: '65%',
            //   center: ['50%', '50%'],
            //   startAngle: 0,
            //   endAngle: 359.9,
            //   splitNumber: 8,
            //   hoverAnimation: true,
            //   axisTick: {
            //     show: false
            //   },
            //   splitLine: {
            //     length: 60,
            //     lineStyle: {
            //       width: 1,
            //       color: '#1C1835'
            //     }
            //   },
            //   axisLabel: {
            //     show: false
            //   },
            //   pointer: {
            //     show: false
            //   },
            //   axisLine: {
            //     lineStyle: {
            //       opacity: 0
            //     }
            //   },
            //   detail: {
            //     show: false
            //   },
            //   data: [
            //     {
            //       value: 0,
            //       name: ''
            //     }
            //   ]
            // }
          ]
        }
        return option
      }
    }
  }
</script>
