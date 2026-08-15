import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@views/Dashboard.vue'),
    meta: {
      title: '工作台',
      icon: '🎯'
    }
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('@views/Components.vue'),
    meta: {
      title: '组件库',
      icon: '🧩'
    }
  },
  {
    path: '/templates',
    name: 'Templates',
    component: () => import('@views/Templates.vue'),
    meta: {
      title: '模板',
      icon: '📋'
    }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@views/Projects.vue'),
    meta: {
      title: '项目',
      icon: '📁'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@views/Settings.vue'),
    meta: {
      title: '设置',
      icon: '⚙️'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - RedstoneCodeStudio v2.0.0`
  
  // 检查系统状态
  const appStore = useAppStore()
  if (to.meta.requiresAuth && !appStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// 动态导入store
function useAppStore() {
  return import('@stores/appStore').then(module => module.default)
}

export default router