<template>
  <div class="admin-dashboard">
    <el-container>
      <el-header class="custom-header">
        <div class="header-left">
          <h2>学生成绩管理系统</h2>
        </div>

        <div class="header-center">
          <div class="menu-container">
            <div
                v-for="item in menuItems"
                :key="item.index"
                class="menu-item"
                :class="{ 'active': activeMenu === item.index }"
                @click="handleMenuSelect(item.index)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <el-dropdown trigger="click">
              <div class="user-dropdown">
                <span class="username">管理员</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="user">个人信息</el-dropdown-item>
                  <el-dropdown-item icon="setting">系统设置</el-dropdown-item>
                  <el-dropdown-item icon="switch-button" @click="logout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- 主内容区域 -->
      <el-main>
        <transition name="fade" mode="out-in">
          <div v-if="activeMenu === 'query'" key="query" class="content-section">
            <!-- 查询页面内容 -->
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">学生成绩查询</div>
              </template>

              <el-form :inline="true" class="query-form">
                <el-form-item label="学号">
                  <el-input
                      v-model="studentId"
                      placeholder="请输入学号"
                      clearable
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="searchStudent">查询</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>

        <!-- 增加页面 -->
          <div v-else-if="activeMenu === 'add'" key="add" class="content-section">
            <!-- 学年信息管理 -->
            <el-card shadow="hover" style="margin-bottom: 20px;">
              <template #header>
                <div class="card-header">学年信息管理</div>
              </template>

              <el-form :inline="true" class="academic-year-form">
                <el-form-item label="起始学年">
                  <el-input-number
                      v-model="startYear"
                      :min="2000"
                      :max="2050"
                      controls-position="right"
                  />
                </el-form-item>
                <el-form-item label="终止学年">
                  <el-input-number
                      v-model="endYear"
                      :min="2000"
                      :max="2050"
                      controls-position="right"
                  />
                </el-form-item>
                <el-form-item label="学期">
                  <el-select v-model="selectedSemester" placeholder="选择学期">
                    <el-option label="上半学年" value="上半学年" />
                    <el-option label="下半学年" value="下半学年" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="addAcademicYear">新增学年</el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 导入学生成绩 -->
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">导入学生成绩</div>
              </template>

              <el-upload
                  class="upload-demo"
                  drag
                  action="#"
                  multiple
                  :on-change="handleFileUpload"
                  :file-list="fileList"
                  :before-upload="beforeUpload"
                  :on-success="handleSuccess"
                  :on-error="handleError"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    仅支持 .xlsx、.xls 或 .csv 格式的文件
                  </div>
                </template>
              </el-upload>

              <!-- 上传文件列表 -->
              <el-table
                  v-if="fileList.length"
                  :data="fileList"
                  style="width: 100%; margin-top: 20px;"
              >
                <el-table-column prop="name" label="文件名" />
                <el-table-column prop="size" label="文件大小">
                  <template #default="scope">
                    {{ formatFileSize(scope.row.size) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button
                        type="danger"
                        size="small"
                        @click="removeFile(scope.$index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <div v-else-if="activeMenu === 'modify'" key="modify" class="content-section">
            <!-- 修改页面内容 -->
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">学年信息修改</div>
              </template>

              <el-table :data="academicYearsList" stripe style="width: 100%">
                <el-table-column prop="fullYear" label="学年" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button
                        size="small"
                        type="primary"
                        @click="editAcademicYear(scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                        size="small"
                        type="danger"
                        @click="deleteAcademicYear(scope.$index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </transition>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit } from '@element-plus/icons-vue'

// 菜单项配置
const menuItems = [
  { index: 'query', label: '查询', icon: Search },
  { index: 'add', label: '增加', icon: Plus },
  { index: 'modify', label: '修改', icon: Edit }
]

// 活动菜单
const activeMenu = ref('query')

// 菜单选择处理
const handleMenuSelect = (index) => {
  activeMenu.value = index
}

// 查询相关
const studentId = ref('')
const searchStudent = () => {
  // 查询逻辑
  console.log('查询学号:', studentId.value)
}

const editAcademicYear = (row) => {
  console.log('编辑学年:', row)
}

const deleteAcademicYear = (index) => {
  academicYearsList.value.splice(index, 1)
}
// 学年管理相关
const startYear = ref(new Date().getFullYear())
const endYear = ref(new Date().getFullYear() + 1)
const selectedSemester = ref('上半学年')
const academicYearsList = ref([])

// 文件上传相关
const fileList = ref([])

// 添加学年
const addAcademicYear = () => {
  if (startYear.value >= endYear.value) {
    ElMessage.error('起始学年必须小于终止学年')
    return
  }
  if (startYear.value - endYear.value>1) {
    ElMessage.error('学年间隔为1年')
    return
  }

  const newYear = `${startYear.value}-${endYear.value} ${selectedSemester.value}`

  // 检查是否重复
  const isDuplicate = academicYearsList.value.some(item => item === newYear)

  if (isDuplicate) {
    ElMessage.warning('该学年已存在')
    return
  }

  academicYearsList.value.push(newYear)
  ElMessage.success(`成功添加学年：${newYear}`)
}

// 文件上传相关方法
const handleFileUpload = (file) => {
  // 检查文件类型
  const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'].includes(file.raw.type)

  if (!isValidType) {
    ElMessage.error('只能上传 .xlsx, .xls 或 .csv 格式的文件')
    return false
  }

  fileList.value.push(file)
  return true
}

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 删除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

// 上传前校验
const beforeUpload = (file) => {
  const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'].includes(file.type)

  if (!isValidType) {
    ElMessage.error('只能上传 .xlsx, .xls 或 .csv 格式的文件')
    return false
  }}
// 上传成功
  const handleSuccess = (response, file) => {
    ElMessage.success(`文件 ${file.name} 上传成功`)
  }

// 上传失败
  const handleError = (err, file) => {
    ElMessage.error(`文件 ${file.name} 上传失败`)
  }
</script>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #f5f7fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left, .header-right {
  flex: 1;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.menu-container {
  display: flex;
  align-items: center;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: #606266;
}

.menu-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.menu-item.active {
  color: #409eff;
  font-weight: bold;
  position: relative;
}

.menu-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  background-color: #409eff;
}

.menu-item .el-icon {
  margin-right: 5px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.content-section {
  padding: 20px;
}
.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 25px;
  transition: background-color 0.3s ease;
}

.user-dropdown:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  margin-left: 10px;
  margin-right: 10px;
  font-weight: 500;
}
.upload-demo {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
  height: 200px;
}
</style>