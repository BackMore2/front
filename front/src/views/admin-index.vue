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
                <el-dialog
                    v-model="lookupDialogVisible"
                    title="学生成绩详情"
                    width="90%"
                    top="5vh"
                    destroy-on-close
                >
                  <admin-lookup :student-id="currentStudentId" @close="lookupDialogVisible = false" />
                </el-dialog>
              </el-form>

              <el-card shadow="hover" style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">绩点排名</div>
                </template>

                <el-table
                    :data="paginatedRankingData"
                    stripe
                    style="width: 100%"
                    v-loading="loading"
                >
                  <el-table-column label="排名" prop="rank" width="100" />
                  <el-table-column label="学号" prop="studentId" width="180" />
                  <el-table-column label="姓名" prop="name" width="150" />
                  <el-table-column label="平均绩点" prop="gpa" width="120">
                    <template #default="scope">
                      <el-tag type="success">{{ scope.row.gpa }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="scope">
                      <el-button
                          type="primary"
                          size="small"
                          @click="showStudentDetail(scope.row.studentId)"
                      >
                        查看
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <el-pagination    style="margin-top: 20px;"
                                  background
                                  layout="prev, pager, next, sizes"
                                  :page-sizes="[10, 20, 50]"
                                  :total="rankingData.length"
                                  v-model:current-page="currentPage"
                                  v-model:page-size="pageSize"
                />
              </el-card>
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
            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header>
                <div class="card-header">新增学生信息</div>
              </template>

              <el-button type="primary" @click="dialogVisible = true">新增学生</el-button>

              <el-dialog
                  v-model="dialogVisible"
                  title="新增学生信息"
                  width="500px"
                  height="400px"
              >
                <el-form
                    :model="form"
                    :rules="rules"
                    ref="studentForm"
                    label-width="80px"
                >
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入学生姓名" />
                  </el-form-item>
                  <el-form-item label="学号" prop="studentId">
                    <el-input v-model="form.studentId" placeholder="请输入学号" />
                  </el-form-item>
                  <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        show-password
                        placeholder="请输入密码"
                    />
                  </el-form-item>
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input
                        v-model="form.confirmPassword"
                        type="password"
                        show-password
                        placeholder="请再次输入密码"
                    />
                  </el-form-item>
                </el-form>

                <template #footer>
                  <el-button @click="dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="addStudent">确认添加</el-button>
                </template>
              </el-dialog>
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
                        @click="deleteAcademicYear(scope.row)"
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
import { ref,computed, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit } from '@element-plus/icons-vue'
import AdminLookup from './admin_Lookup.vue'
import request from "@/utils/request.js";
import  {ElCard} from "element-plus";
import {customGet} from "@/utils/request.js";
import { useRoute } from 'vue-router'
import router from "@/router/index.js";
const route = useRoute()
const lookupDialogVisible = ref(false)
const currentStudentId = ref('')
const userInfo = ref({})
const username = ref('管理员用户')

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

const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const studentForm = ref(null)

// 模拟排名数据（实际应来自接口）
const rankingData = ref([])
const getRankingData = async () => {
  try {
    const response = await customGet('/admin/getTotalStudentGradeRank');
    rankingData.value = response.data;
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    ElMessage.error('获取排名数据失败');
  }
};

// 计算分页数据
const paginatedRankingData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return rankingData.value.slice(start, end)
})

