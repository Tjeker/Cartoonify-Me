<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { mdiClose, mdiUpload } from '@mdi/js'
import { applyImageBlur, downloadPhoto, processingErrorMessage } from '../api'
import { MAX_UPLOAD_BYTES } from '../config'
import { addLocalPhoto, store } from '../store'
import PhotoPreview from './PhotoPreview.vue'

// ref() creates a value Vue tracks: use .value in JavaScript, but not in the template.
const fileInput = ref(null)
const blurredImage = ref('')
const showBlurred = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
let pendingRequest

// Discard the previous result and release its temporary browser URL.
function clearBlur() {
  if (blurredImage.value) URL.revokeObjectURL(blurredImage.value)
  blurredImage.value = ''
  showBlurred.value = false
}

function cancelProcessing() {
  pendingRequest?.abort()
  pendingRequest = undefined
  isLoading.value = false
}

// Changing photos resets the comparison and cancels any unfinished processing request.
watch(
  () => store.selectedImage,
  () => {
    cancelProcessing()
    clearBlur()
    errorMessage.value = ''
  },
  { flush: 'sync' }
)

onBeforeUnmount(() => {
  cancelProcessing()
  clearBlur()
})

// Check uploads before adding them to the shared photo list.
function handleImageUpload(file) {
  if (!file) {
    store.selectedImage = null
    return
  }
  errorMessage.value = ''
  if (file.size > MAX_UPLOAD_BYTES) {
    errorMessage.value = 'Images must be 10 MiB or smaller.'
    return
  }
  addLocalPhoto(file)
}

async function applyBlur() {
  const image = store.selectedImage
  if (!image || isLoading.value) return
  const controller = new AbortController()
  pendingRequest = controller
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Local uploads already contain a File; CEWE originals must be downloaded first.
    const blob =
      image.source === 'local'
        ? image.file
        : await downloadPhoto(image.id, store.session.cldId, { signal: controller.signal })

    if (controller.signal.aborted || store.selectedImage !== image) return
    if (blob.size > MAX_UPLOAD_BYTES) {
      errorMessage.value = 'The original image exceeds the 10 MiB upload limit.'
      return
    }
    // Send the image to Python, then turn the returned PNG bytes into a displayable URL.
    const result = await applyImageBlur(blob, image.name, controller.signal)
    if (controller.signal.aborted || store.selectedImage !== image) return
    clearBlur()
    blurredImage.value = URL.createObjectURL(result)
    showBlurred.value = true
  } catch (error) {
    if (!controller.signal.aborted) {
      const message = await processingErrorMessage(error)
      if (!controller.signal.aborted) errorMessage.value = message
    }
  } finally {
    if (pendingRequest === controller) {
      pendingRequest = undefined
      isLoading.value = false
    }
  }
}
</script>

<template>
  <v-container tag="section" class="d-flex align-center justify-center fill-height" aria-labelledby="blur-title">
    <v-card width="100%" max-width="850" class="pa-4" elevation="1">
      <v-card-title>
        <h2 id="blur-title" class="my-0 text-headline">Image Blur</h2>
      </v-card-title>
      <v-card-text>
        <p class="mb-4">Upload an image or select a photo from the gallery.</p>
        <v-alert v-if="errorMessage" type="error" class="mb-4" role="alert">
          {{ errorMessage }}
        </v-alert>
        <v-row align="center">
          <v-col cols="12" sm="8">
            <v-sheet color="background" rounded border class="position-relative overflow-hidden">
              <!-- Keep both previews mounted: v-show only hides them, avoiding reloads and flashes. -->
              <PhotoPreview
v-if="store.selectedImage" v-show="!showBlurred" :image="store.selectedImage" :height="300"
                :size="720" />
              <v-img
v-if="blurredImage" v-show="showBlurred" :src="blurredImage" :transition="false" eager
                alt="Blurred image" :height="300" width="100%" />
              <v-sheet
v-if="!store.selectedImage" tag="button" type="button" height="300" width="100%"
                color="background" class="d-flex align-center justify-center" aria-label="Choose an image"
                @click="fileInput?.click()">
                Click to upload an image
              </v-sheet>
              <v-btn
v-if="store.selectedImage" :icon="mdiClose" size="small" color="error" position="absolute"
                location="top end" class="ma-2" aria-label="Clear selected image" @click="store.selectedImage = null" />
              <v-overlay
:model-value="isLoading" contained persistent :close-on-back="false"
                class="align-center justify-center" role="status" aria-label="Processing image">
                <v-progress-circular indeterminate color="primary" :size="48" />
              </v-overlay>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex flex-column ga-3">
            <!-- The empty preview opens this same file picker through its ref. -->
            <v-file-input
ref="fileInput" :model-value="store.selectedImage?.file || null" label="Choose image"
              accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff" variant="outlined" hide-details
              @update:model-value="handleImageUpload" />
            <v-btn
:prepend-icon="mdiUpload" color="primary" block :disabled="!store.selectedImage || isLoading"
              :loading="isLoading" @click="applyBlur">Apply Blur</v-btn>
            <v-switch
v-if="blurredImage" v-model="showBlurred" label="Show blurred image" color="primary"
              hide-details />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
