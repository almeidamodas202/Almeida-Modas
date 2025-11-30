import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// Ativa o Pinia e monta a aplicação
app.use(pinia)
app.mount('#app')