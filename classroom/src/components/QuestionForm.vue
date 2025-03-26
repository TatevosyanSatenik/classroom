<script setup>
import { ref } from 'vue';

const questionContent = ref('');
const questionType = ref('text');
const correctAnswerId = ref('');

const emit = defineEmits(['submit']);

const handleSubmit = () => {
  const question = {
    content: questionContent.value,
    type: questionType.value,
    ...(questionType.value === 'quiz' && { correctAnswerId: correctAnswerId.value })
  };
  emit('submit', question);
  
  // Reset form
  questionContent.value = '';
  questionType.value = 'text';
  correctAnswerId.value = '';
};
</script>

<template>
  <div class="question-form">
    <h2>Add New Question</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="content">Question Content:</label>
        <textarea
          id="content"
          v-model="questionContent"
          required
          placeholder="Enter your question..."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="type">Question Type:</label>
        <select id="type" v-model="questionType" required>
          <option value="text">Text</option>
          <option value="quiz">Quiz</option>
        </select>
      </div>

      <div class="form-group" v-if="questionType === 'quiz'">
        <label for="correctAnswer">Correct Answer ID:</label>
        <input
          id="correctAnswer"
          v-model="correctAnswerId"
          type="text"
          placeholder="Enter correct answer ID"
        />
      </div>

      <button type="submit" class="submit-btn">Add Question</button>
    </form>
  </div>
</template>

<style scoped>
.question-form {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #225dca;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

textarea, select, input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.submit-btn {
  background-color: #225dca;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #1a4ba3;
}
</style> 