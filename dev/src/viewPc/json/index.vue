<template>
  <div class="json-tool" :class="{ 'is-split': columnCount >= 2, 'is-triple': columnCount === 3 }">
    <!-- ========== 顶部标题栏 ========== -->
    <div class="tool-header">
      <div class="header-left">
        <h1 class="header-title">JSON 美化工具</h1>
        <!-- 全局搜索：同时作用于单栏 / 双栏 / 三栏所有面板 -->
        <div class="header-search">
          <span class="search-icon">🔍</span>
          <input
            ref="searchInputRef"
            v-model="globalSearch"
            type="text"
            class="search-input"
            placeholder="搜索 key 或 value…（全局生效）"
            @keydown.enter="gotoNextMatch"
            @keydown.shift.enter="gotoPrevMatch"
          />
          <!-- 命中计数器 + 上下定位按钮 -->
          <span v-if="globalSearch" class="search-meta">
            <span class="search-position" :title="`共 ${totalMatchCount} 个匹配`">
              {{ globalCurrentIndex > 0 ? globalCurrentIndex : 0 }} / {{ totalMatchCount }}
            </span>
            <button
              class="search-nav"
              :disabled="totalMatchCount === 0"
              title="上一个 (Shift+Enter)"
              @click="gotoPrevMatch"
            >↑</button>
            <button
              class="search-nav"
              :disabled="totalMatchCount === 0"
              title="下一个 (Enter)"
              @click="gotoNextMatch"
            >↓</button>
            <button class="search-clear" @click="globalSearch = ''" title="清空搜索">✕</button>
          </span>
        </div>
      </div>
      <div class="header-actions">
        <div class="column-switch">
          <button
            class="action-btn"
            :class="{ active: columnCount === 1 }"
            @click="setColumnCount(1)"
          >单栏</button>
          <button
            class="action-btn"
            :class="{ active: columnCount === 2 }"
            @click="setColumnCount(2)"
          >双栏</button>
          <button
            class="action-btn"
            :class="{ active: columnCount === 3 }"
            @click="setColumnCount(3)"
          >三栏</button>
        </div>
        <button
          class="action-btn"
          :class="{ active: showHistory }"
          @click="toggleHistory"
        >
          <span class="action-icon">📋</span>
          <span>历史记录</span>
          <span v-if="historyList.length" class="badge">{{ historyList.length }}</span>
        </button>
      </div>
    </div>

    <!-- ========== 主内容区域 ========== -->
    <div class="tool-body">
      <!-- ===== 历史记录面板 ===== -->
      <Transition name="slide">
        <div v-if="showHistory" class="history-panel">
          <div class="panel-card">
            <div class="panel-card-header">
              <h2>📋 历史记录</h2>
              <div class="panel-card-actions">
                <button class="btn btn-danger btn-sm" @click="clearHistory">清空全部</button>
                <button class="btn btn-secondary btn-sm" @click="showHistory = false">关闭</button>
              </div>
            </div>
            <div class="history-list">
              <div
                v-for="(item, index) in reversedHistory"
                :key="item.id"
                class="history-item"
                @click="loadFromHistory(item)"
              >
                <div class="history-item-left">
                  <span class="history-index">#{{ historyList.length - index }}</span>
                  <span class="history-time">{{ item.time }}</span>
                </div>
                <div class="history-preview" :title="item.content">{{ item.preview }}</div>
                <button class="history-delete" @click.stop="deleteHistoryItem(item.id)" title="删除">✕</button>
              </div>
              <div v-if="historyList.length === 0" class="history-empty">
                <div class="empty-icon">📭</div>
                <p>暂无历史记录</p>
                <p class="empty-hint">美化 JSON 后会自动添加</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ===== 单栏模式 ===== -->
      <template v-if="!showHistory && columnCount === 1">
        <!-- 输入面板 -->
        <div v-show="!inputHidden" class="input-section">
          <div class="panel-card">
            <div class="panel-card-header">
              <h2>✏️ 输入 JSON</h2>
              <div class="panel-card-actions">
                <span class="char-count">{{ jsonInput.length }} 字符</span>
              </div>
            </div>
            <textarea
              v-model="jsonInput"
              class="json-input"
              placeholder='在此粘贴 JSON 字符串，例如：&#10;{&#10;  "name": "张三",&#10;  "age": 25&#10;}'
              spellcheck="false"
            ></textarea>
            <div class="input-actions">
              <button class="btn btn-primary" @click="formatJson"><span>✨</span> 美化</button>
              <button class="btn btn-secondary" @click="compressJson"><span>📦</span> 压缩</button>
              <button class="btn btn-outline" @click="clearInput"><span>🗑️</span> 清空</button>
            </div>
          </div>
        </div>

        <!-- 输出面板 -->
        <div v-if="parsedJson" class="output-section">
          <div class="panel-card">
            <div class="panel-card-header">
              <h2>
                📄 美化结果
                <span v-if="globalSearch" class="match-badge" :title="`${singleSearchCount} 个匹配`">
                  {{ singleSearchCount }} 匹配
                </span>
              </h2>
              <div class="panel-card-actions">
                <button v-if="inputHidden" class="btn btn-outline btn-sm" @click="inputHidden = false">↩ 还原输入</button>
                <button class="btn btn-success btn-sm" @click="copyResult">📋 复制</button>
                <button class="btn btn-secondary btn-sm" @click="toggleAllNodes">
                  {{ allCollapsed ? '📂 全部展开' : '📂 全部折叠' }}
                </button>
              </div>
            </div>
            <div class="json-tree-wrapper">
              <vue-json-pretty
                :key="`single-${treeRevision}`"
                :data="parsedJson"
                :deep="allCollapsed ? 0 : 99"
                :show-line="false"
                :show-icon="true"
                :show-double-quotes="true"
                :highlight-mouseover-node="true"
                :selectable-type="true"
                :collapsed-on-click-branch="true"
                :render-node-key="singleRenderKey"
                :render-node-value="singleRenderValue"
                class="json-tree"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- ===== 多栏模式：双栏/三栏共用 ===== -->
      <template v-if="!showHistory && columnCount >= 2">
        <div
          class="split-panels"
          ref="splitContainerRef"
          @mousemove="onSplitResize"
          @mouseup="stopSplitResize"
          @mouseleave="stopSplitResize"
        >
          <!-- 左侧面板 -->
          <div class="split-pane" :style="{ width: leftPaneStyle }">
            <div class="pane-header">
              <span class="pane-label">
                📄 左侧 · 美化结果
                <span v-if="globalSearch" class="match-badge" :title="`左侧 ${leftSearchCount} 个匹配`">
                  {{ leftSearchCount }}
                </span>
              </span>
              <div class="pane-header-actions">
                <button v-if="leftInputHidden" class="btn btn-outline btn-xs" @click="leftInputHidden = false">↩ 还原</button>
                <button v-if="leftParsedJson" class="btn btn-success btn-xs" @click="copyLeftResult">📋 复制</button>
                <button v-if="leftParsedJson" class="btn btn-secondary btn-xs" @click="toggleLeftCollapse">
                  {{ leftCollapsed ? '📂 全部展开' : '📂 全部折叠' }}
                </button>
              </div>
            </div>
            <textarea
              v-show="!leftInputHidden"
              v-model="leftInput"
              class="pane-input"
              placeholder='粘贴 JSON… 例如：{"name":"张三"}'
              spellcheck="false"
            ></textarea>
            <div class="pane-actions">
              <button class="btn btn-primary btn-sm" @click="formatLeft">✨ 美化</button>
              <button class="btn btn-outline btn-sm" @click="clearLeft">🗑️ 清空</button>
            </div>
            <div class="pane-tree-area">
              <div v-if="leftParsedJson" class="pane-tree-scroll">
                <vue-json-pretty
                  :key="`left-${leftTreeRevision}`"
                  :data="leftParsedJson"
                  :deep="leftCollapsed ? 0 : 99"
                  :show-line="false"
                  :show-icon="true"
                  :show-double-quotes="true"
                  :highlight-mouseover-node="true"
                  :selectable-type="true"
                  :collapsed-on-click-branch="true"
                  :render-node-key="leftRenderKey"
                  :render-node-value="leftRenderValue"
                  class="json-tree"
                />
              </div>
              <div v-else class="pane-empty">
                <span>粘贴 JSON 后点击 ✨ 美化</span>
              </div>
            </div>
          </div>

          <!-- 拖拽分隔条 1 -->
          <div class="split-divider" @mousedown.prevent="startSplitResize($event, 1)">
            <span class="split-divider-dots">⋮⋮</span>
          </div>

          <!-- 中间面板（仅三栏） -->
          <template v-if="columnCount === 3">
            <div class="split-pane" :style="{ width: middlePaneStyle }">
              <div class="pane-header">
                <span class="pane-label">
                  📄 中间 · 美化结果
                  <span v-if="globalSearch" class="match-badge" :title="`中间 ${middleSearchCount} 个匹配`">
                    {{ middleSearchCount }}
                  </span>
                </span>
                <div class="pane-header-actions">
                  <button v-if="middleInputHidden" class="btn btn-outline btn-xs" @click="middleInputHidden = false">↩ 还原</button>
                  <button v-if="middleParsedJson" class="btn btn-success btn-xs" @click="copyMiddleResult">📋 复制</button>
                  <button v-if="middleParsedJson" class="btn btn-secondary btn-xs" @click="toggleMiddleCollapse">
                    {{ middleCollapsed ? '📂 全部展开' : '📂 全部折叠' }}
                  </button>
                </div>
              </div>
              <textarea
                v-show="!middleInputHidden"
                v-model="middleInput"
                class="pane-input"
                placeholder='粘贴另一个 JSON…'
                spellcheck="false"
              ></textarea>
              <div class="pane-actions">
                <button class="btn btn-primary btn-sm" @click="formatMiddle">✨ 美化</button>
                <button class="btn btn-outline btn-sm" @click="clearMiddle">🗑️ 清空</button>
              </div>
              <div class="pane-tree-area">
                <div v-if="middleParsedJson" class="pane-tree-scroll">
                  <vue-json-pretty
                    :key="`middle-${middleTreeRevision}`"
                    :data="middleParsedJson"
                    :deep="middleCollapsed ? 0 : 99"
                    :show-line="false"
                    :show-icon="true"
                    :show-double-quotes="true"
                    :highlight-mouseover-node="true"
                    :selectable-type="true"
                    :collapsed-on-click-branch="true"
                    :render-node-key="middleRenderKey"
                    :render-node-value="middleRenderValue"
                    class="json-tree"
                  />
                </div>
                <div v-else class="pane-empty">
                  <span>粘贴 JSON 后点击 ✨ 美化</span>
                </div>
              </div>
            </div>

            <!-- 拖拽分隔条 2 -->
            <div class="split-divider" @mousedown.prevent="startSplitResize($event, 2)">
              <span class="split-divider-dots">⋮⋮</span>
            </div>
          </template>

          <!-- 右侧面板 -->
          <div class="split-pane" :style="{ width: rightPaneStyle }">
            <div class="pane-header">
              <span class="pane-label">
                📄 右侧 · 美化结果
                <span v-if="globalSearch" class="match-badge" :title="`右侧 ${rightSearchCount} 个匹配`">
                  {{ rightSearchCount }}
                </span>
              </span>
              <div class="pane-header-actions">
                <button v-if="rightInputHidden" class="btn btn-outline btn-xs" @click="rightInputHidden = false">↩ 还原</button>
                <button v-if="rightParsedJson" class="btn btn-success btn-xs" @click="copyRightResult">📋 复制</button>
                <button v-if="rightParsedJson" class="btn btn-secondary btn-xs" @click="toggleRightCollapse">
                  {{ rightCollapsed ? '📂 全部展开' : '📂 全部折叠' }}
                </button>
              </div>
            </div>
            <textarea
              v-show="!rightInputHidden"
              v-model="rightInput"
              class="pane-input"
              placeholder='粘贴另一个 JSON…'
              spellcheck="false"
            ></textarea>
            <div class="pane-actions">
              <button class="btn btn-primary btn-sm" @click="formatRight">✨ 美化</button>
              <button class="btn btn-outline btn-sm" @click="clearRight">🗑️ 清空</button>
            </div>
            <div class="pane-tree-area">
              <div v-if="rightParsedJson" class="pane-tree-scroll">
                <vue-json-pretty
                  :key="`right-${rightTreeRevision}`"
                  :data="rightParsedJson"
                  :deep="rightCollapsed ? 0 : 99"
                  :show-line="false"
                  :show-icon="true"
                  :show-double-quotes="true"
                  :highlight-mouseover-node="true"
                  :selectable-type="true"
                  :collapsed-on-click-branch="true"
                  :render-node-key="rightRenderKey"
                  :render-node-value="rightRenderValue"
                  class="json-tree"
                />
              </div>
              <div v-else class="pane-empty">
                <span>粘贴 JSON 后点击 ✨ 美化</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 错误提示 -->
    <Transition name="fade">
      <div v-if="errorMsg" class="error-toast">
        <span class="error-icon">⚠️</span>
        <span>{{ errorMsg }}</span>
        <button class="error-close" @click="errorMsg = ''">✕</button>
      </div>
    </Transition>

    <!-- 复制成功提示 -->
    <Transition name="fade">
      <div v-if="copySuccess" class="copy-toast">✅ 已复制到剪贴板</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, h } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

