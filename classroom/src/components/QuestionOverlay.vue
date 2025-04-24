<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { timerService } from '../services/timer.service';

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['submit', 'close']);

const selectedAnswer = ref('');
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    const answer = {
      questionId: props.question.id,
      answerId: selectedAnswer.value,
      type: 'quiz'
    };

    emit('submit', answer);
    emit('close');
  } finally {
    isSubmitting.value = false;
  }
};

const handleTabChange = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    const answer = {
      questionId: props.question.id,
      answerId: selectedAnswer.value || 'wrong',
      type: 'quiz',
      tabChanged: true
    };

    emit('submit', answer);
    emit('close');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  timerService.setTabChangeCallback(handleTabChange);
});

onUnmounted(() => {
  timerService.setTabChangeCallback(null);
});
</script>

<template>
  <div class="overlay">
    <div class="overlay-content">
      <div class="question-header">
        <h2>{{ question.content }}</h2>
        <button class="close-btn" @click="emit('close')" :disabled="isSubmitting">×</button>
      </div>

      <div class="quiz-options">
        <div 
          v-for="option in question.answers" 
          :key="option.id"
          class="option"
          :class="{ selected: selectedAnswer === option.id }"
          @click="selectedAnswer = option.id"
        >
          {{ option.content }}
        </div>
      </div>

      <div class="actions">
        <button 
          class="submit-btn"
          @click="handleSubmit"
          :disabled="isSubmitting || !selectedAnswer"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.overlay-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quiz-options {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.option {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  background: #f0f7ff;
}

.option.selected {
  background: #225dca;
  color: white;
  border-color: #225dca;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background-color: #225dca;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1a4ba3;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 