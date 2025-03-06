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

            <!-- 学期概览 -->
            <el-card class="gpa-card" style="margin-top: 20px;">
              <template #header>
                <div class="card-header">
                  <span>学期概览</span>
                </div>
              </template>
              <div class="gpa-content">
                <div class="gpa-row">
                  <div class="gpa-item">
                    <span>平均分</span>
                    <strong>{{ arithmeticAvg }}</strong>
                  </div>
                  <div class="gpa-item">
                    <span>平均分排名</span>
                    <strong>{{ arithmeticAvgRank }}</strong>
                  </div>
                  <div class="gpa-item">
                    <span>加权平均分</span>
                    <strong>{{ weightedAvg }}</strong>
                  </div>
                </div>
                <div class="gpa-row">
                  <div class="gpa-item">
                    <span>加权平均排名</span>
                    <strong>{{ weightedAvgRank }}</strong>
                  </div>
                  <div class="gpa-item">
                    <span>平均绩点</span>
                    <strong>{{ gpa }}</strong>
                  </div>
                  <div class="gpa-item">
                    <span>绩点排名</span>
                    <strong>{{ gpaRank }}</strong>
                  </div>
                </div>
                <div class="gpa-row">
                  <div class="gpa-item">
                    <span>学分绩点</span>
                    <strong>{{ creditGpa }}</strong>
                  </div>
                  <div class="gpa-item">
                    <span>学分绩点排名</span>
                    <strong>{{ creditGpaRank }}</strong>
                  </div>
                  <div class="gpa-item">
                    <span>不及格门次</span>
                    <strong class="danger">{{ failedCourseCount }}/{{ courseCount }}</strong>
                  </div>
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

              <!-- 雷达图位置 -->
              <div class="chart-container">
                <div id="general-education-chart"></div>
                <div id="professional-education-chart"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {useRouter} from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts';
import { onBeforeUnmount } from 'vue';
import { nextTick } from 'vue';
import axios from 'axios'
import request from '@/utils/request.js'


const router = useRouter()
const chartInstances = ref([])

// 获取学生成绩的方法
const fetchStudentGrades = async () => {
  try {
    // 从本地存储获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const studentId = userInfo.user.userName // 假设用户名就是学号

    const response = await axios.get('/system/grade/list', {
      params: {
        studentId: studentId,
        academicYear: selectedSemester.value.split('-')[0],
        semester: selectedSemester.value.split('-')[1]
      },
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })

    const { studentCourseGradeList, studentTotalGradeList } = response.data.data

    // 转换课程成绩数据
    scoreData.value = studentCourseGradeList.map(course => ({
      semester: `${course.academicYear}-${course.semester}`,
      course: course.courseName,
      score: course.score,
      credit: course.credit,
      professionalRanking: course.ranking
    }))

    // 更新学期概览数据
    if (studentTotalGradeList && studentTotalGradeList.length > 0) {
      const totalGrade = studentTotalGradeList[0]
      arithmeticAvgRank.value = totalGrade.averageRanking || '未知'
      weightedAvgRank.value = totalGrade.weightedRanking || '未知'
      gpaRank.value = totalGrade.gpaRanking || '未知'
    }

    // 更新学期列表
    const uniqueSemesters = [...new Set(scoreData.value.map(item =>
        `${item.semester.split('-')[0]}-${item.semester.split('-')[1]}`
    ))]

    academicSemesters.value = uniqueSemesters.map(semester => ({
      value: semester,
      label: `${semester}学年`
    }))

    // 如果当前选择的学期不在列表中，默认选择最新学期
    if (!academicSemesters.value.some(s => s.value === selectedSemester.value)) {
      selectedSemester.value = academicSemesters.value[0]?.value || '2023-2024-1'
    }

  } catch (error) {
    ElMessage.error('获取成绩失败：' + error.message)
  }
}

// 在 onMounted 中调用获取成绩的方法
onMounted(() => {
  fetchStudentGrades()
  updateRadarCharts()
})

// 修改 filterScores 方法，触发成绩获取
const filterScores = () => {
  updateRadarCharts()
}