// ============ 搜索辅助函数 ============
// vue-json-pretty@2.6.0 没有内置 :search 搜索功能（v2.7+ 才有）。
// 这里利用 renderNodeKey / renderNodeValue 把 key/value 文本拆成
// 普通文本段 + 高亮 <mark class="search-match"> 段，返回 VNode 数组。
//
// 同时通过一个外部 getter 拿到当前关键词（不直接捕获 ref，使
// ref 变化时 renderNodeKey 回调被 Vue 重新调用，触发正确高亮）。

/**
 * 把 text 拆成 [{ type: 'text', value } | { type: 'mark', value }]
 * keyword 为空时返回 null，让 render 函数直接返回原 defaultKey/defaultValue（性能更好）
 */
function splitHighlight(text, keyword) {
  if (!text) return null
  if (!keyword) return null
  const lower = String(text).toLowerCase()
  const kw = String(keyword).toLowerCase()
  if (!kw) return null
  const parts = []
  let i = 0
  while (i < text.length) {
    const idx = lower.indexOf(kw, i)
    if (idx === -1) {
      parts.push({ type: 'text', value: text.slice(i) })
      break
    }
    if (idx > i) parts.push({ type: 'text', value: text.slice(i, idx) })
    parts.push({ type: 'mark', value: text.slice(idx, idx + kw.length) })
    i = idx + kw.length
  }
  // 没有命中时直接返回原文本
  if (!parts.some(p => p.type === 'mark')) return null
  return parts
}

