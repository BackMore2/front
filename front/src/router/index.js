import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Index from '../views/index.vue';
import AdminIndex from "../views/admin-index.vue";
import adminLookup from "../views/admin_Lookup.vue";
import physicalTest from "../views/physical-test.vue";

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/index', component: Index },
    { path: '/adminLookup', component: adminLookup },
    {path:'/admin-index',component: AdminIndex},
    {path:'/physicalTest',component:physicalTest}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router