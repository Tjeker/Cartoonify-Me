<script setup>
import { ref, watch } from 'vue'
import { downloadPhoto } from '../api'
import { store } from '../store'

const props = defineProps({
  image: { type: Object, required: true },
  height: { type: Number, default: 180 },
  size: { type: Number, default: 300 },
  cover: { type: Boolean, default: false }
})
const previewUrl = ref('')
const failed = ref(false)

// Local photos already have a URL; CEWE previews need an authenticated download.
watch(
  [() => props.image, () => store.session],
  async ([image, session], _previous, onCleanup) => {
    previewUrl.value = ''
    failed.value = false
    if (image.source === 'local') {
      previewUrl.value = image.url
      return
    }
    if (!session) return

    const controller = new AbortController()
    let objectUrl
    // Vue runs this when the photo/login changes or the component is removed.
    onCleanup(() => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    })

    try {
      const blob = await downloadPhoto(image.id, session.cldId, {
        thumbnail: true,
        size: props.size,
        signal: controller.signal
      })
      if (controller.signal.aborted) return
      // Display the downloaded bytes using a temporary URL, cleaned up above.
      objectUrl = URL.createObjectURL(blob)
      previewUrl.value = objectUrl
    } catch {
      if (!controller.signal.aborted) failed.value = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <v-sheet :height="height" width="100%" color="background" class="d-flex align-center justify-center">
    <v-img
v-if="previewUrl && !failed" :src="previewUrl" :transition="false" :alt="image.name" :height="height"
      width="100%" :cover="cover" @error="failed = true" />
    <span v-else-if="failed" class="text-body-small">Preview unavailable</span>
    <v-progress-circular v-else indeterminate size="28" aria-label="Loading photo preview" />
  </v-sheet>
</template>
