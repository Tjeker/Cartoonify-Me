import { reactive } from 'vue'

export const SESSION_KEY = 'cewe-session'

// Shared data: changing this reactive object updates the components that use it.
export const store = reactive({
  session: null,
  localPhotos: [],
  cewePhotos: [],
  selectedImage: null,
  ceweLoading: false,
  cewePageIndex: 0,
  hasMoreCewePhotos: true,
  galleryError: '',
  notice: ''
})

function validatedSession(value) {
  if (typeof value?.cldId !== 'string' || !value.cldId.trim()) return null
  return {
    cldId: value.cldId,
    firstname: typeof value.firstname === 'string' ? value.firstname : '',
    lastname: typeof value.lastname === 'string' ? value.lastname : ''
  }
}

// Keep the session ID and display name for this browser tab, not the user's password.
function persistSession() {
  try {
    if (store.session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(store.session))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // Login still works in memory when browser storage is unavailable.
  }
}

// Restore login after a page refresh; missing or damaged saved data means signed out.
export function restoreSession() {
  try {
    store.session = validatedSession(JSON.parse(sessionStorage.getItem(SESSION_KEY)))
  } catch {
    store.session = null
  }
  persistSession()
}

export function setSession(response) {
  const session = validatedSession({
    cldId: response?.session?.cldId,
    firstname: response?.user?.firstname,
    lastname: response?.user?.lastname
  })
  if (!session) throw new Error('CEWE returned an invalid session.')
  store.session = session
  persistSession()
}

// Signing out removes CEWE photos but leaves the user's local uploads available.
export function clearSession() {
  store.session = null
  store.cewePhotos = []
  store.ceweLoading = false
  store.cewePageIndex = 0
  store.hasMoreCewePhotos = true
  store.galleryError = ''
  if (store.selectedImage?.source === 'cewe') store.selectedImage = null
  persistSession()
}

export function addLocalPhoto(file) {
  // A temporary browser URL lets <v-img> display the File without uploading it anywhere.
  const image = {
    id: crypto.randomUUID(),
    source: 'local',
    name: file.name,
    url: URL.createObjectURL(file),
    file
  }
  store.localPhotos.unshift(image)
  store.selectedImage = image
}

export function removeLocalPhoto(id) {
  const image = store.localPhotos.find((photo) => photo.id === id)
  if (!image) return
  if (store.selectedImage?.id === id) store.selectedImage = null
  // Release the memory held by this temporary URL when the photo is removed.
  URL.revokeObjectURL(image.url)
  store.localPhotos = store.localPhotos.filter((photo) => photo.id !== id)
}

export function clearLocalPhotos() {
  for (const image of [...store.localPhotos]) removeLocalPhoto(image.id)
}
