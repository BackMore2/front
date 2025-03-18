<template>
  <div class="student-data-view">
    <!-- 标题 -->
    <h1>学生体测数据</h1>

    <!-- 学生基本信息 -->
    <el-card class="student-info-card centered-card">
      <div class="student-info" style="text-align: center;">
        <p><strong>姓名:</strong> {{ studentInfo.name }}</p>
        <p><strong>学号:</strong> {{ studentInfo.studentId }}</p>
      </div>
    </el-card>

    <!-- 加载动画 -->
    <el-skeleton :loading="isLoading" animated>
      <template #template>
        <div class="card-container">
          <el-card v-for="i in 3" :key="i" class="data-card">
            <el-skeleton-item variant="text" style="width: 80%; height: 20px;" />
            <el-skeleton-item variant="text" style="width: 60%; height: 16px; margin-top: 10px;" />
            <el-skeleton-item variant="text" style="width: 100%; height: 100px; margin-top: 20px;" />
          </el-card>
        </div>
      </template>
      <template #default>
        <!-- 数据展示 -->
        <div class="card-container">
          <el-card v-for="(data, index) in allSemesterData" :key="index" class="data-card">
            <div class="card-header">
              <h3>第 {{ data.academicYear }}学年</h3>
            </div>
            <div class="card-body">
              <div class="info-group">
                <h4>体质总分与等级</h4>
                <p>体质总分：{{ data.totalGrade }}</p>
                <p><span class="score">体质等级：{{ data.level }}</span></p>
              </div>
              <div class="info-group">
                <h4>身体指标</h4>
                <p>身高：{{ data.height }} cm</p>
                <p>体重：{{ data.weight }} kg</p>
                <p><span class="score">BMI得分：{{ data.hwgrade }} 分</span></p>
              </div>
              <div class="info-group">
                <h4>体能测试</h4>
                <div class="test-item">
                  <span class="item-name">肺活量：</span>
                  <span class="item-value">{{ data.vitalCapacity}} ml</span>
                  <span class="score">得分：{{ data.vitalCapacityGrade }} 分</span>
                </div>
                <div class="test-item">
                  <span class="item-name">中长跑：</span>
                  <span class="item-value">{{ data.middleDistance}} min</span>
                  <span class="score">得分：{{ data.middleDistanceGrade }} 分</span>
                </div>
                <div class="test-item">
                  <span class="item-name">五十米：</span>
                  <span class="item-value">{{ data.run50m }} s</span>
                  <span class="score">得分：{{ data.run50mGrade }} 分</span>
                </div>
                <div class="test-item">
                  <span class="item-name">立定跳远：</span>
                  <span class="item-value">{{ data.standingLongJump }} m</span>
                  <span class="score">得分：{{ data.standingLongJumpGrade }} 分</span>
                </div>
                <div class="test-item">
                  <span class="item-name">体前屈：</span>
                  <span class="item-value">{{ data.sitReach }} cm</span>
                  <span class="score">得分：{{ data.sitReachGrade }} 分</span>
                </div>
                <div class="test-item">
                  <span class="item-name">仰卧引体：</span>
                  <span class="item-value">{{ data.situp }} 次</span>
                  <span class="score">得分：{{ data.situpGrade }} 分</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import { customGet } from "@/utils/request.js";
import {ElMessage} from "element-plus";
import {ref} from "vue";

const gradeData = ref({});

export default {
  props: {
    userName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      studentInfo: {
        name: '',
        studentId: ''
      },
      allSemesterData: [],
      isLoading: true
    };
  },
  methods: {
    async fetchDataForAllSemesters() {
      this.isLoading = true;
      try {
        const response = await customGet('/system/physical_grade/list', {
          params: {
            studentId: this.userName
          }
        });
        gradeData.value = response.data;
        console.log(gradeData.value[0]);
        if (gradeData.value) {
          this.studentInfo = {
            name: gradeData.value[0].userName,
            studentId: gradeData.value[0].studentId
          };
          this.allSemesterData = gradeData;
        } else {
          ElMessage.error('无记录');
        }
      } catch (error) {
        console.error('获取体测数据失败:', error);
        ElMessage.error('获取体测数据失败');
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.fetchDataForAllSemesters();
  }
};
</script>

<style scoped>
.student-data-view {
  font-family: 'Nunito', sans-serif;
  text-align: center;
  color: #2c3e50;
  padding: 20px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.centered-card {
  width: 80%;
  margin: 0 auto 20px;
  max-width: 600px;
}

.student-info p {
  margin: 5px 0;
  font-size: 16px;
  color: #555;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.data-card {
  width: 300px;
  border-radius: 15px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow: 10px 10px 20px #d9d9d9, -10px -10px 20px #ffffff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  margin-bottom: 20px;
}

.data-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.info-group {
  margin-bottom: 15px;
}

.info-group h4 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.info-group p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

.info-group .test-item {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 使子元素两端对齐 */
  margin-bottom: 5px;
}

.info-group .item-name {
  text-align: left; /* 左对齐 */
  flex: 1; /* 占据剩余空间 */
}

.info-group .item-value {
  margin-right: 20px;
}

.info-group .score {
  color: #c23a4e;
  font-weight: 500;
  text-align: right; /* 右对齐 */
  flex: 1; /* 占据剩余空间 */
}
</style>