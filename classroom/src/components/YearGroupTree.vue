<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  years: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['select-groups']);

const expandedYears = ref(new Set());
const selectedGroups = ref(new Set());

const handleYearClick = (year) => {
  if (expandedYears.value.has(year)) {
    expandedYears.value.delete(year);
  } else {
    expandedYears.value.add(year);
  }
};

const handleGroupClick = (group) => {
  if (selectedGroups.value.has(group.id)) {
    selectedGroups.value.delete(group.id);
  } else {
    selectedGroups.value.add(group.id);
  }
  emit('select-groups', Array.from(selectedGroups.value));
};

// Watch for changes in selected groups and emit updates
watch(selectedGroups, (newGroups) => {
  emit('select-groups', Array.from(newGroups));
}, { deep: true });
</script>

<template>
  <div class="year-group-tree">
    <div 
      v-for="year in years" 
      :key="year.id" 
      class="year-item"
    >
      <div 
        class="year-header"
        :class="{ 'is-expanded': expandedYears.has(year.id) }"
        @click="handleYearClick(year.id)"
      >
        <span class="year-icon">{{ expandedYears.has(year.id) ? '▼' : '▶' }}</span>
        <span class="year-name">{{ year.name }}</span>
      </div>
      
      <div 
        v-if="expandedYears.has(year.id)" 
        class="groups-container"
      >
        <div 
          v-for="group in year.groups" 
          :key="group.id"
          class="group-item"
          :class="{ 'is-selected': selectedGroups.has(group.id) }"
          @click="handleGroupClick(group)"
        >
          <input 
            type="checkbox" 
            :checked="selectedGroups.has(group.id)"
            @click.stop
            @change="handleGroupClick(group)"
          />
          <span class="group-name">{{ group.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.year-group-tree {
  background: white;
  border-radius: 8px;
  padding: 10px;
}

.year-item {
  margin-bottom: 8px;
}

.year-header {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.year-header:hover {
  background-color: #f0f7ff;
}

.year-header.is-expanded {
  background-color: #e6f0ff;
}

.year-icon {
  margin-right: 8px;
  color: #225dca;
  width: 16px;
  text-align: center;
}

.year-name {
  font-weight: 500;
  color: #225dca;
}

.groups-container {
  margin-left: 24px;
  border-left: 2px solid #e6f0ff;
  padding-left: 8px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.group-item:hover {
  background-color: #f0f7ff;
}

.group-item.is-selected {
  background-color: #e6f0ff;
  color: #225dca;
}

.group-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.group-name {
  flex: 1;
}
</style> 