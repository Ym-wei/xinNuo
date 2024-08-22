/*
 * @Author: zhongzhixin
 * @Date: 2023-02-06 18:46:44
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-03-22 15:59:52
 */
// const { defineConfig } = require('@vue/cli-service');
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const { VantResolver } = require('unplugin-vue-components/resolvers')
const ComponentsPlugin = require('unplugin-vue-components/webpack')

const resolve = (dir) => path.join(__dirname, dir)
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

const cdnConfig = {
  css: [
    'https://cdn.bootcdn.net/ajax/libs/vant/4.0.10/index.min.css'
  ],
  js: [
    'https://cdn.bootcdn.net/ajax/libs/vue/3.2.31/vue.global.prod.js',
    'https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.min.js',
    'https://cdn.bootcdn.net/ajax/libs/vue-router/4.0.10/vue-router.global.prod.min.js',
    'https://cdn.bootcdn.net/ajax/libs/vant/4.0.10/vant.min.js'
  ]
}

module.exports = {
  publicPath: '/h5/xinNuo/',
  outputDir: '../docs',
  assetsDir: 'static', //  outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: isDev, // eslint 检测
  productionSourceMap: false, // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  css: {
    requireModuleExtension: true
  },
  chainWebpack: (config) => {
    // 生产环境配置
    if (isProd) {
      // 删除预加载
      config.plugins.delete('preload')
      config.plugins.delete('prefetch')
      // 压缩代码
      config.optimization.minimize(true)
      // 分割代码
      config.optimization.splitChunks({
        chunks: 'all'
      })
      config
        .plugin('compression-webpack-plugin')
        .use(
          new CompressionPlugin({
            algorithm: 'gzip',
            threshold: 8192,
            minRatio: 0.8,
            test: /.(html|js|css|map|ttf)$/
          })
        )
        .end()
      // 生产环境注入cdn
      config.plugin('html')
        .tap(args => {
          args[0].cdn = cdnConfig
          args[0].title = '杨昕诺'
          return args
        })
        // 用cdn方式引入
      config.externals = {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        vant: 'vant'
      }
    }
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .tap(options =>
        Object.assign(options, {
          limit: 5 * 1024
        })
      )

    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('api', resolve('src/api'))
      .set('views', resolve('src/views'))
      .set('pc', resolve('src/pc'))
      .set('components', resolve('src/components'))
  },
  configureWebpack: {
    plugins: [
      ComponentsPlugin({
        resolvers: [VantResolver()]
      })
    ]
  }
}
