import axios from 'axios'
import { ElMessage } from 'element-plus'
//import {globals} from "@/main.js";
//const serverUrl=globals.$config?.serverUrl||'http://10.37.171.166:8080'
// 创建 axios 实例
const service = axios.create({
    baseURL: 'http://10.133.128.138:11236', // 基础 URL
    timeout: 10000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      ElMessage({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      });
      return Promise.reject(new Error(res.msg || 'Error'));
    } else {
      return res;
    }
  },
  error => {
    console.error('Response Error:', error);
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    });
    return Promise.reject(error);
  }
);

// 自定义方法，支持自定义 Content-Type 头部
export function customGet(url, config = {}) {
    const headers = {
        ...config.headers,
        'Content-Type': 'application/x-www-form-urlencoded' // 默认设置 Content-Type
    };
    return service.get(url, { ...config, headers });
}

// 新增自定义 POST 方法，支持自定义 Content-Type 头部
export function customPost(url, data, config = {}) {
    const headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data' // 默认设置 Content-Type
    };

    return service.post(url, data, { ...config, headers });
}
export function secPost(url, data, config = {}) {
    const headers = {
        ...config.headers,
        'Content-Type': 'application/json' // 默认设置 Content-Type
    };

    return service.post(url, data, { ...config, headers });
}

export default service