function renderHighlighted(text, keyword) {
  const parts = splitHighlight(text, keyword)
  if (!parts) return text
  return parts.map((p, idx) =>
    p.type === 'mark'
      ? h('mark', { class: 'search-match', key: `m${idx}` }, p.value)
      : p.value
  )
}

/**
 * 统计整个 JSON 中 key 与 value 的命中总数（不区分大小写）。
 * Vue 渲染回调对每个节点调用一次，通过这个外部函数累计。
 */
function countMatchesInData(data, keyword) {
  if (!keyword || !data) return 0
  const kw = String(keyword).toLowerCase()
  if (!kw) return 0
  let count = 0
  const lower = (v) => (v === null || v === undefined ? '' : String(v).toLowerCase())
  const kwCount = (v) => {
    const s = lower(v)
    if (!s) return 0
    let n = 0, i = 0
    while ((i = s.indexOf(kw, i)) !== -1) { n++; i += kw.length }
    return n
  }
  const walk = (node) => {
    if (Array.isArray(node)) {
      node.forEach(walk)
    } else if (node !== null && typeof node === 'object') {
      Object.entries(node).forEach(([k, v]) => {
        count += kwCount(k)
        walk(v)
      })
    } else {
      // 叶子（string / number / boolean / null）
      // 注意：null/undefined 的显示文字是 'null'/'undefined'（来自 vue-json-pretty 内部）
      if (node === null) { count += kwCount('null'); return }
      if (node === undefined) { count += kwCount('undefined'); return }
      count += kwCount(typeof node === 'string' ? `"${node}"` : node)
    }
  }
  walk(data)
  return count
}

// 4 个面板各有一组独立 ref。这里把 render 函数都做成
// 「computed，每次关键词变化都会返回一个新的函数引用」，
// 这样 Vue 检测到 prop 变化会触发子组件重渲染，从而调用 renderNodeKey / renderNodeValue。

/**
 * 工厂：返回一个 computed ref，getter 拿到当前关键词后返回真正的 render 函数。
 * 关键：computed 只在依赖变化时才会生成新函数，否则返回同一个引用，
 * 避免 vue-json-pretty 每次输入都重新 mount 子树。
 */
const makeKeyRendererRef = (kwRef) => computed(() => {
  const kw = kwRef.value
  return ({ defaultKey }) => renderHighlighted(defaultKey, kw)
})

const makeValueRendererRef = (kwRef) => computed(() => {
  const kw = kwRef.value
  return ({ defaultValue }) => renderHighlighted(defaultValue, kw)
})

// ============ 单栏状态 ============
const jsonInput = ref('')
const parsedJson = ref(null)
const allCollapsed = ref(false)
const treeRevision = ref(0) // 用于强制 vue-json-pretty 重渲染
const inputHidden = ref(false) // 点击美化后自动隐藏输入区

// ============ 全局搜索（作用于所有面板） ============
const globalSearch = ref('')
// 单栏命中数（computed：通过递归遍历 parsedJson 统计）
const singleSearchCount = computed(() => countMatchesInData(parsedJson.value, globalSearch.value))
// 单栏 renderNodeKey / renderNodeValue：computed，关键词变化即重算
const singleRenderKey = makeKeyRendererRef(globalSearch)
const singleRenderValue = makeValueRendererRef(globalSearch)

// ============ 双栏状态 ============
const leftInput = ref('')
const leftParsedJson = ref(null)
const leftCollapsed = ref(false)
const leftTreeRevision = ref(0)
const leftInputHidden = ref(false)
const leftSearchCount = computed(() => countMatchesInData(leftParsedJson.value, globalSearch.value))
const leftRenderKey = makeKeyRendererRef(globalSearch)
const leftRenderValue = makeValueRendererRef(globalSearch)

