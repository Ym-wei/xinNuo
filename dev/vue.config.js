const path = require('path')
const Prod = process.env.NODE_ENV === 'production'
function resolve(dir) {
  return path.join(__dirname, dir)
}

console.log('Prod :', Prod)
module.exports = {
  publicPath: Prod ? '/xinNuo/' : '/',
  outputDir: '../docs',
  devServer: {
    port: 8081
  },
  css: {
    requireModuleExtension: true,
    extract: true,
    sourceMap: false,
    loaderOptions: {
      sass: {
        prependData: () => {
        }
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@$', resolve('/src'))
      .set('view', resolve('/src/views'))
  },
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false
}
