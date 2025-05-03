<template>
  <div class="analytics-container">
    <div class="group-selector">
      <h3>Ընտրել խումբ</h3>
      <div class="group-buttons">
        <button 
          v-for="groupId in groupsIds" 
          :key="groupId"
          :class="{ active: selectedGroupId === groupId }"
          @click="selectedGroupId = groupId"
        >
          {{ groupId }}
        </button>
      </div>
    </div>

    <GroupAnswersPopup
      v-if="selectedGroupId"
      :groupId="selectedGroupId"
      :answers="answers"
      :questions="questions"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';
import type { StudentAnswer, Question } from '@/types';
import { professorService } from '@/services/professor.service';
import GroupAnswersPopup from './GroupAnswersPopup.vue';

ChartJS.register(ArcElement, Tooltip, Legend);

const answers = ref<StudentAnswer[]>([]);
const questions = ref<Question[]>([]);
const groupsIds = ref<string[]>([]);
const selectedGroupId = ref<string>('');

const loadData = async () => {
  try {
    const [fetchedAnswers, fetchedQuestions] = await Promise.all([
      professorService.getAnswers(),
      professorService.loadQuestions({ groupIds: '', topicId: '' }),
    ]);
    
    if (fetchedAnswers && fetchedAnswers.length > 0) {
      answers.value = fetchedAnswers;

      fetchedAnswers.forEach(a => {
        if (!groupsIds.value.includes(a.groupId)) {
          groupsIds.value.push(a.groupId);
        }
      });
    }
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      questions.value = fetchedQuestions;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const handleClose = () => {
  console.log('close');
  selectedGroupId.value = '';
};

onMounted(() => {
  loadData();
  professorService.onStudentAnswer((answer: StudentAnswer) => {
    answers.value.push(answer);
  });
});
</script>

<style scoped>
.analytics-container {
  width: 100%;
  padding: 20px;
}

.group-selector {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.group-selector h3 {
  color: #225dca;
  margin-bottom: 15px;
}

.group-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.group-buttons button {
  padding: 8px 16px;
  border: 1px solid #225dca;
  border-radius: 4px;
  background: white;
  color: #225dca;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.group-buttons button:hover {
  background: #f0f7ff;
}

.group-buttons button.active {
  background: #225dca;
  color: white;
}
</style>