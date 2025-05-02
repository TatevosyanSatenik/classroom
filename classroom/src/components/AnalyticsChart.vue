<template>
  <div class="analytics-container">
    <div class="question-list">
      <div v-for="question in questions" :key="question.id" class="question-card">
        <div class="question-header">
          <h4>{{ question.content }}</h4>
        </div>
        <div class="question-chart">
          <Pie :data="getQuestionData(question.id)" :options="chartOptions" />
        </div>
        <div class="question-stats">
          <div class="stat">
            <span class="label">Ճիշտ</span>
            <span class="value">{{ getCorrectCount(question.id) }}</span>
          </div>
          <div class="stat">
            <span class="label">Սխալ</span>
            <span class="value">{{ getIncorrectCount(question.id) }}</span>
          </div>
          <div class="stat">
            <span class="label">Անվավեր</span>
            <span class="value">{{ getInvalidCount(question.id) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';
import type { StudentAnswer, Question } from '@/types';
import { professorService } from '@/services/professor.service';
import { socketService } from '@/services/socket.service';

ChartJS.register(ArcElement, Tooltip, Legend);

const answers = ref<StudentAnswer[]>([]);
const questions = ref<Question[]>([]);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
};

const loadData = async () => {
  try {
    const [fetchedAnswers, fetchedQuestions] = await Promise.all([
      professorService.getAnswers(),
      professorService.loadQuestions({ groupIds: '', topicId: '' })
    ]);
    
    if (fetchedAnswers && fetchedAnswers.length > 0) {
      answers.value = fetchedAnswers;
    }
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      questions.value = fetchedQuestions;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const getQuestionData = (questionId: string) => {
  const questionAnswers = answers.value.filter(a => a.questionId === questionId);
  const correct = questionAnswers.filter(a => a.status === 'correct').length;
  const incorrect = questionAnswers.filter(a => a.status === 'incorrect').length;
  const invalid = questionAnswers.filter(a => a.status === 'invalid').length;

  return {
    labels: ['Ճիշտ', 'Սխալ', 'Անվավեր'],
    datasets: [{
      data: [correct, incorrect, invalid],
      backgroundColor: ['#4CAF50', '#F44336', '#FF9800']
    }]
  };
};

const getCorrectCount = (questionId: string) => {
  return answers.value.filter(a => a.questionId === questionId && a.status === 'correct').length;
};

const getIncorrectCount = (questionId: string) => {
  return answers.value.filter(a => a.questionId === questionId && a.status === 'incorrect').length;
};

const getInvalidCount = (questionId: string) => {
  return answers.value.filter(a => a.questionId === questionId && a.status === 'invalid').length;
};

onMounted(() => {
  loadData();
  console.log(answers.value);
  console.log(questions.value);
  socketService.on('new-answer', loadData);
});

onUnmounted(() => {
  socketService.off('new-answer', loadData);
});
</script>

<style scoped>
.analytics-container {
  width: 100%;
  padding: 20px;
}

.question-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.question-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.points {
  color: #225dca;
  font-weight: bold;
}

.question-chart {
  height: 150px;
  margin-bottom: 15px;
}

.question-stats {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  font-size: 12px;
  color: #666;
}

.stat .value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

:deep(.chartjs-render-monitor) {
  width: 100% !important;
  height: 100% !important;
}
</style> 