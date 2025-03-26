<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
	<div class="container">
		<router-view></router-view>
	</div>
</template>

<style scoped>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
