<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';

const props = defineProps({
  groupId: {
    type: String,
    required: true
  },
  classId: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true
  }
});

const questions = ref([]);
const loading = ref(true);
const error = ref(null);
const socket = ref(null);
const selectedAnswers = ref({});
const textAnswers = ref({});

const fetchQuestions = async () => {
  if (!props.groupId) {
    questions.value = [];
    loading.value = false;
    return;
  }

  try {
    let url = 'http://localhost:3000/questions';
    const queryParams = new URLSearchParams();
    
    queryParams.append('groupId', props.groupId);
    
    if (props.classId) {
      queryParams.append('classId', props.classId);
    }

    const response = await fetch(`${url}?${queryParams.toString()}`);
    const fetchedQuestions = await response.json();

    // Get previously answered questions for this student
    const answersResponse = await fetch(`http://localhost:3000/answers/${props.email}`);
    const studentAnswers = await answersResponse.json();

	console.log(studentAnswers);
    
    // Mark questions as answered if they were previously answered
    questions.value = fetchedQuestions.map(question => {
      const wasAnswered = studentAnswers.some(answer => 
        answer.answer.questionId === question.id
      );
      return {
        ...question,
        answered: wasAnswered
      };
    });

	console.log(questions.value);
    
    // Initialize selected answers and text answers
    questions.value.forEach(question => {
      if (question.type === 'quiz') {
        selectedAnswers.value[question.id] = '';
      } else if (question.type === 'text') {
        textAnswers.value[question.id] = '';
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    error.value = 'Failed to fetch questions';
  } finally {
    loading.value = false;
  }
};

const handleAnswerSelect = (questionId: string, answerId: string) => {
  selectedAnswers.value[questionId] = answerId;
};

const handleTextAnswerChange = (questionId: string, event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  textAnswers.value[questionId] = target.value;
};

const handleSubmit = async (questionId: string) => {
  const question = questions.value.find(q => q.id === questionId);
  if (!question) return;

  try {
    // Validate answer
    if (question.type === 'quiz' && !selectedAnswers.value[questionId]) {
      alert('Please select an answer');
      return;
    }
    if (question.type === 'text' && !textAnswers.value[questionId]?.trim()) {
      alert('Please enter your answer');
      return;
    }

    // Submit answer through WebSocket
    const answer = {
      email: props.email,
      groupId: props.groupId,
      classId: props.classId,
      answer: question.type === 'quiz' 
        ? {
            questionId: question.id,
            answerId: selectedAnswers.value[questionId],
            type: 'quiz',
            isCorrect: question.answers.find(a => a.id === selectedAnswers.value[questionId])?.isCorrect || false
          }
        : {
            questionId: question.id,
            text: textAnswers.value[questionId],
            type: 'text'
          }
    };

    console.log('Emitting answer:', answer);
    socket.value.emit('submit-answer', answer);

    // Mark question as answered
    question.answered = true;
    
    // Clear the answer for this question
    if (question.type === 'quiz') {
      selectedAnswers.value[questionId] = '';
    } else {
      textAnswers.value[questionId] = '';
    }

    alert('Answer submitted successfully!');
  } catch (error) {
    console.error('Error submitting answer:', error);
    alert('Error submitting answer. Please try again.');
  }
};

const setupWebSocket = () => {
  console.log('Setting up WebSocket connection...');
  socket.value = io('http://localhost:3000/answers', {
    withCredentials: true
  });

  socket.value.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.value.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.value.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.value.on('questionCreated', (question) => {
    console.log('Received questionCreated event:', question);
    fetchQuestions();
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

watch([() => props.groupId, () => props.classId], () => {
  fetchQuestions();
}, { immediate: true });

onMounted(() => {
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
  <div class="student-question-list">
    <h2>Հարցեր</h2>

    <div v-if="loading" class="loading">
      Loading questions...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available for your group{{ classId ? ' and class' : '' }}.
    </div>

    <div v-else class="questions">
      <div v-for="question in questions" :key="question.id" class="question-card">
        <div class="question-header">
          <h3>{{ question.content }}</h3>
          <div class="question-type">
            {{ '[ ' + question.type + ' ]' }}
          </div>
        </div>

        <div class="question-content">
          <div v-if="question.type === 'quiz'" class="radio-group">
            <div v-for="answer in question.answers" :key="answer.id" class="answer-option">
              <input
                type="radio"
                :id="answer.id"
                :name="question.id"
                :value="answer.id"
                :disabled="question.answered"
                v-model="selectedAnswers[question.id]"
                @change="handleAnswerSelect(question.id, answer.id)"
              >
              <label :for="answer.id">{{ answer.content }}</label>
            </div>
          </div>

          <div v-else-if="question.type === 'text'" class="text-answer">
            <textarea
              :id="'text-' + question.id"
              v-model="textAnswers[question.id]"
              :disabled="question.answered"
              placeholder="Enter your answer here..."
              rows="4"
              @input="handleTextAnswerChange(question.id, $event)"
            ></textarea>
          </div>
        </div>

        <div class="submit-section">
          <button
            class="submit-btn"
            @click="handleSubmit(question.id)"
            :disabled="question.answered || 
              (question.type === 'quiz' && !selectedAnswers[question.id]) ||
              (question.type === 'text' && !textAnswers[question.id]?.trim())"
          >
            {{ question.answered ? 'Answered' : 'Submit Answer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-question-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #225dca;
  margin-bottom: 20px;
}

.loading,
.error,
.no-questions {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h3 {
  color: #333;
  margin: 0;
  flex: 1;
}

.question-type {
  color: #666;
  font-size: 14px;
}

.answer-option {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.answer-option:hover {
  background: #e9ecef;
}

.answer-option input[type="radio"] {
  width: auto;
}

.answer-option label {
  flex: 1;
  cursor: pointer;
}

.submit-section {
  margin-top: 20px;
  text-align: right;
}

.submit-btn {
  background-color: #225dca;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1a4ba3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.text-answer {
  margin-top: 10px;
}

.text-answer textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
}

.text-answer textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}
</style> 