const middleInput = ref('')
const middleParsedJson = ref(null)
const middleCollapsed = ref(false)
const middleTreeRevision = ref(0)
const middleInputHidden = ref(false)
const middleSearchCount = computed(() => countMatchesInData(middleParsedJson.value, globalSearch.value))
const middleRenderKey = makeKeyRendererRef(globalSearch)
const middleRenderValue = makeValueRendererRef(globalSearch)

const rightInput = ref('')
const rightParsedJson = ref(null)
const rightCollapsed = ref(false)
const rightTreeRevision = ref(0)
const rightInputHidden = ref(false)
const rightSearchCount = computed(() => countMatchesInData(rightParsedJson.value, globalSearch.value))
const rightRenderKey = makeKeyRendererRef(globalSearch)
const rightRenderValue = makeValueRendererRef(globalSearch)

// ============ 全局搜索：上下定位 ============
// 所有可见面板里 <mark class="search-match"> 的 DOM 引用数组（按 DOM 顺序排列）
const matchElements = ref([])
// 当前激活的匹配项（1-based，0 表示未选中）
const globalCurrentIndex = ref(0)

// 全局总命中数（4 个面板累加）
const totalMatchCount = computed(() =>
  singleSearchCount.value + leftSearchCount.value + middleSearchCount.value + rightSearchCount.value
)

// 收集当前可见的所有 <mark class="search-match"> 元素，按 DOM 顺序
function collectMatchElements() {
  const els = []
  const wrappers = document.querySelectorAll('.json-tree-wrapper')
  wrappers.forEach(w => {
    w.querySelectorAll('mark.search-match').forEach(m => els.push(m))
  })
  matchElements.value = els
  // 给每个元素打上全局序号
  els.forEach((el, i) => el.setAttribute('data-match-index', String(i + 1)))
  // 如果当前激活位置超出范围，重置
  if (globalCurrentIndex.value > els.length) {
    globalCurrentIndex.value = els.length > 0 ? 1 : 0
  } else if (globalCurrentIndex.value === 0 && els.length > 0) {
    // 首次出现匹配，默认选中第一个
    globalCurrentIndex.value = 1
  }
  // 同步高亮
  highlightCurrentMatch()
}

// 把当前激活的 mark 加上 .search-current 类，其他移除
function highlightCurrentMatch() {
  matchElements.value.forEach((el, i) => {
    if (i + 1 === globalCurrentIndex.value) el.classList.add('search-current')
    else el.classList.remove('search-current')
  })
}

// 滚动到当前激活的 match（带一点偏移让上下文可见）
function scrollToCurrent() {
  const idx = globalCurrentIndex.value
  if (idx <= 0 || idx > matchElements.value.length) return
  const el = matchElements.value[idx - 1]
  if (!el) return
  // 找最近的滚动容器（pane 或 tree-wrapper），用 scrollIntoView
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// 下一个匹配
function gotoNextMatch() {
  const total = matchElements.value.length
  if (total === 0) return
  globalCurrentIndex.value = globalCurrentIndex.value >= total ? 1 : globalCurrentIndex.value + 1
  highlightCurrentMatch()
  scrollToCurrent()
}

// 上一个匹配
function gotoPrevMatch() {
  const total = matchElements.value.length
  if (total === 0) return
  globalCurrentIndex.value = globalCurrentIndex.value <= 1 ? total : globalCurrentIndex.value - 1
  highlightCurrentMatch()
  scrollToCurrent()
}

// 当关键词变化 / 面板数量 / 折叠状态 / 树版本号变化时，重新收集 match elements
watch(
  [globalSearch, columnCount, treeRevision, leftTreeRevision, middleTreeRevision, rightTreeRevision],
  () => {
    // DOM 更新后再收集（mark 是 renderNodeKey 渲染出来的）
    nextTick(() => {
      // 还要等 vue-json-pretty 完成内部渲染，再多一帧
      requestAnimationFrame(() => collectMatchElements())
    })
  }
)

// ============ 通用状态 ============
const errorMsg = ref('')
const copySuccess = ref(false)
const showHistory = ref(false)
const columnCount = ref(1) // 1=单栏 2=双栏 3=三栏
const historyList = ref([])

// 多栏宽度拖拽 ============
const splitContainerRef = ref(null)
// divider1Position/divider2Position 分别为两个分隔条距左边缘的百分比
// 2栏默认 50，3栏默认 33.33/66.67，进对应模式时由 setColumnCount 重置
const divider1Position = ref(50)
const divider2Position = ref(66.67)
const isResizing = ref(false)
const resizingDivider = ref(1) // 当前正在拖哪个分隔条（1 或 2）
let startX = 0
let startDivider1 = 50
let startDivider2 = 75

// 三栏面板宽度计算（左右各扣 4px 让出分隔条）
const leftPaneStyle = computed(() => `calc(${divider1Position.value}% - 4px)`)
const middlePaneStyle = computed(() => {
  if (columnCount.value === 3) {
    return `calc(${divider2Position.value - divider1Position.value}% - 8px)`
  }
  return '0px'
})
const rightPaneStyle = computed(() => {
  if (columnCount.value === 3) {
    return `calc(${100 - divider2Position.value}% - 4px)`
  }
  return `calc(${100 - divider1Position.value}% - 4px)`
})

function startSplitResize(e, which) {
  isResizing.value = true
  resizingDivider.value = which
  startX = e.clientX
  startDivider1 = divider1Position.value
  startDivider2 = divider2Position.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  if (splitContainerRef.value) {
    splitContainerRef.value.classList.add('is-resizing')
  }
}

function onSplitResize(e) {
  if (!isResizing.value || !splitContainerRef.value) return
  const rect = splitContainerRef.value.getBoundingClientRect()
  const dxPct = ((e.clientX - startX) / rect.width) * 100
  const MIN = 15 // 任何面板至少 15% 宽

  if (resizingDivider.value === 1) {
    // 拖动分隔条 1
    let newPos = startDivider1 + dxPct
    newPos = Math.max(MIN, Math.min(100 - MIN, newPos))
    // 若在三栏模式，要保证 newPos < divider2 - MIN
    if (columnCount.value === 3) {
      newPos = Math.min(newPos, startDivider2 - MIN)
    }
    divider1Position.value = newPos
  } else {
    // 拖动分隔条 2
    let newPos = startDivider2 + dxPct
    newPos = Math.max(MIN, Math.min(100 - MIN, newPos))
    // 必须 > divider1 + MIN
    newPos = Math.max(newPos, startDivider1 + MIN)
    divider2Position.value = newPos
  }
}

function stopSplitResize() {
  if (!isResizing.value) return
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  if (splitContainerRef.value) {
    splitContainerRef.value.classList.remove('is-resizing')
  }
}

const HISTORY_KEY = 'xinNuo_json_history'
const MAX_HISTORY = 50

// ============ 计算属性 ============
const reversedHistory = computed(() => {
  return [...historyList.value].reverse()
})

// ============ 生命周期 ============
onMounted(() => {
  loadHistory()
  // Ctrl/Cmd + F 快捷键：聚焦并全选 header 中的全局搜索框
  window.addEventListener('keydown', handleSearchShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSearchShortcut)
})

// 全局搜索框的 DOM 引用（template ref，<script setup> 下指向 input 元素本身）
const searchInputRef = ref(null)

// Ctrl/Cmd + F 快捷键：阻止浏览器自带的页面内查找，改为聚焦到我们的搜索框并全选已有内容
function handleSearchShortcut(e) {
  // 仅在按住 Ctrl (Windows/Linux) 或 Cmd (macOS) 时触发
  if (!(e.ctrlKey || e.metaKey)) return
  // 排除其它修饰键，避免与 Ctrl+Shift+F 等浏览器/系统快捷键冲突
  if (e.altKey) return
  if (e.key !== 'f' && e.key !== 'F') return

  // 阻止浏览器默认的页面内查找行为
  e.preventDefault()
  e.stopPropagation()

  const input = searchInputRef.value
  if (!input) return

  // 聚焦 + 全选已有内容（用户可直接输入覆盖）
  input.focus()
  input.select()
}

// ============ 工具函数 ============
function tryParseJson(str) {
  try { return JSON.parse(str) }
  catch { return undefined }
}

// 递归对对象的 key 按 A-Z 排序（数组保持原顺序）
function sortKeysDeep(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeysDeep)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep(obj[key])
        return acc
      }, {})
  }
  return obj
}

