<script setup>
import GalleryComponent from '../components/GalleryComponent.vue'
</script>

<template>
  <!-- Page shell for /gallery; photo browsing UI lives in GalleryComponent. -->
  <div class="fill-height">
    <GalleryComponent />
  </div>
</template>

<style scoped>
.fill-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
