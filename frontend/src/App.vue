<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { RouterView } from 'vue-router'
import { mdiHome, mdiImage } from '@mdi/js'
import CeweLoginOverlay from './components/CeweLoginOverlay.vue'
import { clearLocalPhotos, store } from './store'

// null lets Vuetify choose the drawer's initial state based on the screen size.
const drawer = ref(null)
onBeforeUnmount(clearLocalPhotos)
</script>

<template>
  <v-app>
    <!-- Header and navigation are shared by both pages. -->
    <v-app-bar color="primary">
      <v-app-bar-nav-icon class="d-md-none" aria-label="Toggle navigation" @click="drawer = !drawer" />
      <v-app-bar-title>
        <div class="text-title-small text-sm-title-medium font-weight-bold">
          Media Processing 2026/2027
        </div>
        <div class="text-body-small d-none d-sm-block">In cooperation with CEWE myPhotos</div>
      </v-app-bar-title>
      <template #append>
        <CeweLoginOverlay />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" mobile-breakpoint="md" color="primary">
      <v-list nav density="compact" aria-label="Main navigation">
        <v-list-item title="Main" :prepend-icon="mdiHome" to="/" exact />
        <v-list-item title="Gallery" :prepend-icon="mdiImage" to="/gallery" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-alert v-if="store.notice" class="ma-4" type="warning" closable @click:close="store.notice = ''">{{ store.notice
      }}</v-alert>
      <!-- The router puts MainView or GalleryView here, depending on the URL. -->
      <RouterView />
    </v-main>
  </v-app>
</template>
