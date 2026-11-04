<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { mdiClose } from '@mdi/js'
import { loadCewePhotos } from '../api'
import { clearLocalPhotos, removeLocalPhoto, store } from '../store'
import PhotoPreview from './PhotoPreview.vue'

const router = useRouter()
// computed() updates the combined gallery whenever either photo list changes.
const images = computed(() => [...store.localPhotos, ...store.cewePhotos])

// Load the first CEWE page on entry or login; the Load more button requests later pages.
watch(
  () => store.session,
  () => {
    if (store.cewePageIndex === 0) void loadCewePhotos()
  },
  { immediate: true }
)

// Pass the selection through the shared store, then return to the processing page.
function selectImage(image) {
  store.selectedImage = image
  router.push('/')
}
</script>

<template>
  <section class="pa-4" aria-labelledby="gallery-title">
    <div class="d-flex align-center justify-space-between ga-3 mb-4">
      <h1 id="gallery-title" class="text-headline-small">Gallery</h1>
      <v-btn v-if="store.localPhotos.length" variant="text" @click="clearLocalPhotos">
        Clear uploads
      </v-btn>
    </div>
    <p class="mb-4 text-body-medium">
      Uploaded images remain in this tab until removed or reloaded.
      <span v-if="!store.session">Sign in to browse your CEWE photos.</span>
    </p>
    <v-alert v-if="store.galleryError" type="error" class="mb-4" role="alert">
      {{ store.galleryError }}
      <v-btn variant="text" @click="loadCewePhotos">Retry</v-btn>
    </v-alert>
    <p v-if="!images.length && !store.ceweLoading">
      No photos yet. Upload an image on the Main page.
    </p>
    <div class="gallery-grid">
      <v-card v-for="image in images" :key="image.source + ':' + image.id" class="position-relative">
        <button
type="button" class="d-block w-100 text-start cursor-pointer" :aria-label="'Select ' + image.name"
          @click="selectImage(image)">
          <PhotoPreview :image="image" cover />
          <span class="d-block pa-3 text-truncate">{{ image.name }}</span>
        </button>
        <v-btn
v-if="image.source === 'local'" :icon="mdiClose" size="x-small" color="error" position="absolute"
          location="top end" class="ma-2" :aria-label="'Remove upload ' + image.name"
          @click="removeLocalPhoto(image.id)" />
      </v-card>
    </div>
    <div class="mt-6 text-center">
      <v-progress-circular v-if="store.ceweLoading" indeterminate aria-label="Loading CEWE photos" />
      <v-btn
v-else-if="store.session && store.hasMoreCewePhotos && !store.galleryError" variant="outlined"
        @click="loadCewePhotos">Load more CEWE photos</v-btn>
    </div>
  </section>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 190px), 1fr));
  gap: 16px;
}
</style>
