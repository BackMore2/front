import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from "axios";

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

//axios.get('/config.json').then(res=>{
    //app.config.globalProperties.$config = res.data
//})
//export const globals=app.config.globalProperties

app.use(router)
app.use(ElementPlus)

app.mount('#app')