// 查看学生详情
const showStudentDetail = (id) => {
  currentStudentId.value = id
  lookupDialogVisible.value = true
}
// 查询相关
const studentId = ref('')
const searchStudent = async () => {
  if (!studentId.value) {
    ElMessage.warning('请输入学号');
    return;
  }
  try {
    const response = await customGet(`/grade/student/${studentId.value}`);
    currentStudentId.value = studentId.value;
    lookupDialogVisible.value = true;
    // 更新当前学生信息
    currentStudentInfo.value = response.data;
  } catch (error) {
    console.error('Error searching student:', error);
    ElMessage.error('查询学生信息失败');
  }
};

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
// 修改学年
const editAcademicYear = async (row) => {
  const editedYear = `${startYear.value}-${endYear.value} ${selectedSemester.value}`;

  try {
    await request.put('/academicYear/update', {
      id: row.id, // 假设每个学年都有一个唯一的id
      startYear: startYear.value,
      endYear: endYear.value,
      semester: selectedSemester.value
    });
    const index = academicYearsList.value.indexOf(row.fullYear);
    if (index !== -1) {
      academicYearsList.value[index] = editedYear;
    }
    ElMessage.success('学年信息修改成功');
  } catch (error) {
    console.error('Error updating academic year:', error);
    ElMessage.error('修改学年信息失败');
  }
};
// 删除学年
const deleteAcademicYear = async (row) => {
  try {
    await request.delete(`/academicYear/delete/${row.id}`); // 假设每个学年都有一个唯一的id
    const index = academicYearsList.value.indexOf(row.fullYear);
    if (index !== -1) {
      academicYearsList.value.splice(index, 1);
    }
    ElMessage.success('学年信息删除成功');
  } catch (error) {
    console.error('Error deleting academic year:', error);
    ElMessage.error('删除学年信息失败');
  }
};
const getAcademicYears = async () => {
  try {
    const response = await request.get('/academicYear/list');
    academicYearsList.value = response.data.map(year => ({
      id: year.id,
      fullYear: `${year.startYear}-${year.endYear} ${year.semester}`
    }));
  } catch (error) {
    console.error('Error fetching academic years:', error);
    ElMessage.error('获取学年信息失败');
  }
};

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
const handleSuccess = async (response, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file.raw);

    await request.post('/grade/manage/import', formData);
    ElMessage.success(`文件 ${file.name} 上传成功`);
  } catch (error) {
    console.error('Error uploading scores:', error);
    ElMessage.error(`文件 ${file.name} 上传失败`);
  }
};

// 上传失败
  const handleError = (err, file) => {
    ElMessage.error(`文件 ${file.name} 上传失败`)
  }
const dialogVisible = ref(false)
const form = ref({
  name: '',
  studentId: '',
  password: '',
  confirmPassword: ''
})

// 验证规则
const validatePassword = (rule, value, callback) => {
  if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ]
}

// 添加学生方法
const addStudent = async () => {
  studentForm.value.validate(async valid => {
    if (valid) {
      try {
        const gradeInfo = {
          studentId: form.value.studentId,
          courseName: '默认课程',
          score: 0,
          academicYear: `${startYear.value}-${endYear.value}`,
          semester: selectedSemester.value
        };

        await request.post('/grade/manage/add', gradeInfo);
        ElMessage.success('添加成功');
        studentForm.value.resetFields();
        dialogVisible.value = false;
      } catch (error) {
        console.error('Error adding student:', error);
        ElMessage.error('添加学生信息失败');
      }
    }
  });
};

const logout = async () => {
  try {
    // 调用后端退出登录接口
    await request.post('/logout')

    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')

    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    ElMessage.error('退出登录失败：' + error.message)
  }
}
onMounted(() => {
  // 获取用户信息
  const routeUserInfo = route.query.userInfo
  // 在获取用户信息后添加调试日志
  console.log('Admin userInfo:', userInfo.value)
  // 在onMounted中补充校验
  if (!userInfo.value.user) {
    ElMessage.warning('请先登录管理员账号')
    router.push('/login')
  }
  if (routeUserInfo) {
    userInfo.value = JSON.parse(routeUserInfo)
    localStorage.setItem('userInfo', routeUserInfo)
  } else {
    userInfo.value = JSON.parse(localStorage.getItem('userInfo') || '{}')
  }

  // 设置管理员名称
  username.value = userInfo.value.user?.userName || '管理员用户'

  // 原有初始化逻辑
  getRankingData()
  getAcademicYears()
})//生命周期钩子

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
:deep(.el-dialog__body) {
  padding: 20px;
  height: 80vh;
  overflow-y: auto;
}

.dashboard {
  height: auto;
  min-height: 600px;
}

.chart-container {
  margin-top: 30px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.el-pagination {
  justify-content: flex-end;
  padding: 15px 0;
}

/* 表格操作按钮样式 */
.el-button--small {
  padding: 6px 12px;
}
:deep(.el-dialog__body) {
  padding: 15px 20px;  /* 减少上下padding */
  max-height: 60vh;    /* 设置最大高度 */
  overflow-y: auto;
}
.el-form-item {
  margin-bottom: 18px;
}
</style>