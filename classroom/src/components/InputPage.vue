<script setup>
import { ref } from 'vue';

const nameModel = defineModel('name', {
	type: String,
	default: ''
});

const passModel = defineModel('pass', {
	type: String,
	default: ''
});

const isPassVisible = ref(false);

const checkMail = () => {
	if (nameModel.value.includes('prof')) {
		isPassVisible.value = true;
		return;
	}

	isPassVisible.value = false;
}

</script>

<template>
	<div class="input-page">
		<div class="input-header">
			<span>Please enter your credentials</span>
		</div>

		<div class="input-container">
			<input v-debounce:500ms="checkMail" type="text" v-model="nameModel" 
				placeholder="Email" />
			<Transition name="fade" appear>
				<input v-if="isPassVisible" type="password" v-model="passModel"
					placeholder="Password" />
			</Transition>
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
