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
                      v-model="studentName"
                      placeholder="请输入学生姓名"
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
                    @close="closeLookupDialog"
                >
                  <admin-lookup :student-id="currentStudentId" />
                </el-dialog>
              </el-form>

              <el-card shadow="hover" style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">
                    <span>绩点排名</span>
                    <el-select v-model="selectedYear" placeholder="请选择学年" @change="filterRanking" style="width: 150px; margin-right: 10px;">
                      <el-option
                          v-for="year in academicYears"
                          :key="year.value"
                          :label="year.label"
                          :value="year.value"
                      />
                    </el-select>
                    <el-select v-model="selectedMajor" placeholder="请选择专业" @change="filterRanking" style="width: 150px; margin-right: 10px;">
                      <el-option
                          v-for="major in majors"
                          :key="major.value"
                          :label="major.label"
                          :value="major.value"
                      />
                    </el-select>
                  </div>
                </template>

                <el-table
                    :data="paginatedRankingData"
                    stripe
                    style="width: 100%"
                    v-loading="loading"
                >
                  <el-table-column label="排名" prop="avgGpaRank" width="180" />
                  <el-table-column label="学号" prop="studentId" width="180" />
                  <el-table-column label="姓名" prop="userName" width="180" />
                  <el-table-column label="平均绩点" prop="avgGpa" width="180">
                    <template #default="scope">
                      <el-tag type="success">{{ scope.row.avgGpa }}</el-tag>
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
            <!-- 导入学生成绩 -->
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">导入学生成绩</div>
              </template>

              <el-radio-group v-model="importType" style="margin-bottom: 20px;">
                <el-radio 
                  value="physical"
                  border 
                  class="radio-button" 
                  :class="{ 'active': importType === 'physical' }"
                  @click="handleRadioClick('physical')"
                >
                  导入体测
                </el-radio>
                <el-radio 
                  value="total"
                  border 
                  class="radio-button" 
                  :class="{ 'active': importType === 'total' }"
                  @click="handleRadioClick('total')"
                >
                  导入总成绩
                </el-radio>
                <el-radio 
                  value="course"
                  border 
                  class="radio-button" 
                  :class="{ 'active': importType === 'course' }"
                  @click="handleRadioClick('course')"
                >
                  导入课程成绩
                </el-radio>
              </el-radio-group>

              <el-upload
                  class="upload-demo"
                  drag
                  action=""
                  multiple
                  :on-change="handleFileUpload"
                  :file-list="fileList"
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
          </div>
        </transition>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref,computed, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import {ElLoading, ElMessage} from 'element-plus'
import { Search, Plus, Edit } from '@element-plus/icons-vue'
import AdminLookup from './admin_Lookup.vue'
import request, {secPost} from "@/utils/request.js";
import  {ElCard} from "element-plus";
import {customGet} from "@/utils/request.js";
import { useRoute } from 'vue-router'
import router from "@/router/index.js";
import {customPost} from "@/utils/request.js";


const route = useRoute()
const lookupDialogVisible = ref(false)
const currentStudentId = ref('')
const userInfo = ref({})
const username = ref('管理员用户')
const selectedYear=ref('20024-2025-1')
const importType = ref('course')

// 菜单项配置
const menuItems = [
  { index: 'query', label: '查询', icon: Search },
  { index: 'add', label: '增加', icon: Plus },
  { index: 'modify', label: '修改', icon: Edit }
]

const academicYears =[
  { value: '2024-2025-1', label: '2024-2025上半学期' },
  { value: '2023-2024-1', label: '2023-2024上半学期' },
  { value: '2023-2024-2', label: '2023-2024下半学期' }
];

const majors = [
  { value:'软件工程',label:'软件工程' },
  { value:'网络空间安全',label:'网络空间安全' },
  { value:'人工智能',label:'人工智能' }
];
// 活动菜单
const activeMenu = ref('query');

// 菜单选择处理
const handleMenuSelect = (index) => {
  activeMenu.value = index
}
const selectedMajor = ref(''); // 定义 selectedMajor
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const studentForm = ref(null);
const RData=ref([]);
// 排名数据（实际应来自接口）
const rankingData = ref([]);
const getRankingData = async () => {
  try {
    const response = await customGet('/admin/getTotalStudentGradeRank');
    rankingData.value=response.data;
    RData.value=response.data;
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    ElMessage.error('获取排名数据失败');
  }
};
// 计算分页数据
const paginatedRankingData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return rankingData.value.slice(start, end);
});

