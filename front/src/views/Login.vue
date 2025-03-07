<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <!-- <template #header> -->
      <div class="card-header">
        <span class="title">个人成绩查询系统</span>
      </div>
      <!-- </template> -->

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


const router = useRouter()
const loginFormRef = ref(null)

const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await request.post('/login/user', {
          userName: loginForm.userName,
          password: loginForm.password,
        });

        console.log('Login Response:', response); // 调试输出登录响应

        if (response.code === 200) {
          // 假设后端返回的 token 在 response.token 字段中
          localStorage.setItem('token', response.token);

          const userInfoResponse = await request.get('/getInfo');
          console.log('UserInfo Response:', userInfoResponse); // 调试输出用户信息响应

          // 解析并使用userInfoResponse中的数据
          const userInfo = userInfoResponse.data || {};
          console.log('User Info:', userInfo); // 调试输出用户信息

          // 根据角色跳转
          const roles = userInfo.roles || [];
          if (roles.includes('admin')) {
            ElMessage.success('管理员登录成功');
            router.push('/admin-index');
          } else {
            ElMessage.success('学生登录成功');
            router.push('/index');
          }
        } else {
          ElMessage.error(response.msg || '登录失败');
        }
      } catch (error) {
        console.error('Error:', error); // 调试输出错误信息
        ElMessage.error('登录失败：' + error.message);
      }
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
  /* margin: 0px auto 30px auto; */
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
  background-image: url("../assets/test3.jpg");
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