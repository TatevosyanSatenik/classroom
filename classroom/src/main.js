import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import vueDebounce from 'vue-debounce'
import router from './router'

createApp(App)
	.use(router)
	.directive('debounce', vueDebounce({ lock: true }))
	.mount('#app')
