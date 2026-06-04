import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import LiveMap       from './pages/LiveMap'
import History       from './pages/History'
import Notifications from './pages/Notifications'
import Vehicles      from './pages/Vehicles'
import Geofences     from './pages/Geofences'
import Statistics    from './pages/Statistics'
import Settings      from './pages/Settings'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/live-map" element={
            <ProtectedRoute>
              <Layout><LiveMap /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <Layout><History /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout><Notifications /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/vehicles" element={
            <ProtectedRoute>
              <Layout><Vehicles /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/geofences" element={
            <ProtectedRoute>
              <Layout><Geofences /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/statistics" element={
            <ProtectedRoute>
              <Layout><Statistics /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}