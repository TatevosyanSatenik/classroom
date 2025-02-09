import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import vueDebounce from 'vue-debounce'

createApp(App)
	.directive('debounce', vueDebounce({ lock: true }))
	.mount('#app')
