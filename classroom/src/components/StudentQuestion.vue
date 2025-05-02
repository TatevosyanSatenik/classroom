<template>
	<div class="question-container" v-if="question">
		<button class="previous-btn button" @click="previousQuestion" :disabled="currentQuestion === 0">Previous</button>
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
					{{ isSubmitting ? 'Submitting...' : 'Submit' }}
				</button>
			</div>
		</div>
		<button class="next-btn button" @click="nextQuestion" :disabled="currentQuestion === remainingQuestions.length - 1">Next</button>
	</div>
	<div v-else>
		All questions have been answered
	</div>
	<InvalidQuestionPopup :show="showInvalidPopup" @close="showInvalidPopup = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { timerService } from '../services/timer.service';
import type { Question } from '@/types';
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
</style>