const filterRanking = () => {
  if (!rankingData.value || !Array.isArray(rankingData.value)) {
    console.error('rankingData is not defined or not an array');
    return;
  }
  rankingData.value = RData.value;

  // 根据学年和学期进行筛选
  const filteredData = rankingData.value.filter(item => {
    const matchesMajor = selectedMajor.value ? item.major === selectedMajor.value : true;
    const matchesYear = selectedYear.value ?
      item.academicYear === selectedYear.value.split('-')[0] + '-' + selectedYear.value.split('-')[1] : true;
    const matchesSemester = selectedYear.value ? 
      item.semester === selectedYear.value.split('-')[2] : true;
    console.log("查看的数据",item.academicYear,item.semester,item.major)
    return matchesMajor && matchesYear && matchesSemester;
  });

  rankingData.value = filteredData;
  currentPage.value = 1;
  pageSize.value = 10;
};

// 查看学生详情
const showStudentDetail = async (id) => {
  currentStudentId.value = id;
  lookupDialogVisible.value = true;
  await fetchStudentGrades();
};
// 关闭对话框时重置状态
const closeLookupDialog = () => {
  lookupDialogVisible.value = false;
  currentStudentId.value = '';
};

// 查询相关
const studentName = ref('')
const searchStudent = async () => {
  if (!studentName.value) {
    ElMessage.warning('请输入学生姓名');
    return;
  }
  try {
    rankingData.value = RData.value;
    const SData = rankingData.value.filter(item => {
      const matchesName = studentName.value ? item.userName === studentName.value : true;
      return matchesName;
    });
    rankingData.value = SData;
  } catch (error) {
    console.error('Error searching student:', error);
    ElMessage.error('查询学生信息失败');
  }
};

// 文件上传相关
const fileList = ref([])

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
  console.log("fileList",fileList.value)
  return true
}
// 上传成功
const handleSuccess = async (response, file) => {
  try {
    const formData = new FormData()
    formData.append('file', file.raw)
    console.log(formData)

    // 显示上传进度
    const loading = ElLoading.service({
      lock: true,
      text: '正在上传，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 调用后端接口
    const res = await customPost({
      url: apiUrl,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    loading.close()

    if (res.code === 200) {
      ElMessage.success('上传成功')
      // 清空文件列表
      fileList.value = []
      // 刷新数据
      getRankingData()
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败：' + error.message)
  }
}

// 上传失败
const handleError = (err, file) => {
  ElMessage.error(`文件 ${file.name} 上传失败：${err.message}`)
}

// 删除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
        const studentInfo = {
          studentId: form.value.studentId,
          password: form.value.password
        };

        await secPost('/admin/addStudentMessage', studentInfo);
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
var apiUrl = '';
const handleRadioClick = (type) => {
  importType.value = type;
  switch (importType.value) {
    case 'physical':
      apiUrl = '/system/physical_grade/import'; // 导入学生体测成绩
      break;
    case 'total':
      apiUrl = '/student/total_grade/import'; // 导入学生总成绩
      break;
    case 'course':
      apiUrl = '/student/course_grade/import'; // 导入学生课程成绩
      break;
  }
  console.log(apiUrl);
};

onMounted(() => {
  // 获取用户信息
  const routeUserInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  // 在获取用户信息后添加调试日志
  console.log('Admin userInfo:', userInfo.value)

  if (routeUserInfo) {
    userInfo.value = JSON.parse(routeUserInfo)
    localStorage.setItem('userInfo', routeUserInfo)
  } else {
    userInfo.value = JSON.parse(localStorage.getItem('userInfo') || '{}')
  }

  // 设置管理员名称
  username.value = userInfo.value.user?.userName || '管理员用户'

  // 原有初始化逻辑
  getRankingData();
  //getAcademicYears()
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

.radio-button {
  transition: all 0.3s ease;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.radio-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: #409eff;
}

.radio-button.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.radio-button.active:hover {
  background-color: #ffffff;
  border-color: #409eff;
}

</style>