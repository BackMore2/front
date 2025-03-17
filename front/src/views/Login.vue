<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <div class="card-header">
        <span class="title">个人成绩查询系统</span>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px" class="form">
        <el-form-item label="学号" prop="userName">
          <el-input v-model="loginForm.userName" placeholder="请输入学号" prefix-icon="User" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password prefix-icon="Lock" />
        </el-form-item>

        <el-row type="flex" justify="center">
          <el-button type="primary" @click="handleLogin" style="width: 200px;">
            登录
          </el-button>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import request from '@/utils/request.js'
import {customGet} from "@/utils/request.js";

const router = useRouter()
const loginFormRef = ref(null)

const handleLogin = async () => {
  console.log('handleLogin called'); // 调试信息

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Form validation passed'); // 调试信息
      try {
        const response = await request.post('/login/user', {
          userName: loginForm.userName,
          password: loginForm.password,
        });

        if (response.code === 200) {
          localStorage.setItem('token', response.token);

          const userInfoResponse = await customGet('/getInfo');
          console.log('UserInfo Response:', userInfoResponse); // 调试输出用户信息响应

          const userInfo = userInfoResponse;
          console.log('User Info:', userInfo); // 调试输出用户信息

          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          const roleKey = userInfo.user?.roles?.[0]?.roleKey || ''; // 使用可选链操作符防止报错
          if (roleKey==='teacher') {//更换为teacher身份则进入管理员界面
            ElMessage.success('管理员登录成功');
            router.push({
              path: '/admin-index',
              query: { userInfo: JSON.stringify(userInfo) }
            });
          } else if(roleKey==='student'){
            ElMessage.success('学生登录成功');
            router.push({
              path: '/index',
              query: { userInfo: JSON.stringify(userInfo) }
            });
          }
        } else {
          ElMessage.error(response.msg || '登录失败');
        }
      } catch (error) {
        console.error('Error:', error); // 调试输出错误信息
        ElMessage.error('登录失败：' + error.message);
      }
    } else {
      console.log('Form validation failed'); // 调试信息
    }
  });
}

const loginForm = reactive({
  userName: '',
  password: ''
})

const loginRules = {
  userName: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}
</script>

<style scoped>
.title {
  text-align: center;
  color: #707070;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/test5.jpg");
  background-size: cover;
}

.login-card {
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  box-sizing: border-box;
}

.card-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}
</style>
