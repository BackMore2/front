import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
    baseURL: 'http://10.37.144.107:8080/', // 基础 URL
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


export default service