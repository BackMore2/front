<template>
  <div class="dashboard">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>学生成绩查询系统</h2>
          <div class="user-info">
            <el-dropdown trigger="click">
              <div class="user-dropdown">
                <span class="userName">{{ userName }}</span>
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
            <!-- 查看体测数据按钮 -->
            <div class="physical-test-button">
              <el-button type="primary" @click="openPhysicalTest">查看体测数据</el-button>
            </div>
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

              <div v-if="scoreData.length > 0">
                <el-table
                    :data="scoreData"
                    stripe        style="width: 100%"
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
              </div>
              <div v-else class="no-data">
                <p>暂无成绩数据</p>
              </div>

              <!-- 雷达图位置 -->
              <div class="chart-container">
                <div id="general-education-chart"></div>
                <div id="professional-education-chart"></div>
              </div>
            </el-card>
            <!-- 体测数据对话框 -->
            <el-dialog
                v-model="physicalTestDialogVisible"
                title="学生体测数据"
                width="80%"
                top="5vh"
                destroy-on-close
            >
              <physical-test :userName="userName" />
            </el-dialog>
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
import {customGet} from "@/utils/request.js";
import PhysicalTest from './physical-test.vue'

//初始化数据
const router = useRouter()
const chartInstances = ref([])

const arithmeticAvgRank = ref('未知')  // 平均分排名
const weightedAvgRank = ref('未知')    // 加权平均排名
const gpaRank = ref('未知')            // 绩点排名
const creditGpa = ref('0.00')          // 平均学分绩点
const creditGpaRank = ref('未知')      // 平均学分绩点排名

const academicSemesters = ref([
  { value: '2024-2025-1', label: '2024-2025上半学期' },
  { value: '2023-2024-1', label: '2023-2024上半学期' },
  { value: '2023-2024-2', label: '2023-2024下半学期' } // 新增
]);
const scoreData =ref([]);
const genEdCourses = ref([]);
const profCourses = ref([]);
const selectedSemester = ref('2024-2025-1') // 初始化默认学期
const physicalTestDialogVisible = ref(false);

const openPhysicalTest = () => {
  physicalTestDialogVisible.value = true;
};

// 新增用户信息响应式变量
const userInfo = ref({})
const userName = ref('')
onMounted(() => {
  // 优先从路由参数获取
  const routeUserInfo = router.currentRoute.value.query.userInfo;
    try {
      // 使用 decodeURIComponent 解码 URL 编码的字符串
      const decodedUserInfo = decodeURIComponent(routeUserInfo);
      const parsedUserInfo = JSON.parse(decodedUserInfo);

      // 提取 user 部分并直接赋值给 userInfo
      userInfo.value = parsedUserInfo.user || {};

      localStorage.setItem('userInfo', decodedUserInfo);
    } catch (error) {
      console.error('Failed to parse userInfo:', error);
      userInfo.value = {}; // 设置默认值避免 undefined
    }
  // 设置用户名，使用可选链操作符防止访问 undefined
  userName.value = userInfo.value?.userName || '未知用户';
  // 动态设置默认学期为当前学年
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // 判断当前学期（1月-6月为上半学年，7月-12月为下半学年）
  const currentSemester = currentMonth >= 1 && currentMonth <= 6 ? '1' : '2'

  // 设置默认学期
  selectedSemester.value = `${currentYear-1}-${currentYear}-${currentSemester}`

  // 原有的数据获取逻辑
  fetchStudentGrades()
  updateRadarCharts()
})//生命周期钩子

