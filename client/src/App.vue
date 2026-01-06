<script setup>
import TheHeader from './components/TheHeader.vue';
</script>

<template>
  <div class="app-container">
    <TheHeader />

    <main class="content">
      <router-view /> 
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-image: url('./assets/red.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; 
  min-height: 100vh; 
}
</style>