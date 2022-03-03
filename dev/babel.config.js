module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'import',
      {
        libraryName: '@web/chart',
        libraryDirectory: 'lib',
        customStyleName: name => {
          let isVoid = false
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
          name = name === 'statisticsBar' ? 'StatisticsLine' : name
          if (exclude.includes(name)) isVoid = true
          return `@web/chart/lib/theme/src/${isVoid ? 'void' : name}.scss`
        }
      },
      'webChart'
    ]
  ]
}
