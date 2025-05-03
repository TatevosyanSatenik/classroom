<template>
	<div class="question-container" v-if="question">
		<button class="previous-btn button" @click="previousQuestion" :disabled="currentQuestion === 0">Նախորդ հարց</button>
		<div class="question-content">
			<div class="question-header">
				<h2>{{ question.content }}</h2>
				<p>{{ question.points }} միավոր</p>
				<div class="question-index">
					{{ currentQuestion + 1 }} / {{ remainingQuestions.length }}
				</div>
			</div>

			<div class="quiz-options">
				<div v-for="option in question.answers" :key="option.id" class="option"
					:class="{ selected: selectedAnswer === option.id }" @click="selectedAnswer = option.id">
					{{ option.content }}
				</div>
			</div>

			<div class="actions">
				<button class="submit-btn" @click="handleSubmit" :disabled="isSubmitting || !selectedAnswer">
					{{ isSubmitting ? 'Ուղարկվում է...' : 'Ուղարկել ստուգման' }}
				</button>
			</div>
		</div>
		<button class="next-btn button" @click="nextQuestion" :disabled="currentQuestion === remainingQuestions.length - 1">Հաջորդ հարց</button>
	</div>
	<InvalidQuestionPopup :show="showInvalidPopup" @close="showInvalidPopup = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { timerService } from '../services/timer.service';
import type { Question, StudentAnswer } from '@/types';
import InvalidQuestionPopup from './InvalidQuestionPopup.vue';

const props = defineProps<{
	questionList: Question[];
}>();

const emit = defineEmits(['submit']);

const currentQuestion = ref<number>(0);
const selectedAnswer = ref('');
const isSubmitting = ref(false);
const showInvalidPopup = ref(false);
const answeredQuestionIds = ref<Set<string>>(new Set());
const answers = ref<StudentAnswer[]>([]);

const remainingQuestions = computed(() => {
	return props.questionList.filter(q => !answeredQuestionIds.value.has(q.id));
});

const question = computed(() => remainingQuestions.value[currentQuestion.value]);

const previousQuestion = () => {
	if (currentQuestion.value > 0) {
		selectedAnswer.value = '';
		currentQuestion.value--;
	}
};

const nextQuestion = () => {
	if (currentQuestion.value < remainingQuestions.value.length - 1) {
		selectedAnswer.value = '';
		currentQuestion.value++;
	}
};

const handleSubmit = async () => {
	if (isSubmitting.value) return;

	isSubmitting.value = true;
	try {
		const answer = {
			questionId: question.value.id,
			answerId: selectedAnswer.value,
			type: 'quiz'
		};

		emit('submit', answer);
		answeredQuestionIds.value.add(question.value.id);
		selectedAnswer.value = '';
		
		// If there are no more questions, reset to the first remaining question
		if (remainingQuestions.value.length === 0) {
			currentQuestion.value = 0;
		} else if (currentQuestion.value >= remainingQuestions.value.length) {
			currentQuestion.value = remainingQuestions.value.length - 1;
		}
	} finally {
		isSubmitting.value = false;
	}
};

const handleTabChange = async () => {
	if (isSubmitting.value || !question.value) return;

	isSubmitting.value = true;
	try {
		const answer = {
			questionId: question.value.id,
			answerId: selectedAnswer.value || 'wrong',
			type: 'quiz',
			tabChanged: true,
		};

		emit('submit', answer);
		answeredQuestionIds.value.add(question.value.id);
		selectedAnswer.value = '';
		showInvalidPopup.value = true;
		
		// If there are no more questions, reset to the first remaining question
		if (remainingQuestions.value.length === 0) {
			currentQuestion.value = 0;
		} else if (currentQuestion.value >= remainingQuestions.value.length) {
			currentQuestion.value = remainingQuestions.value.length - 1;
		}
	} finally {
		isSubmitting.value = false;
	}
};

const correctAnswersCount = computed(() => {
	return props.questionList.filter(q => 
		answers.value.some((a: StudentAnswer) => 
			a.questionId === q.id && a.status === 'correct'
		)
	).length;
});

const totalScore = computed(() => {
	return answers.value.reduce((sum: number, answer: StudentAnswer) => {
		const question = props.questionList.find(q => q.id === answer.questionId);
		return sum + (answer.status === 'correct' ? (question?.points || 0) : 0);
	}, 0);
});

onMounted(() => {
	timerService.setTabChangeCallback(handleTabChange);
});

onUnmounted(() => {
	timerService.setTabChangeCallback(null);
});
</script>

<style scoped>
.question-container {
	margin: 0 auto;
	padding: 20px;
	display: flex;
	align-items: center;
	gap: 20px;
	width: 80%;
}

.button {
	background-color: #225dca;
	color: white;
	padding: 10px 20px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	height: 40px;
}

.button:hover:not(:disabled) {
	background-color: #1a4ba3;
}

.button:disabled {
	background-color: #ccc;
	cursor: not-allowed;
}

.question-content {
	background: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	flex: 1;
}

.question-header {
	display: flex;
	justify-content: space-between;
	gap: 20px;
	align-items: center;
	margin-bottom: 20px;
}

.question-index {
	min-width: 30px;
	text-align: center;
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

.summary-content {
	display: grid;
	gap: 20px;
}

.summary-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	background: #f8f9fa;
	border-radius: 4px;
}

.summary-item .label {
	color: #666;
	font-size: 16px;
}

.summary-item .value {
	color: #225dca;
	font-size: 20px;
	font-weight: bold;
}
</style>