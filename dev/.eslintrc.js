const INLINE_ELEMENTS = [
  'a',
  'abbr',
  'audio',
  'b',
  'bdi',
  'bdo',
  'canvas',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'i',
  'iframe',
  'ins',
  'kbd',
  'label',
  'map',
  'mark',
  'noscript',
  'object',
  'output',
  'picture',
  'q',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'svg',
  'time',
  'u',
  'var',
  'video',
  'cus'
]

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-essential', '@vue/standard', 'plugin:vue/vue3-recommended'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    jest: true,
    browser: true,
    node: true,
    'vue/setup-compiler-macros': true
  },
  rules: {
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ['TemplateLiteral']
      }
    ],
    'no-void': 0,
    eqeqeq: 0, // 允许双等号
    quotes: [2, 'single'],
    semi: [2, 'never'],
    camelcase: [
      0,
      {
        properties: 'always'
      }
    ],
    'vue/valid-v-model': 'off',
    'vue/no-v-model-argument': 'off',
    'no-unused-expressions': 0,
    'no-case-declarations': 0, // 放开switch case中定义变量
    'no-extra-semi': 2, // 禁止不必要的分号
    'no-console': 'off',
    'arrow-parens': 0, // 当它们只有一个参数时，箭头函数可以省略括号
    'no-new': 0,
    'no-tabs': 'off',
    'space-before-function-paren': 0,
    'no-extend-native': 0,
    'no-trailing-spaces': 0,
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 'off',
    'no-mixed-spaces-and-tabs': 'off', // ['error', 'smart-tabs'] // 不允许使用混合空格和制表符进行缩进
    'template-curly-spacing': 'off',
    // 'no-unused-vars': 'off',
    'vue/multi-word-component-names': 0,
    'vue/no-deprecated-v-bind-sync': 0,
    'vue/html-self-closing': ['error', {
      html: {
        void: 'never',
        normal: 'never',
        component: 'always'
      },
      svg: 'always',
      math: 'always'
    }],
    'vue/order-in-components': [
      'error',
      {
        order: [
          'el',
          'name',
          'parent',
          'functional',
          'extends',
          'mixins',
          'inheritAttrs',
          'model',
          ['provide', 'inject'],
          ['directives', 'components'],
          ['delimiters', 'comments'],
          ['props', 'propsData'],
          'data',
          'computed',
          'filters',
          'watch',
          'setup',
          'LIFECYCLE_HOOKS',
          'methods', ['template', 'render', 'renderPage'],
          'renderError'
        ]
      }
    ],
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          'UNIQUE',
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          'CONTENT'
        ]
      }
    ],
    'vue/html-indent': ['error', 2],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always'
      }
    ],
    'vue/multiline-html-element-content-newline': [
      'error',
      {
        ignoreWhenEmpty: true,
        ignores: ['pre', 'textarea', ...INLINE_ELEMENTS],
        allowEmptyLines: false
      }
    ],
    'vue/script-indent': [
      'error',
      2,
      {
        baseIndent: 1,
        switchCase: 1
      }
    ],
    'vue/no-v-html': 'off'
  },
  overrides: [{
    files: ['*.vue'],
    rules: {
      indent: 'off'
    }
  }]
}
