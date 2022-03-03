<script>
  import '@web/chart/lib/theme/src/common/chart.scss'
  import 'echarts-liquidfill'
  import 'swiper/dist/css/swiper.css'
  // 导入组件
  const chartComponent = [
    'line',
    'bar-percentage',
    'liquid-fill',
    'pie',
    'pie-percent',
    'radar',
    'gauge',
    'geo',
    'overview',
    'user',
    'photo',
    'school',
    'table',
    'block',
    'monitor',
    'board',
    'move-percent',
    'scroll-text',
    'info',
    'bubble',
    'track',
    'field',
    'notice-scroll',
    'search-list',
    'show-reel',
    'resource',
    'pie-title',
    'classified-statistics',
    'card-link',
    'banner',
    'announce',
    'scroll-tab',
    'group-table-info',
    'avatar',
    'photo-card',
    'user-info',
    'target',
    'line-g',
    'award',
    'practice',
    'table-g',
    'analysis',
    'message-board',
    'table-list',
    'table-comment',
    'news',
    'resume',
    'photo-wall',
    'accordion',
    'bulletin',
    'synthesize',
    'word-cloud',
    'cover',
    'evaluate',
    'remark',
    'radar-g',
    'course',
    'user-list',
    'photo-type2',
    'photo-info',
    'dislocation',
    'notice',
    'statistics-line',
    'statistics-bar'
  ]
  // 名称转换, 为了兼容命名问题
  const nameTranslation = {
    liquidfill: 'liquid-fill',
    piepercent: 'pie-percent',
    barpercentage: 'bar-percentage',
    movepercent: 'move-percent',
    scrolltext: 'scroll-text',
    photocard: 'photo-card',
    userinfo: 'user-info',
    messageboard: 'message-board',
    showreel: 'show-reel',
    tablelist: 'table-list',
    cardlink: 'card-link',
    noticescroll: 'notice-scroll',
    searchlist: 'search-list',
    classifiedstatistics: 'classified-statistics',
    tablecomment: 'table-comment',
    statisticsline: 'statistics-line',
    statisticsbar: 'statistics-bar',
    wordcloud: 'word-cloud'
  }
  export default {
    name: 'ms-chart',
    props: {
      // 图表类型
      type: { type: String, required: true },
      // 图表数据
      chartsData: {
        type: Array,
        required: true,
        default() {
          return []
        }
      },
      // 主题, 区分不同主题
      theme: { type: String, default: 'default' },
      chartTheme: { type: String, default: '' },
      // 部分图标差异化配置
      config: {
        type: Object,
        default: () => {
          return {}
        }
      },
      // 提示文本
      tipsText: {
        type: String
      },
      tipsTop: {
        type: String
      }
    },
    computed: {
      asyncComponent() {
        return chartComponent.reduce((result, type) => {
          result[type] = () => import(`@web/chart/lib/${type}`)
          return result
        }, {})
      },
      // 兼容图表类型比如很多图表类型用相同组件
      _type() {
        let { type } = this
        const names = {
          ring: 'pie',
          ...nameTranslation
        }
        if (['Bar', 'Bar-Stack', 'Bar-Horizontal', 'Line-Smooth', 'Bar-Colours'].includes(type)) {
          type = 'Line'
        }
        type = type.toLowerCase()
        // type = type.replace(/-/g, '')
        return names[type] || type
      },
      // 兼容旧版样式文件命名问题
      scssFileName() {
        let { type } = this
        type = type.toLowerCase()
        const names = {
          ...nameTranslation
        }
        return names[type] || type
      }
    },
    created() {
      this.asyncImportScss()
    },
    methods: {
      // 异步加载样式文件
      asyncImportScss() {
        const { scssFileName } = this
        const exclude = [
          'liquid-fill', // 水滴1 h5 迁移
          'pie', // 饼图 h5 迁移
          'pie-percent', // 饼图,百分比 -新增11 迁移
          'ring', // 环形图 h5 迁移
          'line', // 折线图 h5   迁移
          'line-smooth', // 折线图-平滑 h5 迁移
          'bar', // 柱状图 h5 迁移
          'bar-stack', // 层叠柱状图     h5 迁移
          'bar-horizontal', // 水平柱状图 / h5 迁移
          'bar-colours', // 彩色柱状图 迁移
          'bar-percentage', // 垂直百分比柱状图  新增 h5 迁移
          'radar', // 雷达图 legend还没调整 h5
          'gauge', // 仪表盘 新增 h5 迁移
          'geo' // 地图 新增 待定
        ]
        if (exclude.includes(scssFileName)) return
        try {
          // eslint-disable-next-line no-unused-expressions
          import(`@web/chart/lib/theme/src/${scssFileName}.scss`)
        } catch (err) {
          console.log(err, 'err ')
        }
      }
    },
    render(h) {
      const { $scopedSlots, asyncComponent, _type } = this
      const thisTypeComponent = asyncComponent[_type] || 'div'
      return h(thisTypeComponent, {
        props: {
          chartsData: this.chartsData,
          type: this.type,
          theme: this.theme,
          chartTheme: this.chartTheme,
          config: this.config,
          tipsText: this.tipsText,
          tipsTop: this.tipsTop
        },
        on: this.$listeners,
        scopedSlots: $scopedSlots
      })
    }
  }
</script>