function showError(msg, duration = 3000) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, duration)
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

// ============ 单栏操作 ============
function formatJson() {
  const trimmed = jsonInput.value.trim()
  if (!trimmed) { showError('请输入 JSON 字符串'); return }
  const parsed = tryParseJson(trimmed)
  if (parsed === undefined) { showError('JSON 格式错误，请检查输入'); return }
  const sorted = sortKeysDeep(parsed) // 递归 A-Z 排序
  parsedJson.value = sorted
  allCollapsed.value = false
  treeRevision.value++ // 触发树重渲染
  inputHidden.value = true // 隐藏输入区
  upsertHistory(sorted) // 自动保存（去重 push，存的也是排序后的）
}

function compressJson() {
  const trimmed = jsonInput.value.trim()
  if (!trimmed) { showError('请输入 JSON 字符串'); return }
  const parsed = tryParseJson(trimmed)
  if (parsed === undefined) { showError('JSON 格式错误，请检查输入'); return }
  jsonInput.value = JSON.stringify(parsed)
  nextTick(() => formatJson())
}

function clearInput() {
  jsonInput.value = ''
  parsedJson.value = null
  allCollapsed.value = false
  treeRevision.value++
  inputHidden.value = false // 还原输入区
}

function toggleAllNodes() {
  allCollapsed.value = !allCollapsed.value
  treeRevision.value++ // 强制 vue-json-pretty 重渲染以应用新的 deep
}

async function copyResult() {
  if (!parsedJson.value) return
  await copyText(JSON.stringify(parsedJson.value, null, 2))
}

// ============ 双栏操作 ============
function formatLeft() {
  const trimmed = leftInput.value.trim()
  if (!trimmed) { showError('左侧请输入 JSON'); return }
  const parsed = tryParseJson(trimmed)
  if (parsed === undefined) { showError('左侧 JSON 格式错误'); return }
  const sorted = sortKeysDeep(parsed)
  leftParsedJson.value = sorted
  leftInputHidden.value = true // 隐藏输入区
  upsertHistory(sorted) // 自动保存
}

function formatRight() {
  const trimmed = rightInput.value.trim()
  if (!trimmed) { showError('右侧请输入 JSON'); return }
  const parsed = tryParseJson(trimmed)
  if (parsed === undefined) { showError('右侧 JSON 格式错误'); return }
  const sorted = sortKeysDeep(parsed)
  rightParsedJson.value = sorted
  rightInputHidden.value = true // 隐藏输入区
  upsertHistory(sorted) // 自动保存
}

function formatMiddle() {
  const trimmed = middleInput.value.trim()
  if (!trimmed) { showError('中间请输入 JSON'); return }
  const parsed = tryParseJson(trimmed)
  if (parsed === undefined) { showError('中间 JSON 格式错误'); return }
  const sorted = sortKeysDeep(parsed)
  middleParsedJson.value = sorted
  middleInputHidden.value = true // 隐藏输入区
  upsertHistory(sorted) // 自动保存
}

function clearLeft() {
  leftInput.value = ''
  leftParsedJson.value = null
  leftCollapsed.value = false
  leftTreeRevision.value++
  leftInputHidden.value = false // 还原输入区
}

function clearRight() {
  rightInput.value = ''
  rightParsedJson.value = null
  rightCollapsed.value = false
  rightTreeRevision.value++
  rightInputHidden.value = false // 还原输入区
}

function clearMiddle() {
  middleInput.value = ''
  middleParsedJson.value = null
  middleCollapsed.value = false
  middleTreeRevision.value++
  middleInputHidden.value = false // 还原输入区
}

function toggleLeftCollapse() {
  leftCollapsed.value = !leftCollapsed.value
  leftTreeRevision.value++
}

