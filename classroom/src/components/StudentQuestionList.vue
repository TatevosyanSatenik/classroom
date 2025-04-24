<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { timerService } from '../services/timer.service';
import QuestionOverlay from './QuestionOverlay.vue';

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

const questions = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedQuestion = ref(null);
const showOverlay = ref(false);
const timeUp = ref(false);

const fetchQuestions = async () => {

  console.log(props.groupIds);

  if (!props.groupIds.length) {
    questions.value = [];
    loading.value = false;
    return;
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append('groupIds', props.groupIds.join(','));
    
    if (props.topicId) {
      queryParams.append('topicId', props.topicId);
    }

    const response = await fetch(`http://localhost:3000/questions?${queryParams.toString()}`);
    const fetchedQuestions = await response.json();
    questions.value = fetchedQuestions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    error.value = 'Failed to fetch questions';
  } finally {
    loading.value = false;
  }
};

const handleQuestionClick = (question) => {
  if (timeUp.value) return;
  selectedQuestion.value = question;
  showOverlay.value = true;
};

const handleAnswerSubmit = async (answer) => {
  try {

    console.log(answer);

    const response = await fetch('http://localhost:3000/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: selectedQuestion.value.id,
        answer,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }

    // Remove the answered question from the list
    questions.value = questions.value.filter(q => q.id !== selectedQuestion.value.id);
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

    <div v-else class="questions">
      <div 
        v-for="question in questions" 
        :key="question.id" 
        class="question-card"
        @click="handleQuestionClick(question)"
      >
        <div class="question-content">
          Click to answer
        </div>
        <div class="question-type">
          {{ '[ ' + question.type + ' ]' }}
        </div>
      </div>
    </div>

    <QuestionOverlay
      v-if="showOverlay"
      :question="selectedQuestion"
      @submit="handleAnswerSubmit"
      @close="showOverlay = false"
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

.questions {
  display: grid;
  gap: 20px;
  margin-top: 60px;
}

.question-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.question-card:hover {
  transform: translateY(-2px);
}

.question-content {
  margin-bottom: 10px;
  font-size: 16px;
}

.question-type {
  color: #666;
  font-size: 14px;
}

.loading, .error, .no-questions {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style> 