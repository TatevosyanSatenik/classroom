<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import QuestionForm from './QuestionForm.vue';
import ProfessorQuestionList from './ProfessorQuestionList.vue';
import YearGroupTree from './YearGroupTree.vue';
import { io } from 'socket.io-client';
import { getUser } from '../utils';

const user = getUser();
const userEmail = user?.email;

const showForm = ref(false);
const selectedGroups = ref([]);
const allYears = ref([]);
const years = ref([]);
const socket = ref(null);
const newAnswers = ref([]);
const subjects = ref([]);
const selectedSubject = ref(null);
const selectedTopic = ref(null);

const fetchSubjects = async () => {
  try {
    const response = await fetch('http://localhost:3000/subjects');
    subjects.value = await response.json();
    if (subjects.value.length > 0) {
      selectedSubject.value = subjects.value[0];
    }
  } catch (error) {
    console.error('Error fetching subjects:', error);
  }
};

const fetchYears = async () => {
  try {
    const response = await fetch('http://localhost:3000/years');
    allYears.value = await response.json();
    years.value = allYears.value;
  } catch (error) {
    console.error('Error fetching years:', error);
  }
};

const fetchExistingAnswers = async () => {
  try {
    const response = await fetch('http://localhost:3000/answers');
    const existingAnswers = await response.json();
    newAnswers.value = existingAnswers;
  } catch (error) {
    console.error('Error fetching existing answers:', error);
  }
};

const handleGroupsSelect = (groups) => {
  selectedGroups.value = groups;
  console.log(selectedTopic.value);
};

const handleQuestionSubmit = async (question) => {
  if (selectedGroups.value.length === 0) {
    alert('Please select at least one group');
    return;
  }

  if (!selectedTopic.value) {
    alert('Please select a topic');
    return;
  }

  try {
    const questionWithGroups = {
      ...question,
      groupIds: selectedGroups.value,
      topicIds: [selectedTopic.value.id]
    };

    const response = await fetch('http://localhost:3000/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionWithGroups),
    });

    if (!response.ok) {
      throw new Error('Failed to add question');
    }

    console.log('Question added successfully');
    showForm.value = false;
  } catch (error) {
    console.error('Error adding question:', error);
  }
};

onMounted(() => {
  fetchYears();
  fetchExistingAnswers();
  fetchSubjects();
  
  // Connect to WebSocket server with namespace
  socket.value = io('http://localhost:3000/answers', {
    withCredentials: true
  });

  socket.value.on('connect', () => {
    console.log('WebSocket connected');
    // Register as professor
    socket.value.emit('professor-connect', userEmail);
  });

  socket.value.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  // Listen for new answers
  socket.value.on('new-answer', (answer) => {
    console.log('Received new answer:', answer);
    // Create a new array instead of pushing to the existing one
    newAnswers.value = [...newAnswers.value, answer];
  });
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<template>
  <div class="professor-page">
    <div class="content">
      <div class="header">
        <h1>Professor Dashboard</h1>
        <button class="add-question-btn" @click="showForm = !showForm">
          {{ showForm ? 'Չեղարկել' : 'Ավելացնել հարցումներ' }}
        </button>
      </div>

      <div class="subject-topic-selector">
        <div class="selector-group">
          <h2>Select Subject</h2>
          <select v-model="selectedSubject" @change="selectedTopic = null">
            <option v-for="subject in subjects" :key="subject.id" :value="subject">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div class="selector-group" v-if="selectedSubject">
          <h2>Select Topic</h2>
          <select v-model="selectedTopic">
            <option v-for="topic in selectedSubject.topics" :key="topic.id" :value="topic">
              {{ topic.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="layout">
        <div class="tree-container">
          <h2>Years and Groups</h2>
          <YearGroupTree :years="years" @select-groups="handleGroupsSelect" />
          <div v-if="selectedGroups.length > 0" class="selected-groups">
            <h3>Selected Groups:</h3>
            <ul>
              <li v-for="groupId in selectedGroups" :key="groupId">
                {{years.flatMap(y => y.groups).find(g => g.id === groupId)?.name}}
              </li>
            </ul>
          </div>
        </div>

        <div class="main-content">
          <div v-if="showForm" class="form-container">
            <QuestionForm @submit="handleQuestionSubmit" />
          </div>
          <div class="questions-container">
            <ProfessorQuestionList 
              :groupIds="selectedGroups" 
              :topicId="selectedTopic?.name" 
            />
          </div>
        </div>
      </div>

      <div class="new-answers-section" v-if="newAnswers.length > 0">
        <h3>New Answers</h3>
        <div v-for="answer in newAnswers" :key="answer.timestamp" class="answer-card">
          <div class="answer-header">
            <span class="student-email">{{ answer.email }}</span>
            <span class="answer-time">{{ new Date(answer.timestamp).toLocaleTimeString() }}</span>
          </div>
          <div class="answer-content">
            <template v-if="answer.answer.type === 'quiz'">
              <p>Selected answer: {{ answer.answer.answerId }}</p>
              <p :class="{ 'correct': answer.answer.isCorrect, 'incorrect': !answer.answer.isCorrect }">
                {{ answer.answer.isCorrect ? 'Correct' : 'Incorrect' }}
              </p>
            </template>
            <template v-else>
              <p>Text answer:</p>
              <p class="text-answer">{{ answer.answer.text }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.professor-page {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: #225dca;
  margin: 0;
}

.add-question-btn {
  background-color: #225dca;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.add-question-btn:hover {
  background-color: #1a4ba3;
}

.content {
  display: grid;
  gap: 30px;
}

.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.tree-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tree-container h2 {
  margin-top: 0;
  color: #225dca;
  margin-bottom: 20px;
}

.selected-groups {
  margin-top: 20px;
  padding: 10px;
  background: #f0f7ff;
  border-radius: 4px;
}

.selected-groups h3 {
  color: #225dca;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.selected-groups ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.selected-groups li {
  padding: 4px 0;
  color: #225dca;
}

.main-content {
  display: grid;
  gap: 30px;
}

.form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.questions-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.class-selector {
  margin-bottom: 20px;
}

.class-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

.class-selector h2 {
  color: #225dca;
  margin-bottom: 10px;
}

.new-answers-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.answer-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.answer-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.answer-content {
  margin-top: 0.5rem;
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
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.subject-topic-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.selector-group {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selector-group h2 {
  color: #225dca;
  margin: 0 0 10px 0;
  font-size: 16px;
}

.selector-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}
</style>