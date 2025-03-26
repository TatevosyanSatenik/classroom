<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import QuestionList from './QuestionList.vue';
import ProfessorPage from './ProfessorPage.vue';

const router = useRouter();
const userEmail = ref('');
const userRole = ref('');

const isProfessor = computed(() => userRole.value === 'professor');

const handleLogout = () => {
	localStorage.removeItem('user');
	router.push('/');
};

onMounted(() => {
	console.log('HomePage mounted');
	try {
		const userStr = localStorage.getItem('user');
		console.log('Raw user data:', userStr);
		if (userStr) {
			const user = JSON.parse(userStr);
			console.log('Parsed user:', user);
			userEmail.value = user.email;
			userRole.value = user.role;

			console.log(userEmail.value, userRole.value);
		} else {
			console.log('No user found in localStorage');
			router.push('/');
		}
	} catch (error) {
		console.error('Error accessing user data:', error);
		router.push('/');
	}
});
</script>

<template>
	<div class="home-page">
		<div class="header">
			<h1>Welcome to Classroom</h1>
			<div class="user-info">
				<p>Current user: {{ userEmail }}</p>
				<p>Role: {{ userRole }}</p>
			</div>
			<button class="logout-btn" @click="handleLogout">Logout</button>
		</div>

		<div class="content">
			<ProfessorPage v-if="isProfessor" />
			<QuestionList v-else />
		</div>
	</div>
</template>

<style scoped>
.home-page {
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	gap: 20px;
	background-color: #f5f5f5;
	padding: 20px;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px;
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
	font-size: 24px;
	color: #225dca;
	margin: 0;
}

.user-info {
	text-align: right;
}

.user-info p {
	margin: 5px 0;
	color: #666;
}

.logout-btn {
	background-color: #dc3545;
	color: white;
	padding: 8px 16px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
	transition: background-color 0.3s;
}

.logout-btn:hover {
	background-color: #c82333;
}

.content {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding: 20px;
}
</style>