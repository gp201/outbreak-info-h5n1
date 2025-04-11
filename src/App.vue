<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'DM Sans', 'Avenir', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  background-color: #f8f9fa;
  color: #2c3e50;
}
</style>