<template>
	<div class="popup-overlay" @click="close">
		<div class="popup-content" @click.stop>
			<div class="popup-header">
				<h2>Խումբ {{ groupId }}</h2>
				<button class="close-button" @click="close">×</button>
			</div>

			<div class="popup-body">
				<div class="analytics-section">
					<h3>Վիճակագրություն</h3>
					<div class="analytics-chart">
						<Pie :data="getGroupData(groupId)" :options="chartOptions" />
					</div>
					<div class="analytics-stats">
						<div class="stat">
							<span class="label">Ճիշտ - </span>
							<span class="value">{{ getCorrectCount(groupId) }}</span>
						</div>
						<div class="stat">
							<span class="label">Սխալ - </span>
							<span class="value">{{ getIncorrectCount(groupId) }}</span>
						</div>
						<div class="stat">
							<span class="label">Անվավեր - </span>
							<span class="value">{{ getInvalidCount(groupId) }}</span>
						</div>
					</div>

					<div class="interactive-sections">
						<div class="students-list">
							<h4>Ուսանողներ</h4>
							<div v-for="student in uniqueStudents" :key="student" class="student-item"
								:class="{ 'selected': selectedStudent === student }" @click="toggleStudent(student)">
								{{ student }}
							</div>
						</div>

						<div class="questions-list">
							<h4>Հարցեր</h4>
							<div v-for="question in questionsWithAnswers" :key="question.id" class="question-item"
								@mouseenter="showQuestionStats(question.id)" @mouseleave="hideQuestionStats">
								<div class="question-content">{{ question.content }}</div>
								<div v-if="hoveredQuestionId === question.id" class="question-stats">

									<div class="question-stats-chart">
										<Pie :data="getQuestionData(question.id)" :options="chartOptions" />
									</div>


									<div class="question-stats-text">
										<div class="question-stats-text-item">
											<span class="label">Ճիշտ - </span>
											<span class="value">{{ getCorrectCountQuestion(question.id) }}</span>
										</div>
										<div class="question-stats-text-item">
											<span class="label">Սխալ - </span>
											<span class="value">{{ getIncorrectCountQuestion(question.id) }}</span>
										</div>
										<div class="question-stats-text-item">
											<span class="label">Անվավեր - </span>
											<span class="value">{{ getInvalidCountQuestion(question.id) }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="answers-section">
					<h3>Ուսանողների պատասխաններ</h3>
					<div class="answers-list">
						<div v-for="answer in filteredAnswers" :key="answer.questionId + answer.email" class="answer-item">
							<div class="answer-header">
								<span class="student-email">{{ answer.email }}</span>
								<span class="answer-status" :class="answer.status">{{ getStatusText(answer.status)
									}}</span>
							</div>
							<div class="answer-content">
								<p class="question-text">{{ getQuestionText(answer.questionId) }}</p>
								<p class="answer-text">{{ getAnswerText(answer) }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';
import type { StudentAnswer, Question } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
	groupId: string;
	answers: StudentAnswer[];
	questions: Question[];
}>();

const emit = defineEmits<{
	(e: 'close'): void;
}>();

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: false
		}
	}
};

const groupAnswers = computed(() => {
	return props.answers.filter(answer => answer.groupId === props.groupId);
});

const hoveredStudent = ref<string>('');
const hoveredQuestionId = ref<string>('');
const studentAnswers = ref<StudentAnswer[]>([]);

const selectedStudent = ref<string>('');

const uniqueStudents = computed(() => {
	const students = new Set<string>();
	props.answers.forEach(answer => {
		if (answer.groupId === props.groupId) {
			students.add(answer.email);
		}
	});
	return Array.from(students);
});

const questionsWithAnswers = computed(() => {
	const answeredQuestionIds = new Set<string>();
	props.answers.forEach(answer => {
		if (answer.groupId === props.groupId) {
			answeredQuestionIds.add(answer.questionId);
		}
	});
	return props.questions.filter(question => answeredQuestionIds.has(question.id));
});

const toggleStudent = (student: string) => {
	if (selectedStudent.value === student) {
		selectedStudent.value = '';
	} else {
		selectedStudent.value = student;
	}
};

const showQuestionStats = (questionId: string) => {
	hoveredQuestionId.value = questionId;
};

const hideQuestionStats = () => {
	hoveredQuestionId.value = '';
};

const getGroupData = (groupId: string) => {
	const groupAnswers = props.answers.filter(a => a.groupId === groupId);
	const correct = groupAnswers.filter(a => a.status === 'correct').length;
	const incorrect = groupAnswers.filter(a => a.status === 'incorrect').length;
	const invalid = groupAnswers.filter(a => a.status === 'invalid').length;

	return {
		labels: ['Ճիշտ', 'Սխալ', 'Անվավեր'],
		datasets: [{
			data: [correct, incorrect, invalid],
			backgroundColor: ['#28a745', '#dc3545', '#ffc107']
		}]
	};
};

