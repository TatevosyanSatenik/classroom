<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { timerService } from '../services/timer.service';
import { studentService } from '../services/student.service';
import StudentQuestion from './StudentQuestion.vue';
import type { Question, StudentAnswer, QuestionType } from '@/types';

const props = defineProps({
  groupIds: {
    type: Array as () => string[],
    required: true
  },
  topicId: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true
  }
});

const questions = ref<Question[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const timeUp = ref(false);

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
    questions.value = await studentService.loadQuestions(params);
  } catch (err: unknown) {
    console.error('Error fetching questions:', err);
    error.value = 'Failed to fetch questions';
  } finally {
    loading.value = false;
  }
};

const handleAnswerSubmit = async (answer: { questionId: string; answerId: string; type: QuestionType; tabChanged?: boolean; status?: string }) => {
  try {
    console.log('Submitting answer:', answer);
    await studentService.submitAnswer({
      questionId: answer.questionId,
      answer: {
        type: answer.type,
        answerId: answer.answerId,
        tabChanged: answer.tabChanged,
        isCorrect: false // This will be determined by the backend
      },
      email: props.email,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
  }
};

const handleTimeUp = () => {
  timeUp.value = true;
  // Hide all question contents
  questions.value = questions.value.map(q => ({
    ...q,
    content: 'Time is up!',
    answers: []
  }));
};

onMounted(async () => {
  await nextTick();
  fetchQuestions();
  timerService.start(handleTimeUp);
});

onUnmounted(() => {
  timerService.cleanup();
});
</script>

<template>
  <div class="student-question-list">
    <div class="timer">
      Time left: {{ Math.floor(timerService.getTimeLeft() / 60) }}:{{ (timerService.getTimeLeft() % 60).toString().padStart(2, '0') }}
    </div>

    <div v-if="loading" class="loading">
      Loading questions...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available.
    </div>

    <StudentQuestion 
      v-else 
      :question-list="questions" 
      @submit="handleAnswerSubmit"
    />
  </div>
</template>

<style scoped>
.student-question-list {
  width: 100%;
  padding: 20px;
}

.timer {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #225dca;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
}

.loading, .error, .no-questions {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style> 