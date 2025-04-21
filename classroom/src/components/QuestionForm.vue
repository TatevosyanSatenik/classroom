<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const content = ref('');
const type = ref('quiz');
const answers = ref([
  { id: '1', content: '' },
  { id: '2', content: '' },
  { id: '3', content: '' },
  { id: '4', content: '' }
]);
const correctAnswerId = ref('1');

const resetForm = () => {
  content.value = '';
  type.value = 'quiz';
  answers.value = [
    { id: '1', content: '' },
    { id: '2', content: '' },
    { id: '3', content: '' },
    { id: '4', content: '' }
  ];
  correctAnswerId.value = '1';
};

const handleSubmit = () => {
  if (!content.value.trim()) {
    alert('Please enter a question');
    return;
  }

  if (type.value === 'quiz') {
    const emptyAnswers = answers.value.filter(a => !a.content.trim());
    if (emptyAnswers.length > 0) {
      alert('Please fill in all answer options');
      return;
    }
  }

  const questionData = {
    content: content.value,
    type: type.value,
    answers: type.value === 'quiz' ? answers.value : undefined,
    correctAnswerId: type.value === 'quiz' ? correctAnswerId.value : undefined
  };

  emit('submit', questionData);
  resetForm();
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

watch(() => props.question, (newQuestion) => {
  if (newQuestion) {
    content.value = newQuestion.content;
    type.value = newQuestion.type;
    if (newQuestion.answers) {
      answers.value = newQuestion.answers;
    }
    if (newQuestion.correctAnswerId) {
      correctAnswerId.value = newQuestion.correctAnswerId;
    }
  } else {
    resetForm();
  }
}, { immediate: true });
</script>

<template>
  <div class="question-form">
    <h2>{{ question ? 'Edit Question' : 'Add New Question' }}</h2>
    
    <div class="form-group">
      <label for="content">Question Content:</label>
      <textarea
        id="content"
        v-model="content"
        rows="3"
        placeholder="Enter your question here..."
        required
      ></textarea>
    </div>

    <div class="form-group">
      <label for="type">Question Type:</label>
      <select id="type" v-model="type">
        <option value="quiz">Quiz</option>
        <option value="text">Text</option>
      </select>
    </div>

    <div v-if="type === 'quiz'" class="answers-section">
      <h3>Answers</h3>
      <div v-for="answer in answers" :key="answer.id" class="answer-group">
        <input
          type="radio"
          :id="'correct-' + answer.id"
          v-model="correctAnswerId"
          :value="answer.id"
        >
        <input
          type="text"
          v-model="answer.content"
          :placeholder="'Answer option ' + answer.id"
          required
        >
      </div>
    </div>

    <div class="form-actions">
      <button class="submit-btn" @click="handleSubmit">
        {{ question ? 'Update Question' : 'Add Question' }}
      </button>
      <button class="cancel-btn" @click="handleCancel">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.question-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #225dca;
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

textarea,
select,
input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.answers-section {
  margin-top: 20px;
}

.answer-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.answer-group input[type="radio"] {
  width: auto;
}

.answer-group input[type="text"] {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
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

.cancel-btn {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #5a6268;
}
</style>