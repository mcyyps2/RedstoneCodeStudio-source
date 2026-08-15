<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h2>欢迎使用 RedstoneCodeStudio v2.0.0</h2>
        <p>{{ currentStage }}</p>
      </div>
      <div class="status-badge">
        <span class="badge" :class="systemStatus">{{ statusText }}</span>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="action-grid">
        <div class="action-card" @click="createNewProject">
          <div class="card-icon">🚀</div>
          <div class="card-title">新建项目</div>
          <div class="card-desc">创建全新的Minecraft插件项目</div>
        </div>
        <div class="action-card" @click="openProject">
          <div class="card-icon">📁</div>
          <div class="card-title">打开项目</div>
          <div class="card-desc">打开现有的开发项目</div>
        </div>
        <div class="action-card" @click="importBlueprint">
          <div class="card-icon">📋</div>
          <div class="card-title">导入蓝图</div>
          <div class="card-desc">从配置文件导入项目蓝图</div>
        </div>
        <div class="action-card" @click="viewTemplates">
          <div class="card-icon">📋</div>
          <div class="card-title">使用模板</div>
          <div class="card-desc">使用预设的项目模板快速开始</div>
        </div>
      </div>
    </div>

    <!-- 最近项目 -->
    <div class="recent-projects">
      <div class="section-header">
        <h3>最近项目</h3>
        <button @click="viewAllProjects" class="view-all-btn">查看全部</button>
      </div>
      <div class="project-list">
        <div v-if="recentProjects.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <p>暂无最近项目</p>
          <button @click="createNewProject" class="create-btn">创建第一个项目</button>
        </div>
        <div v-else class="project-items">
          <div v-for="project in recentProjects" :key="project.id" class="project-item">
            <div class="project-icon">
              <img :src="getProjectIcon(project.type)" :alt="project.name">
            </div>
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-meta">
                <span class="project-type">{{ project.type }}</span>
                <span class="project-date">{{ formatDate(project.lastModified) }}</span>
              </div>
            </div>
            <div class="project-actions">
              <button @click="openProject(project)" class="action-btn primary">打开</button>
              <button @click="duplicateProject(project)" class="action-btn">复制</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能特性 -->
    <div class="features">
      <div class="section-header">
        <h3>新功能特性</h3>
        <span class="version-tag">v2.0.0</span>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">实时代码预览</div>
          <div class="feature-desc">选择节点即可实时查看生成的Java代码</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <div class="feature-title">自定义代码节点</div>
          <div class="feature-desc">编写自己的Java代码片段并插入到节点图中</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📁</div>
          <div class="feature-title">多文件项目管理</div>
          <div class="feature-desc">支持复杂的多文件Java项目结构</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <div class="feature-title">一键测试部署</div>
          <div class="feature-desc">自动下载并启动测试服务器，实时查看日志</div>
        </div>
      </div>
    </div>

    <!-- 开发提示 -->
    <div class="tips-section">
      <div class="section-header">
        <h3>开发提示</h3>
      </div>
      <div class="tips-container">
        <div class="tip-item">
          <div class="tip-icon">💡</div>
          <div class="tip-content">
            <strong>提示:</strong> 使用快捷键 Ctrl+Space 可以快速搜索可用的节点类型
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">🔧</div>
          <div class="tip-content">
            <strong>提示:</strong> 右键点击节点可以查看更多选项，包括复制、删除和配置
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">📚</div>
          <div class="tip-content">
            <strong>提示:</strong> 查看帮助文档了解每个节点的详细用法和参数说明
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@stores/appStore'

const router = useRouter()
const appStore = useAppStore()

// Data
const recentProjects = ref<Array<{
  id: string
  name: string
  type: string
  lastModified: Date
  icon?: string
}>>([])

// Computed
const systemStatus = computed(() => appStore.systemStatus.status)
const statusText = computed(() => appStore.statusText)

// Methods
const createNewProject = () => {
  router.push('/projects/new')
}

const openProject = (project?: any) => {
  if (project) {
    // 打开指定项目
    console.log('打开项目:', project)
  } else {
    // 打开项目选择器
    router.push('/projects')
  }
}

const importBlueprint = () => {
  router.push('/import')
}

const viewTemplates = () => {
  router.push('/templates')
}

const duplicateProject = (project: any) => {
  // 复制项目
  console.log('复制项目:', project)
}

const viewAllProjects = () => {
  router.push('/projects')
}

const getProjectIcon = (type: string) => {
  const icons: Record<string, string> = {
    'economy': '💰',
    'pvp': '⚔️',
    'welcome': '👋',
    'custom': '🎯'
  }
  return icons[type] || '📁'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// Lifecycle
onMounted(async () => {
  // 加载最近项目
  await loadRecentProjects()
  // 检查系统状态
  await appStore.checkSystemStatus()
})

const loadRecentProjects = async () => {
  try {
    // 这里可以加载最近的项目列表
    // 现在使用模拟数据
    recentProjects.value = [
      {
        id: '1',
        name: '欢迎插件',
        type: 'welcome',
        lastModified: new Date('2026-08-15'),
        icon: '👋'
      },
      {
        id: '2',
        name: '经济系统',
        type: 'economy',
        lastModified: new Date('2026-08-14'),
        icon: '💰'
      }
    ]
  } catch (error) {
    console.error('加载最近项目失败:', error)
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.welcome-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h2 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.welcome-content p {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 1.1rem;
}

.status-badge {
  display: flex;
  align-items: center;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.badge.success {
  background: #d4edda;
  color: #155724;
}

.badge.warning {
  background: #fff3cd;
  color: #856404;
}

.badge.error {
  background: #f8d7da;
  color: #721c24;
}

.quick-actions {
  margin-bottom: 2rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.card-desc {
  color: #666;
  font-size: 0.9rem;
}

.recent-projects, .features, .tips-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.view-all-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.view-all-btn:hover {
  background: #5a67d8;
}

.project-list {
  min-height: 100px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #666;
  margin-bottom: 1rem;
}

.create-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.project-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.project-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.2rem;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.project-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #f8f9fa;
}

.action-btn.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.action-btn.primary:hover {
  background: #5a67d8;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.feature-desc {
  color: #666;
  font-size: 0.9rem;
}

.version-tag {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.tips-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.tip-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  margin-top: 0.2rem;
}

.tip-content {
  flex: 1;
}

.tip-content strong {
  color: #333;
}
</style>