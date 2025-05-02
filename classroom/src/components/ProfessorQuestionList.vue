<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import QuestionForm from './QuestionForm.vue';
import { professorService } from '../services/professor.service';
import type { Question, StudentAnswer } from '@/types';
import AnalyticsChart from './AnalyticsChart.vue';
import { socketService } from '../services/socket.service';

const props = defineProps({
  groupIds: {
    type: Array as () => string[],
    required: true
  },
  topicId: {
    type: String,
    default: null
  }
});

const questions = ref<Question[]>([]);
const answers = ref<StudentAnswer[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const editingQuestion = ref<Question | null>(null);
const showEditForm = ref(false);
const selectedQuestion = ref<Question | null>(null);
const showAnalytics = ref(false);

const fetchQuestions = async () => {
  if (!props.groupIds.length) {
    questions.value = [];
    loading.value = false;
    return;
  }

  try {
    const params = {
      groupIds: props.groupIds.join(','),
      topicId: props.topicId
    };
    questions.value = await professorService.loadQuestions(params);
  } catch (err: unknown) {
    console.error('Error fetching questions:', err);
    error.value = 'Failed to fetch questions';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (questionId: string) => {
  try {
    await professorService.deleteQuestion(questionId);
    questions.value = questions.value.filter(q => q.id !== questionId);
  } catch (err) {
    console.error('Error deleting question:', err);
  }
};

const handleEdit = (question: Question) => {
  editingQuestion.value = question;
  showEditForm.value = true;
};

const handleUpdate = async (updatedQuestion: Partial<Question>) => {
  try {
    const updated = await professorService.updateQuestion(editingQuestion.value!.id, updatedQuestion);
    const index = questions.value.findIndex(q => q.id === updated.id);
    if (index !== -1) {
      questions.value[index] = updated;
    }
    showEditForm.value = false;
    editingQuestion.value = null;
  } catch (err) {
    console.error('Error updating question:', err);
  }
};

const handleCancelEdit = () => {
  showEditForm.value = false;
  editingQuestion.value = null;
};

const handleShowAnalytics = (question: Question) => {
  selectedQuestion.value = question;
  showAnalytics.value = true;
};

watch([() => props.groupIds, () => props.topicId], () => {
  console.log(props.groupIds, props.topicId);
  fetchQuestions();
}, { immediate: true });

onMounted(async () => {
  fetchQuestions();
  answers.value = await professorService.getAnswers('');
  
  // Connect to socket and listen for answers
  socketService.emit('professor-connect', 'professor@example.com');
  socketService.on('new-answer', async () => {
    answers.value = await professorService.getAnswers('');
  });
});

onUnmounted(() => {
  socketService.off('new-answer', () => {});
});
</script>

<template>
  <div class="professor-question-list">
    <h2>Questions</h2>

    <div v-if="loading" class="loading">
      Loading questions...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available for the selected groups.
    </div>

    <div v-else class="questions">
      <div v-for="question in questions" :key="question.id" class="question-card">
        <div class="question-header">
          <h3>{{ question.content }}</h3>
          <div class="question-meta">
            <div class="question-type">
              {{ '[ ' + question.type + ' ]' }}
            </div>
            <div class="question-points">
              {{ question.points }} points
            </div>
          </div>
          <div class="question-actions">
            <button class="edit-btn" @click="handleEdit(question)">Edit</button>
            <button class="delete-btn" @click="handleDelete(question.id)">Delete</button>
            <button class="analytics-btn" @click="handleShowAnalytics(question)">Analytics</button>
          </div>
        </div>

        <div v-if="question.type === 'quiz'" class="question-options">
          <div v-for="option in question.answers" :key="option.id" class="option">
            {{ option.content }}
            <span v-if="option.isCorrect" class="correct-indicator">✓</span>
          </div>
        </div>

        <div class="answers-section">
          <h4>Student Answers</h4>
          <div v-for="answer in answers.filter(a => a.questionId === question.id)" :key="answer.timestamp" class="answer">
            <div class="answer-header">
              <span class="student-email">{{ answer.email }}</span>
              <span class="answer-score">{{ answer.score }}/{{ answer.totalScore }}</span>
            </div>
            <div class="answer-content">
              {{ answer.answer.text || answer.answer.answerId }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditForm && editingQuestion" class="edit-form-container">
      <QuestionForm 
        :question="editingQuestion"
        @submit="handleUpdate"
        @cancel="handleCancelEdit"
      />
    </div>

    <div class="analytics-section">
      <h3>Overall Analytics</h3>
      <AnalyticsChart />
    </div>
  </div>
</template>

<style scoped>
.professor-question-list {
  width: 100%;
  padding: 20px;
}

.questions {
  display: grid;
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
  margin-bottom: 20px;
}

.answers-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.answers-section h4 {
  color: #225dca;
  margin-bottom: 15px;
}

.answer {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.student-email {
  color: #666;
}

.answer-score {
  color: #28a745;
  font-weight: bold;
}

.answer-content {
  color: #333;
}

.correct {
  color: #28a745;
  font-weight: bold;
}

.incorrect {
  color: #dc3545;
  font-weight: bold;
}

.text-answer {
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.no-answers {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.edit-form-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 90%;
  max-width: 600px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #225dca;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.analytics-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.analytics-btn:hover {
  background-color: #45a049;
}

.question-options {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.option {
  padding: 8px;
  margin-bottom: 5px;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.correct-indicator {
  color: #28a745;
  font-weight: bold;
}

.question-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.question-points {
  color: #225dca;
  font-weight: bold;
}

.analytics-section {
  margin-top: 40px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analytics-section h3 {
  margin-bottom: 20px;
  color: #225dca;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
</style>