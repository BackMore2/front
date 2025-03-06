<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <!-- <template #header> -->
      <div class="card-header">
        <span class="title">个人成绩查询系统</span>
      </div>
      <!-- </template> -->

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px" class="form">
        <el-form-item label="学号" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入学号" prefix-icon="User" />
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

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/login', {
          username: loginForm.username,
          password: loginForm.password,
        })

        if (response.data.code === 200) {
          // 存储 token
          localStorage.setItem('token', response.data.token)

          // 获取用户信息
          const userInfoResponse = await axios.get('/getInfo', {
            headers: { 'Authorization': 'Bearer ' + response.data.token }
          })

          const userInfo = userInfoResponse.data
          localStorage.setItem('userInfo', JSON.stringify(userInfo))

          // 根据角色跳转
          const roles = userInfo.roles
          if (roles.includes('admin')) {
            ElMessage.success('管理员登录成功')
            router.push('/admin-index')
          } else {
            ElMessage.success('学生登录成功')
            router.push('/index')
          }
        } else {
          ElMessage.error(response.data.msg || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
      }
    }
  })
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
  background-image: url("../assets/login-background.jpg");
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