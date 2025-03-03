import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Index from '../views/Index.vue'
import AdminIndex from "@/views/admin-index.vue";

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/index', component: Index },
    {path:'/admin-index',component: AdminIndex}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router