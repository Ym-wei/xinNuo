/*
 * @Author: zhongzhixin
 * @Date: 2023-02-06 18:55:49
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-02-09 16:23:56
 */
module.exports = ({ file }) => {
  const isVant = file && file.dirname && file.dirname.indexOf('vant') > -1
  return {
    plugins: {
      // to edit target browsers: use "browserslist" field in package.json
      autoprefixer: {}, // 自动添加前缀
      'postcss-px-to-viewport': {
        unitToConvert: 'px', // 需要转换的单位，默认为"px"
        viewportWidth: isVant ? 375 : 750, // 设计稿的视口宽度，一般是375左右，iphone和很多安卓机等机型都差不多，ipad除外。如果是viewportWidth是375，font-size：14，那么font-size会转换为3.73333vm，计算过程：14÷375×100=3.73333
        unitPrecision: 6, // 单位转换后保留的精度
        propList: ['*'], // 能转化为vw的属性列表
        viewportUnit: 'vw', // 希望使用的视口单位
        fontViewportUnit: 'vw', // 字体使用的视口单位
        selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
        minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
        mediaQuery: true, // 媒体查询里的单位是否需要转换单位
        replace: true, // 是否直接更换属性值，而不添加备用属性
        exclude: [/node_modules/, /pc/], // 忽略某些文件夹下的文件或特定文件
        // include: undefined, //如果设置了include，那将只有匹配到的文件才会被转换
        landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
        landscapeUnit: 'vw', // 横屏时使用的单位
        landscapeWidth: 1338 // 横屏时使用的视口宽度
      }
    }
  }
}
