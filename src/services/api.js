export const getProfile = () => api.get('/api/auth/profile')
export const updateProfile = (data) => api.patch('/api/auth/profile', data)
export const changePassword = (data) => api.patch('/api/auth/change-password', data)
export const uploadAvatar = (formData) => api.post('/api/auth/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password })

export const getVehicles = () => api.get('/api/vehicles')
export const getVehicleHistory = (id, start, end) =>
  api.get(`/api/vehicles/${id}/history`, { params: { start, end } })
export const getVehicleStats = (id) => api.get(`/api/vehicles/${id}/stats`)
export const createVehicle = (data) => api.post('/api/vehicles', data)
export const updateVehicle = (id, data) => api.patch(`/api/vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/api/vehicles/${id}`)

export const getNotifications = () => api.get('/api/notifications')
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.patch('/api/notifications/read-all')

export const getGeofences = () => api.get('/api/geofences')
export const createGeofence = (data) => api.post('/api/geofences', data)
export const deleteGeofence = (id) => api.delete(`/api/geofences/${id}`)

export default api