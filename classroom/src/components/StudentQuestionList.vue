<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { timerService } from '../services/timer.service';
import { studentService } from '../services/student.service';
import StudentQuestion from './StudentQuestion.vue';
import type { Question, StudentAnswer, QuestionType } from '@/types';

const props = defineProps({
  groupIds: {
    type: Array as () => string[],
    required: true
  },
  topicId: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true
  }
});

const questions = ref<Question[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const timeUp = ref(false);
const allAnswers = ref<StudentAnswer[]>([]);
const showSummary = ref(false);
const currentQuestionIndex = ref(0);
const studentQuestionRef = ref<InstanceType<typeof StudentQuestion> | null>(null);

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);

const fetchQuestions = async () => {
  if (!props.groupIds.length) {
    questions.value = [];
    loading.value = false;
    return;
  }

  try {
    const params = {
      groupIds: props.groupIds.join(','),
      topicId: props.topicId
    };
    questions.value = await studentService.loadQuestions(params);
  } catch (err: unknown) {
    console.error('Error fetching questions:', err);
    error.value = 'Failed to fetch questions';
  } finally {
    loading.value = false;
  }
};

const fetchAnswers = async () => {
  try {
    const answers = await studentService.getAnswers();
    allAnswers.value = answers;
    showSummary.value = true;

    console.log(answers)
  } catch (error) {
    console.error('Error fetching answers:', error);
  }
};

const handleAnswerSubmit = async (answer: { questionId: string; answerId: string; type: QuestionType; tabChanged?: boolean; status?: string }) => {
  try {
    console.log('Submitting answer:', answer);
    const studentAnswer = {
      questionId: answer.questionId,
      answer: {
        type: answer.type,
        answerId: answer.answerId,
        tabChanged: answer.tabChanged,
        isCorrect: false
      },
      email: props.email,
      timestamp: Date.now(),
      groupId: props.groupIds[0]
    };
    
    const response = await studentService.submitAnswer(studentAnswer);
    allAnswers.value.push(response);

    if (isLastQuestion.value) {
      showSummary.value = true;
    } else {
      currentQuestionIndex.value++;
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
  }
};

const handleTimeUp = () => {
  timeUp.value = true;
  // Hide all question contents
  questions.value = questions.value.map(q => ({
    ...q,
    content: 'Time is up!',
    answers: []
  }));
};

const getAnswerForQuestion = (questionId: string) => {
  return allAnswers.value.find(answer => answer.questionId === questionId);
};

const getAnswerStatus = (questionId: string) => {
  const answer = getAnswerForQuestion(questionId);
  if (!answer) return 'unanswered';
  return answer.status;
};

const getAnswerStatusText = (questionId: string) => {
  const status = getAnswerStatus(questionId);
  switch (status) {
    case 'correct':
      return 'Ճիշտ է';
    case 'incorrect':
      return 'Սխալ է';
    case 'invalid':
      return 'Անվավեր է';
    default:
      return 'Չի պատասխանվել';
  }
};

const getCorrectAnswer = (questionId: string) => {
  const question = questions.value.find(q => q.id === questionId);
  if (!question) return '';
  return question.answers?.find(a => a.isCorrect)?.content || '';
};

const correctAnswersCount = computed(() => {
  return allAnswers.value.filter(answer => answer.status === 'correct').length;
});

const totalScore = computed(() => {
  return allAnswers.value.reduce((total, answer) => {
    const question = questions.value.find(q => q.id === answer.questionId);
    return total + (answer.status === 'correct' ? (question?.points || 0) : 0);
  }, 0);
});

const getStudentAnswerText = (questionId: string) => {
  const answer = getAnswerForQuestion(questionId);
  if (!answer) return '';
  
  const question = questions.value.find(q => q.id === questionId);
  if (!question) return '';

  if (question.type === 'quiz') {
    const selectedAnswer = question.answers?.find(a => a.id === answer.answer.answerId);
    return selectedAnswer?.content || '';
  } else if (question.type === 'text') {
    return answer.answer.text || '';
  } else if (question.type === 'word-select') {
    return answer.answer.text || '';
  }
  
  return '';
};

onMounted(async () => {
  await nextTick();
  fetchQuestions();
  timerService.start(handleTimeUp);
});

onUnmounted(() => {
  timerService.cleanup();
});
</script>

<template>
  <div class="question-list-container">
    <div class="timer">
      Time left: {{ Math.floor(timerService.getTimeLeft() / 60) }}:{{ (timerService.getTimeLeft() % 60).toString().padStart(2, '0') }}
    </div>

    <div v-if="loading" class="loading">
      Loading questions...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="questions.length === 0" class="no-questions">
      No questions available.
    </div>

    <template v-else>
      <div v-if="!showSummary">
        <StudentQuestion
          ref="studentQuestionRef"
          :question-list="[currentQuestion]"
          @submit="handleAnswerSubmit"
        />
      </div>
      <div v-else class="summary-container">
        <h2>Պատասխանների ամփոփում</h2>
        <div class="questions-summary">
          <div v-for="question in questions" :key="question.id" class="question-summary">
            <div class="question-content">
              <h3>{{ question.content }}</h3>
              <div class="answer-status" :class="getAnswerStatus(question.id)">
                {{ getAnswerStatusText(question.id) }}
              </div>
            </div>
            <div class="answer-details" v-if="getAnswerForQuestion(question.id)">
              <p>Ձեր պատասխանը: {{ getStudentAnswerText(question.id) }}</p>
              <p v-if="getAnswerForQuestion(question.id)?.status === 'incorrect'">
                Ճիշտ պատասխանը: {{ getCorrectAnswer(question.id) }}
              </p>
            </div>
          </div>
        </div>
        <div class="summary-stats">
          <div class="stat">
            <span class="label">Ճիշտ պատասխաններ</span>
            <span class="value">{{ correctAnswersCount }}</span>
          </div>
          <div class="stat">
            <span class="label">Ընդհանուր միավորներ</span>
            <span class="value">{{ totalScore }}</span>
          </div>
          <div class="stat">
            <span class="label">Ընդհանուր հարցեր</span>
            <span class="value">{{ questions.length }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.student-question-list {
  width: 100%;
  padding: 20px;
}

.timer {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #225dca;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
}

.loading, .error, .no-questions {
  text-align: center;
  padding: 40px;
  color: #666;
}

.summary-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-container h2 {
  color: #225dca;
  margin-bottom: 30px;
}

.questions-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.question-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #225dca;
}

.question-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-content h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  flex: 1;
}

.answer-status {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  margin-left: 15px;
}

.answer-status.correct {
  background: #28a745;
  color: white;
}

.answer-status.incorrect {
  background: #dc3545;
  color: white;
}

.answer-status.invalid {
  background: #ffc107;
  color: #333;
}

.answer-status.unanswered {
  background: #6c757d;
  color: white;
}

.answer-details {
  color: #666;
  font-size: 14px;
}

.answer-details p {
  margin: 5px 0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.stat {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat .label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat .value {
  display: block;
  color: #225dca;
  font-size: 24px;
  font-weight: bold;
}
</style> 