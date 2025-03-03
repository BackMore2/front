<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>想知道你的成绩吗？</span>
        </div>
      </template>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
      >
        <el-form-item label="学号" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入学号"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              @click="handleLogin"
              style="width: 100%;"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

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


const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      // 区分管理员和学生登录，到时候对接前端再做修改
      if (loginForm.username === 'admin' && loginForm.password === '123456') {
        ElMessage.success('管理员登录成功')
        router.push('/admin-index')
      } else if (loginForm.username === 'student' && loginForm.password === '123456') {
        ElMessage.success('学生登录成功')
        router.push('/index')
      } else {
        ElMessage.error('账号或密码错误')
      }
    }
  })
}

</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.card-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>