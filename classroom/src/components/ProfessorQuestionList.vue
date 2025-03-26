<script setup lang="ts">
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

const handleDelete = async (questionId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/questions/${questionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete question');
    }
  } catch (err) {
    console.error('Error deleting question:', err);
  }
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
  <div class="professor-question-list">
    <h2>Your Questions</h2>
    
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
        <div class="question-header">
          <h3>{{ question.content }}</h3>
          <button class="delete-btn" @click="handleDelete(question.id)">Delete</button>
        </div>
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
.professor-question-list {
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

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

h3 {
  color: #333;
  margin: 0;
  flex: 1;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #c82333;
}

.question-type {
  color: #666;
  font-size: 0.9em;
  margin: 5px 0;
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