<script setup>
import { ref } from 'vue';
import QuestionForm from './QuestionForm.vue';
import ProfessorQuestionList from './ProfessorQuestionList.vue';
import Tree from 'vue3-tree';
import 'vue3-tree/dist/style.css';

const showForm = ref(false);
const selectedGroup = ref(null);
const searchText = ref('');

const treeData = ref([
  {
    id: 'year1',
    label: 'Year 1',
    nodes: [
      { id: 'group1', label: 'Group 1' },
      { id: 'group2', label: 'Group 2' },
      { id: 'group3', label: 'Group 3' }
    ]
  },
]);

const handleNodeSelect = (node) => {
  if (!node.children) { // Only select leaf nodes (groups)
    selectedGroup.value = node.id;
  }
};

const handleQuestionSubmit = async (question) => {
  if (!selectedGroup.value) {
    alert('Please select a group first');
    return;
  }

  try {
    const questionWithGroup = {
      ...question,
      groupId: selectedGroup.value,
    };

    const response = await fetch('http://localhost:3000/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionWithGroup),
    });

    if (!response.ok) {
      throw new Error('Failed to add question');
    }

    console.log('Question added successfully');
    showForm.value = false;
  } catch (error) {
    console.error('Error adding question:', error);
  }
};
</script>

<template>
  <div class="professor-page">
    <div class="content">
      <div class="header">
        <h1>Professor Dashboard</h1>
        <button class="add-question-btn" @click="showForm = !showForm">
          {{ showForm ? 'Չեղարկել' : 'Ավելացնել հարցումներ' }}
        </button>
      </div>

      <div class="layout">
        <div class="tree-container">
          <h2>Years and Groups</h2>
          <Tree
            :nodes="treeData"
            :search-text="searchText"
            :use-checkbox="true"
            :use-icon="false"
            show-child-count
          />
          <div v-if="selectedGroup" class="selected-group">
            Selected Group: {{ selectedGroup }}
          </div>
        </div>

        <div class="main-content">
          <div v-if="showForm" class="form-container">
            <QuestionForm @submit="handleQuestionSubmit" />
          </div>
          <div class="questions-container">
            <ProfessorQuestionList :groupId="selectedGroup" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.professor-page {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: #225dca;
  margin: 0;
}

.add-question-btn {
  background-color: #225dca;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.add-question-btn:hover {
  background-color: #1a4ba3;
}

.content {
  display: grid;
  gap: 30px;
}

.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.tree-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tree-container h2 {
  margin-top: 0;
  color: #225dca;
  margin-bottom: 20px;
}

.selected-group {
  margin-top: 20px;
  padding: 10px;
  background: #f0f7ff;
  border-radius: 4px;
  color: #225dca;
}

.main-content {
  display: grid;
  gap: 30px;
}

.form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.questions-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 