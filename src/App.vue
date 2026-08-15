<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <div class="logo-section">
        <img src="@assets/redstone-icon.svg" alt="RedstoneCodeStudio" class="logo">
        <h1>RedstoneCodeStudio v2.0.0</h1>
      </div>
      <div class="version-info">
        <span>Version: {{ appVersion }}</span>
        <span>Stage: {{ currentStage }}</span>
      </div>
    </header>

    <nav class="main-nav">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="nav-icon">🎯</span>
        <span class="nav-text">工作台</span>
      </router-link>
      <router-link to="/components" class="nav-item" active-class="active">
        <span class="nav-icon">🧩</span>
        <span class="nav-text">组件库</span>
      </router-link>
      <router-link to="/templates" class="nav-item" active-class="active">
        <span class="nav-icon">📋</span>
        <span class="nav-text">模板</span>
      </router-link>
      <router-link to="/projects" class="nav-item" active-class="active">
        <span class="nav-icon">📁</span>
        <span class="nav-text">项目</span>
      </router-link>
      <router-link to="/settings" class="nav-item" active-class="active">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">设置</span>
      </router-link>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="status-info">
        <span class="status-indicator" :class="statusClass">{{ statusText }}</span>
        <span>Maven: {{ mavenStatus }}</span>
        <span>Java: {{ javaStatus }}</span>
      </div>
      <div class="quick-actions">
        <button @click="openHelp" class="action-btn">帮助</button>
        <button @click="openDocs" class="action-btn">文档</button>
        <button @click="checkUpdates" class="action-btn">更新</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@stores/appStore'

// Store
const appStore = useAppStore()

// Refs
const appVersion = ref('v2.0.0')
const currentStage = ref('Phase 4: Architecture Upgrade')
const mavenStatus = ref('Active')
const javaStatus = ref('Available')

// Computed
const statusClass = computed(() => appStore.systemStatus)
const statusText = computed(() => appStore.statusText)

// Lifecycle
onMounted(() => {
  appStore.checkSystemStatus()
  appStore.initializeApp()
})

// Methods
const openHelp = () => {
  appStore.showHelp()
}

const openDocs = () => {
  appStore.showDocumentation()
}

const checkUpdates = () => {
  appStore.checkForUpdates()
}
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.version-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

.main-nav {
  background: white;
  padding: 0.5rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.nav-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8f9fa;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f8f9fa;
}

.app-footer {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.05);
}

.status-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.success {
  background: #d4edda;
  color: #155724;
}

.status-indicator.warning {
  background: #fff3cd;
  color: #856404;
}

.status-indicator.error {
  background: #f8d7da;
  color: #721c24;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.action-btn:hover {
  background: #5a67d8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>