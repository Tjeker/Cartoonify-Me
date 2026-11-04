<script setup>
import { computed, ref, watch } from 'vue'
import { mdiLogin, mdiLogout } from '@mdi/js'
import { loadCewePhotos, login, logout } from '../api'
import { clearSession, setSession, store } from '../store'

// Form values stay in this component; shared login information goes in the store.
const dialog = ref(false)
const form = ref(null)
const email = ref('')
const password = ref('')
const isLoggingIn = ref(false)
const isLoggingOut = ref(false)
const errorMessage = ref('')
const displayName = computed(
  () => [store.session?.firstname, store.session?.lastname].filter(Boolean).join(' ') || 'CEWE user'
)
const buttonLabel = computed(() => (store.session ? 'Logout ' + displayName.value : 'Login'))
// Vuetify rules return true for valid input, or an error message to show below the field.
const required = (value) => Boolean(value?.trim()) || 'Required.'
const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.'

// Do not keep a typed password in the form after the dialog closes.
watch(dialog, (open) => {
  if (!open) {
    password.value = ''
    errorMessage.value = ''
  }
})

async function handleLogin() {
  if (isLoggingIn.value) return
  const result = await form.value?.validate()
  if (!result?.valid) return

  isLoggingIn.value = true
  errorMessage.value = ''
  try {
    const response = await login(email.value, password.value)
    setSession(response)
    store.notice = ''
    dialog.value = false
    // Load photos separately so a gallery error does not undo a successful login.
    void loadCewePhotos()
  } catch {
    errorMessage.value =
      'Sign-in failed. Check your credentials and any required CEWE terms or account settings.'
  } finally {
    password.value = ''
    isLoggingIn.value = false
  }
}

async function handleLogout() {
  const cldId = store.session?.cldId
  // Always remove local access immediately, even when the remote session has expired.
  clearSession()
  store.notice = ''
  isLoggingOut.value = true
  try {
    if (cldId) await logout(cldId)
  } catch {
    store.notice = 'Signed out locally. CEWE could not confirm server-side sign-out.'
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <v-btn
variant="text" color="white" class="mr-2" :prepend-icon="store.session ? mdiLogout : mdiLogin"
    :aria-label="buttonLabel" :loading="isLoggingIn || isLoggingOut" :disabled="isLoggingIn || isLoggingOut"
    @click="store.session ? handleLogout() : (dialog = true)">
    <span class="d-none d-sm-inline login-label">{{ buttonLabel }}</span>
  </v-btn>
  <v-dialog v-model="dialog" :persistent="isLoggingIn" max-width="420" aria-labelledby="login-title">
    <v-card>
      <v-card-title id="login-title" class="text-headline-small">CEWE login</v-card-title>
      <v-form ref="form" :disabled="isLoggingIn" @submit.prevent="handleLogin">
        <v-card-text>
          <v-alert v-if="errorMessage" type="error" class="mb-4" role="alert">
            {{ errorMessage }}
          </v-alert>
          <v-text-field
v-model="email" label="Email" type="email" autocomplete="username"
            :rules="[required, validEmail]" required />
          <v-text-field
v-model="password" label="Password" type="password" autocomplete="current-password"
            :rules="[required]" required />
        </v-card-text>
        <v-card-actions>
          <v-btn type="button" :disabled="isLoggingIn" @click="dialog = false">Cancel</v-btn>
          <v-btn type="submit" color="primary" :loading="isLoggingIn"> Sign in </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.login-label {
  max-width: 24ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