function toggleRightCollapse() {
  rightCollapsed.value = !rightCollapsed.value
  rightTreeRevision.value++
}

function toggleMiddleCollapse() {
  middleCollapsed.value = !middleCollapsed.value
  middleTreeRevision.value++
}

async function copyLeftResult() {
  if (!leftParsedJson.value) return
  await copyText(JSON.stringify(leftParsedJson.value, null, 2))
}

async function copyRightResult() {
  if (!rightParsedJson.value) return
  await copyText(JSON.stringify(rightParsedJson.value, null, 2))
}

async function copyMiddleResult() {
  if (!middleParsedJson.value) return
  await copyText(JSON.stringify(middleParsedJson.value, null, 2))
}

// ============ 模式切换 ============
function setColumnCount(n) {
  if (columnCount.value === n) return
  const prev = columnCount.value
  columnCount.value = n

  // 状态迁移：保证用户内容不丢失
  if (prev === 1 && n === 2) {
    // 单栏 → 双栏：主内容进左；右栏空白；分隔条复位到 50 均分
    leftInput.value = jsonInput.value
    leftParsedJson.value = parsedJson.value
    leftInputHidden.value = inputHidden.value
    leftCollapsed.value = false
    rightInput.value = ''
    rightParsedJson.value = null
    rightInputHidden.value = false
    rightCollapsed.value = false
    divider1Position.value = 50
  } else if (prev === 2 && n === 1) {
    // 双栏 → 单栏：左侧回主
    jsonInput.value = leftInput.value
    parsedJson.value = leftParsedJson.value
    inputHidden.value = leftInputHidden.value
    allCollapsed.value = leftCollapsed.value
    // 清空双栏状态
    leftInput.value = ''
    leftParsedJson.value = null
    leftInputHidden.value = false
    leftCollapsed.value = false
    rightInput.value = ''
    rightParsedJson.value = null
    rightInputHidden.value = false
    rightCollapsed.value = false
  } else if (prev === 2 && n === 3) {
    // 双栏 → 三栏：左/右保留；中间新增空白；分隔条复位到 33.33/66.67 三等分
    divider1Position.value = 33.33
    divider2Position.value = 66.67
    middleInput.value = ''
    middleParsedJson.value = null
    middleInputHidden.value = false
    middleCollapsed.value = false
  } else if (prev === 3 && n === 2) {
    // 三栏 → 双栏：左 + 中间 → 合并到左侧；右侧保留；分隔条复位 50
    if (middleInput.value || middleParsedJson.value) {
      if (leftInput.value && middleInput.value) {
        leftInput.value = `${leftInput.value}\n/* 中间面板 JSON */\n${middleInput.value}`
      } else if (middleInput.value) {
        leftInput.value = middleInput.value
      }
      const parsed = tryParseJson(leftInput.value)
      if (parsed !== undefined) {
        leftParsedJson.value = parsed
        leftInputHidden.value = true
      }
    }
    middleInput.value = ''
    middleParsedJson.value = null
    middleInputHidden.value = false
    middleCollapsed.value = false
    divider1Position.value = 50
  } else if (prev === 3 && n === 1) {
    // 三栏 → 单栏：中间回主；左/右清空
    jsonInput.value = middleInput.value || leftInput.value || rightInput.value
    parsedJson.value = middleParsedJson.value || leftParsedJson.value || rightParsedJson.value
    inputHidden.value = middleInputHidden.value
    allCollapsed.value = middleCollapsed.value
    // 清空多栏状态
    leftInput.value = ''
    leftParsedJson.value = null
    leftInputHidden.value = false
    leftCollapsed.value = false
    middleInput.value = ''
    middleParsedJson.value = null
    middleInputHidden.value = false
    middleCollapsed.value = false
    rightInput.value = ''
    rightParsedJson.value = null
    rightInputHidden.value = false
    rightCollapsed.value = false
  }
}

// ============ 历史记录 ============
function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) historyList.value = JSON.parse(stored)
  } catch { historyList.value = [] }
}

function saveHistory() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList.value)) }
  catch { /* ignore */ }
}

// 通用 upsert：先删掉重复内容，再 push（移到列表末尾/最新位置）
function upsertHistory(data) {
  if (data === null || data === undefined) return
  const max = 1500
  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  const preview = formatted.length > max ? formatted.substring(0, max) + '...' : formatted

  // 删掉所有重复内容
  historyList.value = historyList.value.filter(item => item.content !== formatted)

  // push 新条目（移到最新位置）
  historyList.value.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    time: timeStr,
    content: formatted,
    preview
  })

  // 限制最大条数
  if (historyList.value.length > MAX_HISTORY) {
    historyList.value = historyList.value.slice(-MAX_HISTORY)
  }

  saveHistory()
}

function loadFromHistory(item) {
  jsonInput.value = item.content
  showHistory.value = false
  columnCount.value = 1
  parsedJson.value = null
  allCollapsed.value = false
  // 清空多栏状态
  leftInput.value = ''
  leftParsedJson.value = null
  leftInputHidden.value = false
  leftCollapsed.value = false
  middleInput.value = ''
  middleParsedJson.value = null
  middleInputHidden.value = false
  middleCollapsed.value = false
  rightInput.value = ''
  rightParsedJson.value = null
  rightInputHidden.value = false
  rightCollapsed.value = false
  nextTick(() => formatJson())
}

function deleteHistoryItem(id) {
  historyList.value = historyList.value.filter(item => item.id !== id)
  saveHistory()
}

function clearHistory() {
  if (historyList.value.length === 0) return
  historyList.value = []
  saveHistory()
}

function toggleHistory() {
  showHistory.value = !showHistory.value
  if (showHistory.value) loadHistory()
}
</script>

<style lang="scss" scoped>
// ============ 变量 ============
$primary: #4f6ef7;
$primary-hover: #3b5de7;
$success: #22c55e;
$danger: #ef4444;
$text-primary: #1e293b;
$text-secondary: #64748b;
$text-muted: #94a3b8;
$bg-white: #ffffff;
$bg-gray: #f8fafc;
$bg-hover: #f1f5f9;
$border: #e2e8f0;
$radius: 8px;
$radius-sm: 6px;
$shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

