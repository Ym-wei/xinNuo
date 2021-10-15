const login = {
  url: '/mock/user/info',
  template: {
    status: 200,
    message: 'success',
    data: {
      total: 100,
      'result|3': [
        {
          id: '@guid',
          name: '@cname', // 中文名
          aliasName: '@first()', // 随机英文名
          'age|20-30': 23,
          'job|1': ['前端工程师', '后端工程师', 'UI工程师', '需求工程师'],
          birthday: '@datetime', // 随机时间
          mobile: '@mobile', //
          email: '@email', // 随机email
          address: '@county(true)', // 随机地址
          domicile: '@city(true)', // 随机城市
          'list|5': [
            {
              id: '@guid',
              'job|1': ['前端工程师', '后端工程师', 'UI工程师', '需求工程师'],
              obj: {
                name: '@cname',
                email: '@email'
              }
            }
          ]
        }
      ]
    }
  }
}

const commonUse = {
  url: '/mock/common/use/random',
  template: {
    status: 200,
    message: 'success',
    data: {
      total: 100,
      result: {
        // 返回一个随机的布尔值。
        boolean: '@boolean',
        // 返回一个随机的自然数（大于等于 0 的整数）。
        natural: '@natural(10, 1000)',
        // 返回一个随机的整数。
        integer: '@integer(10, 1000)',
        // 返回一个随机的浮点数。
        float: '@float(10, 1000, 0, 2)',
        // 返回一个整型数组。
        range: '@range(10)',
        // 返回一个随机的日期字符串
        date: '@date',
        // 返回一个随机的日期和时间字符串。
        datetime: '@datetime',
        // 返回当前的日期和时间字符串。
        now: '@now',
        // 生成一个随机的图片地址。
        image: '@image',
        // 随机生成一个有吸引力的颜色，格式为 '#RRGGBB'。
        color: '@color',
        // 随机生成一段文本。
        paragraph: '@cparagraph',
        // 随机生成一句中文标题。
        ctitle: '@ctitle(3, 6)',
        // 随机生成一个常见的中文姓名
        cname: '@cname',
        // 随机生成一个邮件地址。
        email: '@email',
        // 随机生成一个省市区。
        county: '@county',
        // 随机生成一个 GUID。
        guid: '@guid'
      }
    }
  }
}

// 导出两份数据
export default [
  login,
  commonUse
]
