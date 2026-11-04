import axios from 'axios'
import { API_ACCESS_KEY, API_URL, CEWE_API_URL, CLIENT_VERSION } from './config'
import { clearSession, store } from './store'

// Reuse the CEWE address and required headers instead of repeating them for every request.
const ceweClient = axios.create({
  baseURL: CEWE_API_URL,
  timeout: 30_000,
  headers: {
    clientVersion: CLIENT_VERSION,
    apiAccessKey: API_ACCESS_KEY
  }
})

// Check failed CEWE responses in one place and sign out if the current session has expired.
ceweClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const sessionId = error.config?.headers?.get?.('cldId')
    if (
      [401, 403].includes(error.response?.status) &&
      sessionId &&
      sessionId === store.session?.cldId
    ) {
      clearSession()
      store.notice = 'Your CEWE session has expired. Please sign in again.'
    }
    // Never log Axios errors: their request configuration can contain credentials.
    return Promise.reject(error)
  }
)

// CEWE returns a session ID (cldId); later requests use it to identify the signed-in user.
export async function login(email, password) {
  const { data } = await ceweClient.post('/account/session', {
    login: email.trim(),
    password,
    deviceName: 'MediaProcessingStudentDemo',
    createRefreshToken: false,
    useCookies: false
  })
  return data
}

export async function logout(cldId) {
  await ceweClient.delete('/account/session', {
    headers: { cldId },
    params: { invalidateRefreshToken: true }
  })
}

// Fetch one page of photo details. Image files are downloaded separately when needed.
export async function fetchPhotos(cldId, pageIndex = 0, pageSize = 24) {
  const { data } = await ceweClient.get('/photos', {
    headers: { cldId },
    params: { pageIndex, pageSize }
  })
  if (!Array.isArray(data.photos)) throw new Error('CEWE returned an invalid photo list.')

  return {
    photos: data.photos
      .filter((photo) => typeof photo.id === 'string')
      .map((photo) => ({
        id: photo.id,
        source: 'cewe',
        name: photo.title || photo.filename || 'CEWE photo'
      })),
    hasMore:
      typeof data.availablePhotosCount === 'number'
        ? (pageIndex + 1) * pageSize < data.availablePhotosCount
        : Boolean(data.nextPage)
  }
}

// Add the next page to the shared gallery; ignore repeated clicks while it is loading.
export async function loadCewePhotos() {
  const session = store.session
  if (!session || store.ceweLoading || !store.hasMoreCewePhotos) return
  store.ceweLoading = true
  store.galleryError = ''

  try {
    const result = await fetchPhotos(session.cldId, store.cewePageIndex)
    // A sign-out or account change must discard an older in-flight response.
    if (store.session !== session) return
    store.cewePhotos.push(...result.photos)
    store.cewePageIndex += 1
    store.hasMoreCewePhotos = result.hasMore
  } catch {
    if (store.session === session) {
      store.galleryError = 'Your photos could not be loaded. Please try again.'
    }
  } finally {
    if (store.session === session) store.ceweLoading = false
  }
}

export async function downloadPhoto(
  photoId,
  cldId,
  { thumbnail = false, size = 300, signal } = {}
) {
  // .org is the documented original file; JPEG renditions are for previews only.
  const extension = thumbnail ? 'jpg' : 'org'
  const { data } = await ceweClient.get(
    '/photos/' + encodeURIComponent(photoId) + '.' + extension,
    {
      headers: { cldId },
      params: thumbnail ? { size } : undefined,
      responseType: 'blob',
      signal
    }
  )
  return data
}

export async function applyImageBlur(blob, filename, signal) {
  // FormData sends a file upload; the backend expects its field to be named "file".
  const formData = new FormData()
  formData.append('file', blob, filename)
  const { data } = await axios.post(API_URL + '/apply-blur', formData, {
    responseType: 'blob',
    timeout: 30_000,
    signal
  })
  return data
}

export async function processingErrorMessage(error) {
  // Successful responses are image bytes, but failed requests may contain a JSON error.
  let data = error.response?.data
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text())
    } catch {
      data = null
    }
  }
  return typeof data?.detail === 'string'
    ? data.detail
    : 'The image could not be processed. Check the connection and try again.'
}