const getQuestionData = (questionId: string) => {
	// get a pie chart with answers for this particular question

	const questionAnswers = props.answers.filter(a => a.questionId === questionId);
	const correct = questionAnswers.filter(a => a.status === 'correct').length;
	const incorrect = questionAnswers.filter(a => a.status === 'incorrect').length;
	const invalid = questionAnswers.filter(a => a.status === 'invalid').length;

	return {
		labels: ['Ճիշտ', 'Սխալ', 'Անվավեր'],
		datasets: [{
			data: [correct, incorrect, invalid],
			backgroundColor: ['#28a745', '#dc3545', '#ffc107']
		}]
	};
};

const getCorrectCount = (groupId: string) => {
	return props.answers.filter(a => a.groupId === groupId && a.status === 'correct').length;
};

const getCorrectCountQuestion = (questionId: string) => {
	return props.answers.filter(a => a.questionId === questionId && a.status === 'correct').length;
};

const getIncorrectCount = (groupId: string) => {
	return props.answers.filter(a => a.groupId === groupId && a.status === 'incorrect').length;
};

const getIncorrectCountQuestion = (questionId: string) => {
	return props.answers.filter(a => a.questionId === questionId && a.status === 'incorrect').length;
};

const getInvalidCount = (groupId: string) => {
	return props.answers.filter(a => a.groupId === groupId && a.status === 'invalid').length;
};

const getInvalidCountQuestion = (questionId: string) => {
	return props.answers.filter(a => a.questionId === questionId && a.status === 'invalid').length;
};

const getStatusText = (status: string | undefined) => {
	if (!status) return 'Անպատասխան';
	switch (status) {
		case 'correct':
			return 'Ճիշտ է';
		case 'incorrect':
			return 'Սխալ է';
		case 'invalid':
			return 'Անվավեր է';
		default:
			return 'Անպատասխան';
	}
};

const getQuestionText = (questionId: string) => {
	const question = props.questions.find(q => q.id === questionId);
	return question?.content || '';
};

const getAnswerText = (answer: StudentAnswer) => {
	const question = props.questions.find(q => q.id === answer.questionId);
	if (!question) return '';

	if (question.type === 'quiz') {
		const selectedAnswer = question.answers?.find(a => a.id === answer.answer.answerId);
		return selectedAnswer?.content || '';
	} else if (question.type === 'text' || question.type === 'word-select') {
		return answer.answer.text || '';
	}

	return '';
};

const filteredAnswers = computed(() => {
	if (selectedStudent.value) {
		return groupAnswers.value.filter(answer => answer.email === selectedStudent.value);
	}
	return groupAnswers.value;
});

const close = () => {
	emit('close');
};
</script>

<style scoped>
.popup-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.popup-content {
	background: white;
	width: 90%;
	max-width: 1200px;
	max-height: 90vh;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
}

.popup-header {
	padding: 20px;
	border-bottom: 1px solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.popup-header h2 {
	margin: 0;
	color: #225dca;
}

.close-button {
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	color: #666;
}

.popup-body {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	padding: 20px;
	height: calc(90vh - 100px);
}

.analytics-section,
.answers-section {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.analytics-section h3,
.answers-section h3 {
	color: #225dca;
	margin-bottom: 15px;
}

.analytics-chart {
	flex: 1;
	max-height: 40%;
	overflow-y: auto;
	padding-right: 10px;
}

.analytics-stats {
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.interactive-sections {
	margin-top: 20px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	max-height: 200px;
	overflow: hidden;
}

.students-list,
.questions-list {
	overflow-y: auto;
	padding-right: 10px;
	max-height: 180px;
}

.students-list h4,
.questions-list h4 {
	color: #225dca;
	margin-bottom: 10px;
}

.student-item,
.question-item {
	padding: 6px;
	margin-bottom: 6px;
	background: #f8f9fa;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s;
	font-size: 0.9em;
}

.student-item:hover,
.question-item:hover {
	background: #e9ecef;
}

.student-item.selected {
	background: #225dca;
	color: white;
}

.question-content {
	font-weight: 500;
}

.question-stats {
	position: absolute;
	background: white;
	padding: 10px;
	border-radius: 4px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	z-index: 100;
	width: 150px;
	margin-left: 10px;
}

.question-stats-chart {
	width: 100%;
	height: 100px;
}

.answers-section {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

.answers-section h3 {
	color: #225dca;
	margin-bottom: 15px;
	flex-shrink: 0;
}

.answers-list {
	flex: 1;
	overflow-y: auto;
	padding-right: 10px;
}

.answer-item {
	background: #f8f9fa;
	padding: 15px;
	border-radius: 8px;
	margin-bottom: 15px;
}

.answer-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.student-email {
	font-weight: bold;
	margin-bottom: 5px;
}

.question-text {
	margin: 0;
}

.answer-text {
	margin: 0;
}

.answer-status {
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: bold;
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

.answer-content {
	color: #666;
}

.no-student-selected {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #666;
	font-style: italic;
	text-align: center;
	padding: 20px;
}
</style>