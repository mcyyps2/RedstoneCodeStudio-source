import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'

// Vue Router setup
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Pinia setup
const pinia = createPinia()

// Vue App setup
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')