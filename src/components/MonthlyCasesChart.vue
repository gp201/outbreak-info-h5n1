<template>
  <div>
    <h1>Monthly Cases</h1>
    <div v-if="isLoading" class="loading">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <TimeSeriesBarChart v-else :data="monthlyData" />
  </div>
</template>

<script setup>
//import { ref, onMounted } from 'vue';
import { TimeSeriesBarChart, LoadingSpinner } from 'outbreakInfo';
// TODO: Import API service



</script>

<style scoped>

</style>