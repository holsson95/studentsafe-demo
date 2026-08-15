import './assets/styles/main.css'
import './assets/styles/variables.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import { Icon } from '@iconify/vue'
import router from './router'

const app = createApp(App)

app.component('Icon', Icon)
app.use(router)
app.use(createPinia())
app.mount('#app')