// 在script setup部分新增计算属性
// 课程门数（示例数据需要补充credit字段）
const courseCount = computed(() => filteredScoreData.value.length)

// 算术平均分（保留两位小数）
const arithmeticAvg = computed(() => {
  const total = filteredScoreData.value.reduce((sum, item) => sum + item.score, 0)
  return courseCount.value > 0 ? (total / courseCount.value).toFixed(2) : '0.00'
})

// 学分加权平均分（需要确保数据有credit字段）
const weightedAvg = computed(() => {
  const total = filteredScoreData.value.reduce((sum, item) =>
      sum + (item.score * item.credit), 0)
  const totalCredits = filteredScoreData.value.reduce((sum, item) => sum + item.credit, 0)
  return totalCredits > 0 ? (total / totalCredits).toFixed(2) : '0.00'
})

// 平均绩点（根据实际算法调整）
const gpa = computed(() => {
  // 示例算法：总绩点 / 课程数（需根据实际需求修改）
  const total = filteredScoreData.value.reduce((sum, item) => sum + item.credit, 0)
  return courseCount.value > 0 ? (total / courseCount.value).toFixed(2) : '0.00'
})

// 不及格门次（分数小于60）
const failedCourseCount = computed(() =>
    filteredScoreData.value.filter(item => item.score < 60).length
)

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

// 新增计算属性，用于分类通识课和专业课
const generalEducationCourses = computed(() => {
  return filteredScoreData.value.filter(item => item.course_category === '通识课');
});

const professionalCourses = computed(() => {
  return filteredScoreData.value.filter(item => item.course_category === '专业课');
});

const createRadarChart = (id, data, title) => {
  const chartDom = document.getElementById(id);
  if (!chartDom) return; // 新增：容器不存在时直接返回
  // 销毁已有实例
  const existingChart = echarts.getInstanceByDom(chartDom);
  if (existingChart) {
    existingChart.dispose();
  }
  if (!data || data.length === 0) { // 新增：空数据校验
    chartDom.innerHTML = ''; // 清空容器内容
    return;}
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: `${title} 成绩雷达图`
    },
    tooltip: {},
    radar: {
      indicator: data.map(item => ({
        name: item.course,
        max: item.score < 60 ? 200 : 100, // 动态设置最大值
        min: 0
      })),
      shape: 'polygon',
      axisLine: {
        lineStyle: {
          color: '#999' // 调整轴线颜色
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(92,185,66,0.2)', 'rgba(185,161,66,0.05)'] // 调整背景色
        }
      }
    },
    series: [{
      name: '成绩',
      type: 'radar',
      itemStyle: {
        color: '#42b983'
      },
      lineStyle: {
        width: 2,
        type: 'dashed'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(66, 185, 131, 0.8)'
          }, {
            offset: 1, color: 'rgba(66, 185, 131, 0.1)'
          }]
        }
      },
      data: [
        {
          value: data.map(item => item.score),
          name: '成绩分布'
        }
      ],
    }]

  };
  myChart.setOption(option);
  chartInstances.value.push(myChart);
};

onBeforeUnmount(() => {
  chartInstances.forEach(chart => chart.dispose());
});

const updateRadarCharts = async () => {
  await nextTick(); // 等待DOM更新
  const genEdCourses = generalEducationCourses.value;
  const profCourses = professionalCourses.value;

  createRadarChart('general-education-chart', genEdCourses, '通识课');
  createRadarChart('professional-education-chart', profCourses, '专业课');
};

onMounted(() => {
  updateRadarCharts();
});
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
}

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* 新增样式 */
.gpa-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.gpa-item {
  flex: 1;
  text-align: center;
  padding: 0 8px;
}

.danger {
  color: #f56c6c !important; /* 不及格门次使用红色强调 */
}

/* 调整原有样式 */
.gpa-card .gpa-content {
  display: block; /* 改为块级布局 */
}

.chart-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.chart-container > div {
  width: 48%;
  height: 400px; /* 适当增加高度 */
}

</style>