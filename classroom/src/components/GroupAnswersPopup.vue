<template>
  <div class="popup-overlay" @click="close">
    <div class="popup-content" @click.stop>
      <div class="popup-header">
        <h2>Խումբ {{ groupId }}</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <div class="popup-body">
        <div class="analytics-section">
          <h3>Վիճակագրություն</h3>
          <div class="analytics-chart">
            <Pie :data="getGroupData(groupId)" :options="chartOptions" />
          </div>
          <div class="analytics-stats">
            <div class="stat">
              <span class="label">Ճիշտ</span>
              <span class="value">{{ getCorrectCount(groupId) }}</span>
            </div>
            <div class="stat">
              <span class="label">Սխալ</span>
              <span class="value">{{ getIncorrectCount(groupId) }}</span>
            </div>
            <div class="stat">
              <span class="label">Անվավեր</span>
              <span class="value">{{ getInvalidCount(groupId) }}</span>
            </div>
          </div>
        </div>

        <div class="answers-section">
          <h3>Ուսանողների պատասխաններ</h3>
          <div class="answers-list">
            <div v-for="answer in groupAnswers" :key="answer.questionId + answer.email" class="answer-item">
              <div class="answer-header">
                <span class="student-email">{{ answer.email }}</span>
                <span class="answer-status" :class="answer.status">{{ getStatusText(answer.status) }}</span>
              </div>
              <div class="answer-content">
                <p class="question-text">{{ getQuestionText(answer.questionId) }}</p>
                <p class="answer-text">{{ getAnswerText(answer) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';
import type { StudentAnswer, Question } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  groupId: string;
  answers: StudentAnswer[];
  questions: Question[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
};

const groupAnswers = computed(() => {
  return props.answers.filter(answer => answer.groupId === props.groupId);
});

const getGroupData = (groupId: string) => {
  const groupAnswers = props.answers.filter(a => a.groupId === groupId);
  const correct = groupAnswers.filter(a => a.status === 'correct').length;
  const incorrect = groupAnswers.filter(a => a.status === 'incorrect').length;
  const invalid = groupAnswers.filter(a => a.status === 'invalid').length;

  return {
    labels: ['Ճիշտ', 'Սխալ', 'Անվավեր'],
    datasets: [{
      data: [correct, incorrect, invalid],
      backgroundColor: ['#28a745', '#dc3545', '#ffc107']
    }]
  };
};

const getCorrectCount = (groupId: string) => {
  return props.answers.filter(a => a.groupId === groupId && a.status === 'correct').length;
};

const getIncorrectCount = (groupId: string) => {
  return props.answers.filter(a => a.groupId === groupId && a.status === 'incorrect').length;
};

const getInvalidCount = (groupId: string) => {
  return props.answers.filter(a => a.groupId === groupId && a.status === 'invalid').length;
};

const getStatusText = (status: string | undefined) => {
  if (!status) return 'Անպատասխան';
  switch (status) {
    case 'correct':
      return 'Ճիշտ է';
    case 'incorrect':
      return 'Սխալ է';
    case 'invalid':
      return 'Անվավեր է';
    default:
      return 'Անպատասխան';
  }
};

const getQuestionText = (questionId: string) => {
  const question = props.questions.find(q => q.id === questionId);
  return question?.content || '';
};

const getAnswerText = (answer: StudentAnswer) => {
  const question = props.questions.find(q => q.id === answer.questionId);
  if (!question) return '';

  if (question.type === 'quiz') {
    const selectedAnswer = question.answers?.find(a => a.id === answer.answer.answerId);
    return selectedAnswer?.content || '';
  } else if (question.type === 'text' || question.type === 'word-select') {
    return answer.answer.text || '';
  }
  
  return '';
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-header h2 {
  margin: 0;
  color: #225dca;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.popup-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.analytics-section {
  flex: 1;
  padding: 20px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.analytics-section h3 {
  color: #225dca;
  margin-bottom: 20px;
}

.analytics-chart {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.analytics-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

.stat {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat .label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat .value {
  display: block;
  color: #225dca;
  font-size: 18px;
  font-weight: bold;
}

.answers-section {
  flex: 2;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.answers-section h3 {
  color: #225dca;
  margin-bottom: 20px;
}

.answers-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.answer-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.student-email {
  font-weight: bold;
  color: #333;
}

.answer-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.answer-status.correct {
  background: #28a745;
  color: white;
}

.answer-status.incorrect {
  background: #dc3545;
  color: white;
}

.answer-status.invalid {
  background: #ffc107;
  color: #333;
}

.answer-content {
  color: #666;
}

.question-text {
  font-weight: bold;
  margin-bottom: 5px;
}

.answer-text {
  margin: 0;
}
</style> 