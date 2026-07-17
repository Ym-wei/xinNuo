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

// 不再使用外部 CDN，避免 CDN 慢/被墙/版本错配导致白屏
// 所有依赖都走本地打包
// const cdnConfig = {
//   css: [
//     'https://cdn.bootcdn.net/ajax/libs/vant/4.0.10/index.min.css'
//   ],
//   js: [
//     'https://cdn.bootcdn.net/ajax/libs/vue/3.2.31/vue.global.prod.js',
//     'https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.min.js',
//     'https://cdn.bootcdn.net/ajax/libs/vue-router/4.0.10/vue-router.global.prod.min.js',
//     'https://cdn.bootcdn.net/ajax/libs/vant/4.0.10/vant.min.js'
//   ]
// }

module.exports = {
  publicPath: '/xinNuo/',
  outputDir: '../docs',
  // assetsDir: 'static',
  lintOnSave: isDev,
  productionSourceMap: false,
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
      // 生产环境不再注入 CDN；保留 title 配置
      config.plugin('html')
        .tap(args => {
          args[0].title = '杨昕诺'
          return args
        })
      // 不再设置 externals，库都走本地打包
      // config.externals = {
      //   vue: 'Vue',
      //   'vue-router': 'VueRouter',
      //   axios: 'axios',
      //   vant: 'vant'
      // }
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