import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import 'amfe-flexible/index.js'
const app = createApp(App)
installElementPlus(app)
app.mount('#app')
