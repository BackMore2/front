<template>
  <div class="dashboard">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>学生成绩查询系统</h2>
          <div class="user-info">
            <el-dropdown trigger="click">
              <div class="user-dropdown">
                <span class="username">{{ username }}</span>
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

      <el-main>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="year-select-card">
              <template #header>
                <div class="card-header">学期选择</div>
              </template>
              <el-select
                  v-model="selectedSemester"
                  placeholder="选择学期"
                  @change="filterScores"
                  style="width: 100%"
              >
                <el-option
                    v-for="semester in academicSemesters"
                    :key="semester.value"
                    :label="semester.label"
                    :value="semester.value"
                />
              </el-select>
            </el-card>


            <el-card class="gpa-card" style="margin-top: 20px;">
              <template #header>
                <div class="card-header">学期概览</div>
              </template>
              <div class="gpa-content">
                <div class="gpa-item">
                  <span>平均绩点</span>
                  <strong>{{ calculateGPA }}</strong>
                </div>
                <div class="gpa-item">
                  <span>总绩点</span>
                  <strong>{{ totalCredits }}</strong>
                </div>
                <div class="gpa-item">
                  <span>总排名</span>
                  <strong>{{ totalRanking }}</strong>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="18">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>
                    {{
                      academicSemesters.find(s => s.value === selectedSemester)?.label
                    }}学年成绩
                  </span>
                </div>
              </template>

              <el-table
                  :data="filteredScoreData"
                  stripe
                  style="width: 100%"
                  row-class-name="score-table-row"
              >
                <el-table-column prop="course" label="课程" width="180" />
                <el-table-column prop="score" label="成绩" width="180" align="center" />
                <el-table-column prop="professionalRanking" label="专业排名" width="180" align="center" />
                <el-table-column prop="credit" label="绩点" width="180" align="center" />
                <el-table-column label="成绩等级" align="center">
                  <template #default="scope">
                    <el-tag
                        :type="getScoreTag(scope.row.score)"
                        effect="plain"
                        size="small"
                    >
                      {{ getScoreLevel(scope.row.score) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('张同学')
const selectedSemester = ref('2023-2024-1')  // 修改为更精细的学期标识

const academicSemesters = ref([
  {
    value: '2023-2024-1',
    label: '2023-2024学年上半学期'
  },
  {
    value: '2023-2024-2',
    label: '2023-2024学年下半学期'
  },
  {
    value: '2022-2023-1',
    label: '2022-2023学年上半学期'
  },
  {
    value: '2022-2023-2',
    label: '2022-2023学年下半学期'
  }
])

const scoreData = ref([
  {
    semester: '2023-2024-1',
    course: '高等数学',
    score: 85,
    credit: 4.0,
    professionalRanking: '12/150'
  },
  {
    semester: '2023-2024-1',
    course: '大学英语',
    score: 92,
    credit: 3.0,
    professionalRanking: '3/150'
  },
  {
    semester: '2023-2024-2',
    course: '计算机网络',
    score: 88,
    credit: 3.5,
    professionalRanking: '8/150'
  },
  {
    semester: '2022-2023-2',
    course: '线性代数',
    score: 80,
    credit: 3.0,
    professionalRanking: '25/140'
  },
  {
    semester: '2022-2023-2',
    course: '数据结构',
    score: 90,
    credit: 4.0,
    professionalRanking: '6/140'
  },
])

const filteredScoreData = computed(() =>
    scoreData.value.filter(item => item.semester === selectedSemester.value)
)

const totalCredits = computed(() =>
    filteredScoreData.value.reduce((sum, item) => sum + item.credit, 0)
)

const calculateGPA = computed(() => {
  const totalWeightedScore = filteredScoreData.value.reduce(
      (sum, item) => sum + (item.score * item.credit), 0
  )
  return totalCredits.value > 0
      ? (totalWeightedScore / totalCredits.value).toFixed(2)
      : '0.00'
})

const totalRanking = ref('15/200')

const getScoreTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

const getScoreLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '及格'
  return '不及格'
}

const filterScores = () => {
  // 可以在这里添加额外的过滤逻辑
}

const logout = () => {
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
  background-color: #f5f5f5;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-dropdown .username {
  margin-left: 10px;
  margin-right: 10px;
  color: #409EFF;
}

.gpa-card .gpa-content {
  display: flex;
  justify-content: space-between;
}

.gpa-card .gpa-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gpa-card .gpa-item strong {
  font-size: 24px;
  color: #409EFF;
  margin-top: 10px;
}

.score-table-row {
  transition: all 0.3s ease;
}

.score-table-row:hover {
  background-color: #f0f9eb !important;
}
</style>