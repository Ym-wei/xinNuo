<template>
  <div class="json-tool" :class="{ 'is-split': splitMode }">
    <!-- ========== 顶部标题栏 ========== -->
    <div class="tool-header">
      <div class="header-left">
        <h1 class="header-title">JSON 美化工具</h1>
        <span class="header-subtitle">PC端 · vue-json-pretty · 双栏对比</span>
      </div>
      <div class="header-actions">
        <button
          class="action-btn"
          :class="{ active: splitMode }"
          @click="toggleSplitMode"
        >
          <span class="action-icon">⇔</span>
          <span>{{ splitMode ? '单栏' : '双栏' }}</span>
        </button>
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
                <div class="history-preview">{{ item.preview }}</div>
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
      <template v-if="!showHistory && !splitMode">
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
              <h2>📄 美化结果</h2>
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
                class="json-tree"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- ===== 双栏模式：两个独立面板，可拖拽调整宽度 ===== -->
      <template v-if="!showHistory && splitMode">
        <div
          class="split-panels"
          ref="splitContainerRef"
          @mousemove="onSplitResize"
          @mouseup="stopSplitResize"
          @mouseleave="stopSplitResize"
        >
          <!-- 左侧面板 -->
          <div class="split-pane" :style="{ width: 'calc(' + leftPaneWidth + '% - 4px)' }">
            <div class="pane-header">
              <span class="pane-label">📄 左侧 · 美化结果</span>
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
                  class="json-tree"
                />
              </div>
              <div v-else class="pane-empty">
                <span>粘贴 JSON 后点击 ✨ 美化</span>
              </div>
            </div>
          </div>

          <!-- 拖拽分隔条 -->
          <div class="split-divider" @mousedown.prevent="startSplitResize">
            <span class="split-divider-dots">⋮⋮</span>
          </div>

          <!-- 右侧面板 -->
          <div class="split-pane" :style="{ width: 'calc(' + (100 - leftPaneWidth) + '% - 4px)' }">
            <div class="pane-header">
              <span class="pane-label">📄 右侧 · 美化结果</span>
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
import { ref, computed, nextTick, onMounted } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

// ============ 单栏状态 ============
const jsonInput = ref('')
const parsedJson = ref(null)
const allCollapsed = ref(false)
const treeRevision = ref(0) // 用于强制 vue-json-pretty 重渲染
const inputHidden = ref(false) // 点击美化后自动隐藏输入区

// ============ 双栏状态 ============
const leftInput = ref('')
const leftParsedJson = ref(null)
const leftCollapsed = ref(false)
const leftTreeRevision = ref(0)
const leftInputHidden = ref(false)
const rightInput = ref('')
const rightParsedJson = ref(null)
const rightCollapsed = ref(false)
const rightTreeRevision = ref(0)
const rightInputHidden = ref(false)

// ============ 通用状态 ============
const errorMsg = ref('')
const copySuccess = ref(false)
const showHistory = ref(false)
const splitMode = ref(false)
const historyList = ref([])

// ============ 双栏宽度拖拽 ============
const splitContainerRef = ref(null)
const leftPaneWidth = ref(50)
const isResizing = ref(false)
let startX = 0
let startWidth = 50

function startSplitResize(e) {
  isResizing.value = true
  startX = e.clientX
  startWidth = leftPaneWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  if (splitContainerRef.value) {
    splitContainerRef.value.classList.add('is-resizing')
  }
}

function onSplitResize(e) {
  if (!isResizing.value || !splitContainerRef.value) return
  const rect = splitContainerRef.value.getBoundingClientRect()
  const dx = e.clientX - startX
  const pct = (dx / rect.width) * 100
  let newWidth = startWidth + pct
  newWidth = Math.max(20, Math.min(80, newWidth))
  leftPaneWidth.value = newWidth
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
})

// ============ 工具函数 ============
function tryParseJson(str) {
  try { return JSON.parse(str) }
  catch { return undefined }
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
  parsedJson.value = parsed
  allCollapsed.value = false
  treeRevision.value++ // 触发树重渲染
  inputHidden.value = true // 隐藏输入区
  upsertHistory(parsed) // 自动保存（去重 push）
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
  leftParsedJson.value = parsed
  leftInputHidden.value = true // 隐藏输入区
  upsertHistory(parsed) // 自动保存
}

function formatRight() {
  const trimmed = rightInput.value.trim()
  if (!trimmed) { showError('右侧请输入 JSON'); return }
  const parsed = tryParseJson(trimmed)
  if (parsed === undefined) { showError('右侧 JSON 格式错误'); return }
  rightParsedJson.value = parsed
  rightInputHidden.value = true // 隐藏输入区
  upsertHistory(parsed) // 自动保存
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

function toggleLeftCollapse() {
  leftCollapsed.value = !leftCollapsed.value
  leftTreeRevision.value++
}

function toggleRightCollapse() {
  rightCollapsed.value = !rightCollapsed.value
  rightTreeRevision.value++
}

async function copyLeftResult() {
  if (!leftParsedJson.value) return
  await copyText(JSON.stringify(leftParsedJson.value, null, 2))
}

async function copyRightResult() {
  if (!rightParsedJson.value) return
  await copyText(JSON.stringify(rightParsedJson.value, null, 2))
}

// ============ 模式切换 ============
function toggleSplitMode() {
  splitMode.value = !splitMode.value
  if (splitMode.value) {
    // 单栏 → 双栏：把当前内容带到左侧
    leftInput.value = jsonInput.value
    leftParsedJson.value = parsedJson.value
    leftInputHidden.value = inputHidden.value || false
    rightInput.value = ''
    rightParsedJson.value = null
    rightInputHidden.value = false
  } else {
    // 双栏 → 单栏：把左侧内容带回
    jsonInput.value = leftInput.value
    parsedJson.value = leftParsedJson.value
    inputHidden.value = leftInputHidden.value
    allCollapsed.value = false
    // 清理双栏状态
    leftInput.value = ''
    leftParsedJson.value = null
    leftInputHidden.value = false
    rightInput.value = ''
    rightParsedJson.value = null
    rightInputHidden.value = false
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
  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  const preview = formatted.length > 80 ? formatted.substring(0, 80) + '...' : formatted

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
  splitMode.value = false
  parsedJson.value = null
  allCollapsed.value = false
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
  max-width: 90vw;
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
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
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
