<script setup>
import MainComponent from '../components/MainComponent.vue'
</script>

<template>
  <!-- Page shell for the / route; upload and processing UI lives in MainComponent. -->
  <div class="fill-height">
    <MainComponent />
  </div>
</template>

<style scoped>
.fill-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
