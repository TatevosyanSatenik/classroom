<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';

const questions = ref([]);
const loading = ref(true);
const error = ref(null);
const socket = ref(null);
const subjects = ref([]);
const selectedSubject = ref(null);
const topics = ref([]);
const selectedTopic = ref(null);

const fetchSubjects = async () => {
  try {
    const response = await fetch('http://localhost:3000/subjects');
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    subjects.value = await response.json();
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching subjects:', err);
  }
};

const fetchTopics = async (subjectId) => {
  try {
    const response = await fetch(`http://localhost:3000/subjects/${subjectId}/topics`);
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    topics.value = await response.json();
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching topics:', err);
  }
};

const fetchQuestions = async () => {
  if (!selectedTopic.value) return;
  
  try {
    const response = await fetch(`http://localhost:3000/questions?topicId=${selectedTopic.value}`);
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
    if (question.topicIds.includes(selectedTopic.value)) {
      questions.value.push(question);
    }
  });

  socket.value.on('questionUpdated', (updatedQuestion) => {
    console.log('Received questionUpdated event:', updatedQuestion);
    if (updatedQuestion.topicIds.includes(selectedTopic.value)) {
      const index = questions.value.findIndex(q => q.id === updatedQuestion.id);
      if (index !== -1) {
        questions.value[index] = updatedQuestion;
      }
    }
  });

  socket.value.on('questionDeleted', (questionId) => {
    console.log('Received questionDeleted event:', questionId);
    questions.value = questions.value.filter(q => q.id !== questionId);
  });
};

watch(selectedSubject, (newSubject) => {
  if (newSubject) {
    fetchTopics(newSubject);
    selectedTopic.value = null;
    questions.value = [];
  }
});

watch(selectedTopic, (newTopic) => {
  if (newTopic) {
    loading.value = true;
    fetchQuestions();
  }
});

onMounted(() => {
  fetchSubjects();
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
    <h2>Հարցում</h2>
    
    <div class="selection-container">
      <div class="select-group">
        <label for="subject">Առարկա</label>
        <select id="subject" v-model="selectedSubject">
          <option value="">Ընտրել առարկա</option>
          <option v-for="subject in subjects" :key="subject._id" :value="subject._id">
            {{ subject.name }}
          </option>
        </select>
      </div>

      <div class="select-group" v-if="selectedSubject">
        <label for="topic">Թեմա</label>
        <select id="topic" v-model="selectedTopic">
          <option value="">Ընտրել թեմա</option>
          <option v-for="topic in topics" :key="topic.name" :value="topic.name">
            {{ topic.name }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      Loading questions...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available for the selected topic.
    </div>
    
    <div v-else class="questions">
      <div v-for="question in questions" :key="question.id" class="question-card">
        <h3>{{ question.content }}</h3>
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

.selection-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.select-group {
  flex: 1;
}

.select-group label {
  display: block;
  margin-bottom: 5px;
  color: #051f4f;
}

.select-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

h2 {
  color: #051f4f;
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

.radio-group {
  margin-top: 15px;
}

.radio-group input[type="radio"] {
  margin-right: 10px;
}

.radio-group label {
  display: inline-block;
  margin-bottom: 10px;
  color: #666;
}
</style> 