const fetchStudentGrades = async () => {
  try {
    const studentId = userName.value;

    const response = await customGet('/system/grade/list', {
      params: {
        studentId: studentId,
        academicYear: selectedSemester.value.split('-')[0] + '-' + selectedSemester.value.split('-')[1],
        semester: selectedSemester.value.split('-')[2]
      },
      headers: {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/x-www-form-urlencoded' // 添加 Content-Type 头部
      }
    });
    const studentCourseGradeList = [
      ...response.data.studentCourseGradeList, // 通识课
      ...response.data.studentCourseGradeListother // 专业课
    ];
    genEdCourses.value = response.data.studentCourseGradeList;
    profCourses.value = response.data.studentCourseGradeListother;
    const studentTotalGradeList = response.data.studentTotalGradeList;
    scoreData.value = studentCourseGradeList.map(course => ({
      semester: `${course.academicYear}-${course.semester}`,
      course: course.courseName,
      score: course.highestScore,
      credit: course.gpa, // 假设 gpa 字段代表学分绩点
      professionalRanking: course.gpaRank || '未知',
      courseCategory: course.courseCategory // 后端返回的课程类别字段
    }));
    if (studentTotalGradeList && studentTotalGradeList.length > 0) {
      const totalGrade = studentTotalGradeList[0];
      arithmeticAvgRank.value = totalGrade.arithmeticAvgRank || '未知';
      weightedAvgRank.value = totalGrade.weightedAvgRank || '未知';
      gpaRank.value = totalGrade.avgGpaRank || '未知';
      creditGpa.value = totalGrade.creditGpa.toFixed(2);
      creditGpaRank.value = totalGrade.creditGpaRank || '未知';
    }

    const uniqueSemesters = [...new Set(scoreData.value.map(item =>
      `${item.semester.split('-')[0]}-${item.semester.split('-')[1]}`))];

    academicSemesters.value = uniqueSemesters.map(semester => ({
      value: semester,
      label: `${semester}学年`
    }));

    if (!academicSemesters.value.some(s => s.value === selectedSemester.value)) {
      selectedSemester.value = academicSemesters.value[0]?.value || '2024-2025-1';
    }

    filterScores(); // 触发成绩过滤
  } catch (error) {
    ElMessage.error('获取成绩失败：' + error.message);
  }
};

// 算术平均分（保留两位小数）
const arithmeticAvg = computed(() => {
  const total = scoreData.value.reduce((sum, item) => sum + item.score, 0);
  return courseCount.value > 0 ? (total / courseCount.value).toFixed(2) : '0.00';
});

// 学分加权平均分（需要确保数据有credit字段）
const weightedAvg = computed(() => {
  const total = scoreData.value.reduce((sum, item) => sum + (item.score * item.credit), 0);
  const totalCredits = scoreData.value.reduce((sum, item) => sum + item.credit, 0);
  return totalCredits > 0 ? (total / totalCredits).toFixed(2) : '0.00';
});

// 平均绩点（根据实际算法调整）
const gpa = computed(() => {
  const total = scoreData.value.reduce((sum, item) => sum + item.credit, 0);
  return courseCount.value > 0 ? (total / courseCount.value).toFixed(2) : '0.00';
});

// 修改 filterScores 方法，触发成绩获取
const filterScores = async () => {
  await nextTick();
  updateRadarCharts();
};
//更新相关计算属性
// 课程门数（示例数据需要补充credit字段）
const courseCount = computed(() => scoreData.value.length);
// 不及格门次（分数小于60）
const failedCourseCount = computed(() =>
  scoreData.value.filter(item => item.score < 60).length
);
const getScoreTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
};

const getScoreLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '及格'
  return '不及格'
};

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
    return;
  }
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: `${title} 成绩雷达图`
    },
    tooltip: {},
    radar: {
      indicator: data.map(item => ({
        name: item.courseName,
        max: item.highestScore < 60 ? 200 : 100, // 动态设置最大值
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
          value: data.map(item => item.highestScore),
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
  if (genEdCourses.value && genEdCourses.value.length > 0) {
    createRadarChart('general-education-chart', genEdCourses.value, '通识课');
  }
  if (profCourses.value && profCourses.value.length > 0) {
    createRadarChart('professional-education-chart', profCourses.value, '专业课');
  }
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
};
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

.user-dropdown .userName {
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
.physical-test-button {
  margin-bottom: 20px;
  text-align: center;
}
.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}
</style>