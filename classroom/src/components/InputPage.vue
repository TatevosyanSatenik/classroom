<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/utils';

const router = useRouter();

let user;

const nameModel = defineModel('name', {
	type: String,
	default: ''
});

const passModel = defineModel('pass', {
	type: String,
	default: ''
});

const isPassVisible = ref(false);

const loginStudent = async () => {
	try {
		const res = await fetch('http://localhost:3000/user/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: nameModel.value })
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		const data = await res.json();

		if (data.role === 'professor') {
			isPassVisible.value = true;
			user = data;
		} else {
			loginUser(data, router);
		}

		console.log(data);
	} catch (err) {
		console.error('Login error:', err);
	}
}

const loginProfessor = async () => {
	if (passModel.value === user.password) {
		loginUser(user, router);
	} else {
		console.log('Invalid password');
	}
}
</script>

<template>
	<div class="input-page">
		<div>
			<img src="../../public/polytechnic.png" width="250" alt=" ">
		</div>
		<div class="input-header">
			<span>Մուտքագրեք ձեր էլեկտրոնային հասցեն </span>
		</div>

		<div class="input-container">
			<input type="text" v-model="nameModel" placeholder="name.surname@polytechnic.am" name="email" />

			<Transition name="fade" appear>
				<input v-if="isPassVisible" type="password" v-model="passModel" placeholder="Password" />
			</Transition>

			<div class="login-button" @click="isPassVisible ? loginProfessor() : loginStudent()">
				<span>{{ isPassVisible ? 'Մ ու տ ք' : 'Մ ու տ ք' }}</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.input-page {
	
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 20px;
}

.input-header {
	font-size: 24px;
	font-family: 'Arial';
}

.input-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	gap: 20px;
}

.login-button {
	padding: 10px 20px;
	cursor: pointer;

	border-radius: 32px;
	box-shadow: 0 0 10px rgba(34, 93, 202, 0.91);
	background-color: #225dca;
}

input {
	width: 300px;
	height: 60px;
	padding: 0 30px;

	font-size: 20px;
	border-radius: 32px;
	box-shadow: 0 0 10px rgba(34, 93, 202, 0.91);
}

input,
input:focus {
	outline: none;
	border: none;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
