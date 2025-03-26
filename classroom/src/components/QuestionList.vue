<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

const questions = ref([]);
const loading = ref(true);
const error = ref(null);
const socket = ref(null);

const fetchQuestions = async () => {
  try {
    const response = await fetch('http://localhost:3000/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    questions.value = await response.json();
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching questions:', err);
  } finally {
    loading.value = false;
  }
};

const setupWebSocket = () => {
  console.log('Setting up WebSocket connection...');
  socket.value = io('http://localhost:3000/questions', {
    withCredentials: true
  });

  socket.value.on('connect', () => {
    console.log('WebSocket connected');
    socket.value.emit('join');
  });

  socket.value.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.value.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.value.on('questionCreated', (question) => {
    console.log('Received questionCreated event:', question);
    questions.value.push(question);
  });

  socket.value.on('questionUpdated', (updatedQuestion) => {
    console.log('Received questionUpdated event:', updatedQuestion);
    const index = questions.value.findIndex(q => q.id === updatedQuestion.id);
    if (index !== -1) {
      questions.value[index] = updatedQuestion;
    }
  });

  socket.value.on('questionDeleted', (questionId) => {
    console.log('Received questionDeleted event:', questionId);
    questions.value = questions.value.filter(q => q.id !== questionId);
  });
};

onMounted(() => {
  fetchQuestions();
  setupWebSocket();
});

onUnmounted(() => {
  if (socket.value) {
    console.log('Disconnecting WebSocket...');
    socket.value.disconnect();
  }
});
</script>

<template>
  <div class="question-list">
    <h2>Questions</h2>
    
    <div v-if="loading" class="loading">
      Loading questions...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available yet.
    </div>
    
    <div v-else class="questions">
      <div v-for="question in questions" :key="question.id" class="question-card">
        <h3>{{ question.content }}</h3>
        <p class="question-type">Type: {{ question.type }}</p>
        <div v-if="question.type === 'quiz'" class="quiz-info">
          <p>Correct Answer ID: {{ question.correctAnswerId }}</p>
          <div v-if="question.answers" class="answers">
            <p v-for="answer in question.answers" :key="answer.id">
              {{ answer.id }}. {{ answer.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-list {
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

h2 {
  color: #225dca;
  margin-bottom: 20px;
}

.loading, .error, .no-questions {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error {
  color: #dc3545;
}

.questions {
  display: grid;
  gap: 20px;
}

.question-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h3 {
  color: #333;
  margin-bottom: 10px;
}

.question-type {
  color: #666;
  font-size: 0.9em;
}

.quiz-info {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.answers {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.answers p {
  margin: 5px 0;
  color: #666;
}
</style> 