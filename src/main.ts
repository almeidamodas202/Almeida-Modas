import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router' // <--- Importe o roteador

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router) // <--- Use o roteador
app.mount('#app')