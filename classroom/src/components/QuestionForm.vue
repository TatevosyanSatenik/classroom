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

    <h2>Ավելացնել  հարցեր</h2>

	<div class="form-group">
        <label for="type">Առարկա:</label>
        <select id="type" v-model="questionType" required>
          <option value="text">Ծրագրավորման ոճեր և մեթոդներ</option>
          <option value="text">Ալգորիթմների տեսություն</option>
          <option value="text">Որոնման տեղեկատվական համակարգեր</option>
          <option value="text">Ծրագրավորման տեխնոլոգիա</option>
          <option value="text">Օպերացիոն համակարգեր</option>
          <option value="text">Ինֆորմատիկա</option>

			
		</select>
      </div>

	  <div class="form-group">
        <label for="type">Խումբ:</label>
        <select id="type" v-model="questionType" required>
          <option value="text">ՄՏՏ 319</option>
          <option value="text">ՄՏՏ 355</option>
          <option value="text">ՄՏՏ 320</option>
          <option value="text">ՄՏՏ 350</option>

			
		</select>
      </div>
	  <div class="form-group">
        <label for="type">Հարցի տիպը:</label>
        <select id="type" v-model="questionType" required>
          <option value="text">Տեքստային</option>
          <option value="quiz">Թեստային</option>
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

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="content">Հարցերի պատուհան:</label>
        <textarea
          id="content"
          v-model="questionContent"
          required
          placeholder="Մուտքագրել հարցը..."
        ></textarea>
      </div>


      <button type="submit" class="submit-btn">Ավելացնել</button>
    </form>

  </div>

</template>

<style scoped>
.question-form {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #09317b;
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