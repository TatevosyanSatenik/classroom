<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';
import QuestionForm from './QuestionForm.vue';

const props = defineProps({
  groupIds: {
    type: Array as () => string[],
    required: true
  },
  classId: {
    type: String,
    default: null
  }
});

const questions = ref([]);
const answers = ref([]);
const loading = ref(true);
const error = ref(null);
const socket = ref(null);
const editingQuestion = ref(null);
const showEditForm = ref(false);

const fetchQuestions = async () => {
  if (!props.groupIds.length) {
    questions.value = [];
    loading.value = false;
    return;
  }

  try {
    const queryParams = new URLSearchParams();
    props.groupIds.forEach(groupId => {
      queryParams.append('groupId', groupId);
    });
    
    if (props.classId) {
      queryParams.append('classId', props.classId);
    }

    console.log(queryParams.toString());

    const response = await fetch(`http://localhost:3000/questions?${queryParams.toString()}`);
    const fetchedQuestions = await response.json();
    questions.value = fetchedQuestions;
    
    // Fetch answers for these questions
    await fetchAnswers();
  } catch (error) {
    console.error('Error fetching questions:', error);
    error.value = 'Failed to fetch questions';
  } finally {
    loading.value = false;
  }
};

const fetchAnswers = async () => {
  try {
    // Fetch answers for each group
    const answersPromises = props.groupIds.map(groupId => 
      fetch(`http://localhost:3000/answers/group/${groupId}`).then(res => res.json())
    );
    
    const groupAnswers = await Promise.all(answersPromises);
    // Flatten the array of arrays into a single array of answers
    answers.value = groupAnswers.flat();
  } catch (error) {
    console.error('Error fetching answers:', error);
  }
};

const getAnswersForQuestion = (questionId) => {
  return answers.value.filter(answer => answer.answer.questionId === questionId);
};

const handleDelete = async (questionId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/questions/${questionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete question');
    }
    questions.value = questions.value.filter(q => q.id !== questionId);
  } catch (err) {
    console.error('Error deleting question:', err);
  }
};

const handleEdit = (question) => {
  editingQuestion.value = question;
  showEditForm.value = true;
};

const handleUpdate = async (updatedQuestion) => {
  try {
    const response = await fetch(`http://localhost:3000/questions/${editingQuestion.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedQuestion),
    });

    if (!response.ok) {
      throw new Error('Failed to update question');
    }

    const updated = await response.json();
    const index = questions.value.findIndex(q => q.id === updated.id);
    if (index !== -1) {
      questions.value[index] = updated;
    }
    showEditForm.value = false;
    editingQuestion.value = null;
  } catch (err) {
    console.error('Error updating question:', err);
  }
};

const handleCancelEdit = () => {
  showEditForm.value = false;
  editingQuestion.value = null;
};

const setupWebSocket = () => {
  socket.value = io('http://localhost:3000/answers', {
    withCredentials: true
  });

  socket.value.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.value.on('new-answer', (answer) => {
    console.log('Received new answer:', answer);
    answers.value.push(answer);
  });
};

watch([() => props.groupIds, () => props.classId], () => {
  fetchQuestions();
}, { immediate: true });

onMounted(() => {
  fetchQuestions();
  setupWebSocket();
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<template>
  <div class="professor-question-list">
    <h2>Questions</h2>

    <div v-if="loading" class="loading">
      Loading questions...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available for the selected groups.
    </div>

    <div v-else class="questions">
      <div v-for="question in questions" :key="question.id" class="question-card">
        <div class="question-header">
          <h3>{{ question.content }}</h3>
          <div class="question-type">
            {{ '[ ' + question.type + ' ]' }}
          </div>
          <div class="question-actions">
            <button class="edit-btn" @click="handleEdit(question)">Edit</button>
            <button class="delete-btn" @click="handleDelete(question.id)">Delete</button>
          </div>
        </div>

        <div v-if="question.type === 'quiz'" class="question-options">
          <div v-for="option in question.answers" :key="option.id" class="option">
            {{ option.content }}
            <span v-if="option.isCorrect" class="correct-indicator">✓</span>
          </div>
        </div>

        <div class="answers-section">
          <h4>Answers</h4>
          <div v-if="getAnswersForQuestion(question.id).length === 0" class="no-answers">
            No answers yet
          </div>
          <div v-else class="answers-list">
            <div v-for="answer in getAnswersForQuestion(question.id)" :key="answer.timestamp" class="answer-item">
              <div class="answer-header">
                <span class="student-email">{{ answer.email }}</span>
                <span class="answer-time">{{ new Date(answer.timestamp).toLocaleTimeString() }}</span>
              </div>
              <div class="answer-content">
                <template v-if="answer.answer.type === 'quiz'">
                  <p>Selected answer: {{ question.answers.find(a => a.id === answer.answer.answerId)?.content }}</p>
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
    </div>

    <div v-if="showEditForm" class="edit-form-container">
      <QuestionForm 
        :question="editingQuestion"
        @submit="handleUpdate"
        @cancel="handleCancelEdit"
      />
    </div>
  </div>
</template>

<style scoped>
.professor-question-list {
  width: 100%;
  padding: 20px;
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

.answers-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.answers-section h4 {
  color: #225dca;
  margin-bottom: 15px;
}

.answers-list {
  display: grid;
  gap: 15px;
}

.answer-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
}

.answer-content {
  margin-top: 10px;
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
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.no-answers {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.edit-form-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 90%;
  max-width: 600px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #225dca;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.question-options {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.option {
  padding: 8px;
  margin-bottom: 5px;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.correct-indicator {
  color: #28a745;
  font-weight: bold;
}
</style>