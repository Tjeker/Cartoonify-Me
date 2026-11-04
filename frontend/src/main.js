import 'vuetify/styles'
import './assets/main.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import App from './App.vue'
import router from './router'
import { restoreSession } from './store'

// Set up the icons and colors used by Vuetify components throughout the app.
const vuetify = createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: { primary: '#1e325c', 'on-primary': '#ffffff', background: '#f4f6fb' }
      }
    }
  }
})

// Restore this tab's login, then connect the app to <div id="app"> in index.html.
restoreSession()
createApp(App).use(vuetify).use(router).mount('#app')
