const path = require('path')
const Prod = process.env.NODE_ENV === 'production'
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: Prod ? '/xinNuo/' : '/',
  outputDir: '../docs',
  devServer: {
    port: 8081
  },
  // css: {
  //   requireModuleExtension: true,
  //   extract: true,
  //   sourceMap: false,
  //   loaderOptions: {
  //     sass: {
  //       prependData: () => {
  //       }
  //     }
  //   }
  // },
  configureWebpack: {
    // usedExports: true
    optimization: {
      usedExports: true,
      sideEffects: true
    }
  },
  // configureWebpack: config => {
  //
  //   config.usedExports = true
  //   // if (process.env.NODE_ENV === 'production') {
  //   //   // 为生产环境修改配置...
  //   // } else {
  //   //   // 为开发环境修改配置...
  //   // }
  // },
  chainWebpack: config => {
    config.resolve.alias
      .set('@$', resolve('/src'))
      .set('view', resolve('/src/views'))
    config
      .plugin('html')
      .tap(args => {
        args[0].title = '杨昕诺'
        return args
      })
  },
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false
}
