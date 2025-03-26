<script setup>
import { ref } from 'vue';
import QuestionForm from './QuestionForm.vue';
import ProfessorQuestionList from './ProfessorQuestionList.vue';

const showForm = ref(false);

const handleQuestionSubmit = async (question) => {
  try {
    const response = await fetch('http://localhost:3000/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
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
</script>

<template>
  <div class="professor-page">
    <div class="header">
      <h1>Professor Dashboard</h1>
      <button class="add-question-btn" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'Add New Question' }}
      </button>
    </div>

    <div class="content">
      <div v-if="showForm" class="form-container">
        <QuestionForm @submit="handleQuestionSubmit" />
      </div>
      
      <div class="questions-container">
        <ProfessorQuestionList />
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

.form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.questions-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 