// ============ 全局容器 ============
.json-tool {
  max-width: 960px; // 单栏：固定宽度居中
  margin: 0 auto;
  padding: 12px;
  height: 100vh;
  background: $bg-gray;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: $text-primary;
  display: flex;
  flex-direction: column;
}

// 双栏模式：撑满整个视口宽度
.json-tool.is-split {
  max-width: 100vw;
  width: 100vw;
  margin: 0;
  padding: 8px;
}
.json-tool.is-split .tool-header {
  margin-bottom: 8px;
  padding: 10px 20px;
}

// ============ 顶部标题栏 ============
.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 24px;
  background: $bg-white;
  border-radius: $radius;
  box-shadow: $shadow;
  flex-shrink: 0; // 防止被压缩
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: $text-primary;
}

.header-subtitle {
  font-size: 13px;
  color: $text-muted;
}

.header-actions { display: flex; gap: 8px; }

// 多栏切换器（分段控件）
.column-switch {
  display: inline-flex;
  border: 1px solid $border;
  border-radius: $radius-sm;
  overflow: hidden;
  background: $bg-white;

  .action-btn {
    border: none;
    border-radius: 0;
    padding: 8px 14px;
    border-right: 1px solid $border;
    &:last-child { border-right: none; }
    &.active {
      background: $primary;
      color: #fff;
    }
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid $border;
  border-radius: $radius-sm;
  background: $bg-white;
  color: $text-secondary;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) { border-color: $primary; color: $primary; background: #eef2ff; }
  &.active { border-color: $primary; color: $primary; background: #eef2ff; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  .action-icon { font-size: 16px; }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px; padding: 0 5px;
    border-radius: 9px; background: $primary; color: #fff;
    font-size: 11px; font-weight: 600;
  }
}

// ============ 主内容区 ============
.tool-body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ============ 卡片通用 ============
.panel-card {
  background: $bg-white;
  border-radius: $radius;
  box-shadow: $shadow;
  overflow: hidden;
}

.panel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid $border;
  h2 { font-size: 15px; font-weight: 600; margin: 0; }
}

.panel-card-actions { display: flex; align-items: center; gap: 8px; }

// ============ 按钮 ============
.btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 8px 18px; border: none; border-radius: $radius-sm;
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
  span { font-size: 15px; }

  &-primary { background: $primary; color: #fff; &:hover { background: $primary-hover; } }
  &-secondary { background: $bg-hover; color: $text-secondary; border: 1px solid $border; &:hover { background: darken($bg-hover, 3%); } }
  &-success { background: $success; color: #fff; &:hover { background: darken($success, 5%); } }
  &-danger { background: $danger; color: #fff; &:hover { background: darken($danger, 5%); } }
  &-outline { background: transparent; color: $text-secondary; border: 1px solid $border; &:hover { border-color: $danger; color: $danger; } }
  &-sm { padding: 5px 12px; font-size: 13px; }
  &-xs { padding: 3px 8px; font-size: 12px; }
}

// ============ 搜索栏 ============
// 全局搜索（header 中的搜索框，对所有面板生效）
.header-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  width: 40vw;
  margin-left: 8px;
  padding: 6px 10px;
  border: 1px solid $border;
  border-radius: $radius-sm;
  transition: all 0.15s;
  &:focus-within {
    background: $bg-white;
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.1);
  }
  .search-input {
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 2px 0;
    font-size: 13px;
    flex: 1;
    min-width: 0;
    &:focus { box-shadow: none; border: none; }
  }
  .search-clear {
    margin-left: 0;
  }
  .search-meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .search-position {
    font-size: 12px;
    color: $text-secondary;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    user-select: none;
  }
  .search-nav {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px solid $border;
    background: $bg-white;
    color: $text-secondary;
    border-radius: $radius-sm;
    cursor: pointer;
    font-size: 13px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    &:hover:not(:disabled) {
      border-color: $primary;
      color: $primary;
      background: rgba(79, 110, 247, 0.06);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
.search-icon {
  font-size: 14px;
  color: $text-muted;
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  min-width: 0;
  padding: 5px 10px;
  border: 1px solid $border;
  border-radius: $radius-sm;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  background: $bg-gray;
  color: $text-primary;
  transition: all 0.15s;
  &:focus {
    border-color: $primary;
    background: $bg-white;
    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.1);
  }
  &::placeholder { color: $text-muted; }
}
.search-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $text-muted;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.search-clear {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: $text-muted;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover { background: $border; color: $danger; }
}

// ============ 单栏输入 ============
.input-section {
  flex-shrink: 0;
}

.char-count { font-size: 12px; color: $text-muted; }

.json-input {
  display: block;
  width: 100%;
  min-height: 120px;
  max-height: 220px;
  padding: 14px 20px;
  border: none; outline: none; resize: vertical;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px; line-height: 1.6;
  color: $text-primary; background: $bg-gray;
  transition: background 0.2s;
  &:focus { background: #f0f4ff; }
  &::placeholder { color: $text-muted; }
}

.input-actions {
  display: flex; gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid $border;
}

// ============ 单栏输出 ============
.output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.output-section > .panel-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.json-tree-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding: 16px 20px;
  background: $bg-gray;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px; line-height: 1.7;
}

.json-tree {
  :deep(.vjp-key) { color: #7c3aed !important; }
  :deep(.vjp-string) { color: #059669 !important; }
  :deep(.vjp-number) { color: #2563eb !important; }
  :deep(.vjp-boolean) { color: #d97706 !important; }
  :deep(.vjp-null) { color: #94a3b8 !important; font-style: italic !important; }
  :deep(.vjp-bracket) { color: #475569 !important; }
  :deep(.vjp-comma) { color: #94a3b8 !important; }
  :deep(.vjp-arrow) { color: #94a3b8 !important; }
  :deep(.vjp-node) { transition: background 0.1s; }
  :deep(.vjp-node:hover) { background: rgba(79, 110, 247, 0.05); border-radius: 3px; }
  // 搜索高亮（自定义 renderNodeKey / renderNodeValue 输出的 <mark> 标签）
  :deep(.search-match) {
    background: #fef08a !important;
    color: #713f12 !important;
    border-radius: 3px;
    padding: 0 2px;
    box-shadow: 0 0 0 1px rgba(202, 138, 4, 0.3);
    transition: background 0.15s, box-shadow 0.15s;
  }
  // 当前激活的匹配（↑/↓ 定位到的）
  :deep(.search-current) {
    background: #fb923c !important;
    color: #fff !important;
    box-shadow: 0 0 0 2px #ea580c, 0 2px 4px rgba(234, 88, 12, 0.4) !important;
    border-radius: 3px;
    animation: search-pulse 0.4s ease-out;
  }
  @keyframes search-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.6), 0 0 0 0 rgba(234, 88, 12, 0.4); }
    50%  { box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.3), 0 0 0 6px rgba(234, 88, 12, 0.2); }
    100% { box-shadow: 0 0 0 2px #ea580c, 0 2px 4px rgba(234, 88, 12, 0.4); }
  }
}

// ============ 双栏布局 ============
.split-panels {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  flex: 1;
  min-height: 0;
}

.split-pane {
  background: $bg-white;
  border-radius: $radius;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; // 防止溢出
}

// ============ 拖拽分隔条 ============
.split-divider {
  flex-shrink: 0;
  width: 8px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  position: relative;
  z-index: 1;
  transition: background 0.15s;

  &:hover {
    background: #eef2ff;
  }

  // 拖拽时高亮
  .split-panels.is-resizing & {
    background: $primary;
    opacity: 0.15;
  }
}

.split-divider-dots {
  writing-mode: vertical-lr;
  letter-spacing: 2px;
  font-size: 12px;
  color: $text-muted;
  pointer-events: none;
  user-select: none;
}

// 搜索命中数量徽章（紧贴面板标题显示）
.match-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 6px;
  margin-left: 8px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border-radius: 9px;
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.3);
  cursor: help;
  user-select: none;
  // 在标题里跟文字基线对齐
  position: relative;
  top: -2px;
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
  gap: 12px;
  background: $bg-white;
}

.pane-label {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pane-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pane-input {
  display: block;
  width: 100%;
  min-height: 72px;
  max-height: 120px;
  padding: 10px 16px;
  border: none; outline: none; resize: vertical;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px; line-height: 1.5;
  color: $text-primary; background: $bg-gray;
  flex-shrink: 0;
  transition: background 0.2s;
  &:focus { background: #f0f4ff; }
  &::placeholder { color: #adb5bd; }
}

.pane-actions {
  display: flex; gap: 6px;
  padding: 8px 16px;
  border-bottom: 1px solid $border;
  background: $bg-white;
  flex-shrink: 0;
}

.pane-tree-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // flex 子项收缩关键
  background: $bg-gray;
}

.pane-tree-scroll {
  flex: 1;
  overflow: auto;
  padding: 14px 16px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px; line-height: 1.7;
}

.pane-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  font-size: 14px;
  span { background: #f1f3f5; padding: 6px 14px; border-radius: 6px; }
}

// ============ 历史记录 ============
.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid $border;
  cursor: pointer; transition: background 0.15s;
  &:hover { background: $bg-hover; }
  &:last-child { border-bottom: none; }
}

.history-item-left {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}

.history-index {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: #eef2ff; color: $primary;
  font-size: 12px; font-weight: 600;
}

.history-time { font-size: 12px; color: $text-muted; white-space: nowrap; }

.history-preview {
  flex: 1;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px; color: $text-secondary;
}

.history-delete {
  flex-shrink: 0; width: 24px; height: 24px;
  border: none; border-radius: 50%; background: transparent;
  color: $text-muted; font-size: 12px; cursor: pointer;
  opacity: 0; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  .history-item:hover & { opacity: 1; }
  &:hover { background: #fee2e2; color: $danger; }
}

.history-empty {
  padding: 48px 20px; text-align: center; color: $text-muted;
  .empty-icon { font-size: 36px; margin-bottom: 8px; }
  p { margin: 4px 0; font-size: 14px; }
  .empty-hint { font-size: 12px; color: $text-muted; }
}

// ============ Toast 提示 ============
.error-toast, .copy-toast {
  position: fixed; bottom: 32px; left: 50%;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: $radius;
  font-size: 14px; box-shadow: $shadow-md; z-index: 1000;
}

.error-toast { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
.copy-toast { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }

.error-close { background: none; border: none; cursor: pointer; color: #b91c1c; font-size: 14px; padding: 0 0 0 8px; }
.error-icon { font-size: 16px; }

// ============ 过渡动画 ============
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from { opacity: 0; transform: translateY(-10px); }
.slide-leave-to { opacity: 0; transform: translateY(-10px); }

// ============ 滚动条 ============
.json-tree-wrapper::-webkit-scrollbar,
.history-list::-webkit-scrollbar,
.pane-tree-scroll::-webkit-scrollbar {
  width: 6px; height: 6px;
}
.json-tree-wrapper::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track,
.pane-tree-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.json-tree-wrapper::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb,
.pane-tree-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1; border-radius: 3px;
}
.json-tree-wrapper::-webkit-scrollbar-thumb:hover,
.history-list::-webkit-scrollbar-thumb:hover,
.pane-tree-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

// ============ 响应式 ============
@media (min-width: 1600px) {
  .json-tool {
    max-width: 1400px;
    padding: 16px;
  }
}

@media (max-width: 1024px) {
  .json-tool {
    padding: 8px;
  }
  .tool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .split-panels {
    flex-direction: column;
    gap: 12px;
  }
  .split-divider {
    display: none;
  }
  .split-pane {
    width: 100% !important;
    min-height: 320px;
  }
  .pane-tree-area {
    min-height: 200px;
  }
}

@media (max-width: 768px) {
  .header-title { font-size: 17px; }
  .header-subtitle { display: none; }
  .json-input {
    min-height: 100px;
    max-height: 160px;
    font-size: 13px;
  }
  .json-tree-wrapper {
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .json-tool { padding: 6px; }
  .tool-header { padding: 10px 14px; }
  .action-btn { padding: 6px 10px; font-size: 13px; }
  .btn { padding: 6px 12px; font-size: 13px; }
  .json-input { min-height: 80px; max-height: 140px; padding: 10px 14px; }
  .history-list { max-height: 300px; }
}

</style>
