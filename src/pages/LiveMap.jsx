import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { getVehicles } from '../services/api'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

// Fix icon Leaflet yang hilang di Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Icon kendaraan online (biru) dan offline (abu)
const onlineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})
const offlineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

export default function LiveMap() {
  const [vehicles, setVehicles] = useState([])
  const socketRef = useRef(null)

  // Ambil data kendaraan awal dari API
  const { data } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  })

  useEffect(() => {
    if (data?.data?.data) {
      setVehicles(data.data.data)
    }
  }, [data])

  // Koneksi Socket.io untuk update real-time
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL)
    socketRef.current = socket

    // Update posisi kendaraan saat ada data baru
    socket.on('vehicle:updated', (payload) => {
      setVehicles(prev => prev.map(v =>
        v.vehicle_id === payload.vehicle_id
          ? {
              ...v,
              last_latitude:  payload.latitude,
              last_longitude: payload.longitude,
              last_speed:     payload.speed,
              last_seen_at:   payload.timestamp,
            }
          : v
      ))
    })

    // Alert jika ada peringatan
    socket.on('vehicle:alert', (payload) => {
      if (payload.type === 'overspeed') {
        toast.error(`🚨 Overspeed! Kendaraan ${payload.vehicle_id} — ${payload.speed} km/h`)
      } else {
        toast.error(`🚨 Geofence! Kendaraan ${payload.vehicle_id} keluar area`)
      }
    })

    return () => socket.disconnect()
  }, [])

  const now = new Date()

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Live Map</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Online
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-400 rounded-full"></span> Offline
          </span>
          <span className="text-gray-500">{vehicles.length} kendaraan terdaftar</span>
        </div>
      </div>

      {/* Peta */}
      <div className="flex-1">
        <MapContainer
          center={[-7.3306, 110.4981]} // Koordinat Salatiga
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles.map(vehicle => {
            // Skip kendaraan yang belum punya koordinat
            if (!vehicle.last_latitude || !vehicle.last_longitude) return null

            const isOnline = vehicle.last_seen_at &&
              (now - new Date(vehicle.last_seen_at)) / 1000 / 60 < 5

            return (
              <Marker
                key={vehicle.vehicle_id}
                position={[vehicle.last_latitude, vehicle.last_longitude]}
                icon={isOnline ? onlineIcon : offlineIcon}
              >
                <Popup>
                  <div className="min-w-48">
                    <p className="font-bold text-gray-800">{vehicle.vehicle_id}</p>
                    <p className="text-sm text-gray-600">Plat: {vehicle.plate_number}</p>
                    <p className="text-sm text-gray-600">Tipe: {vehicle.vehicle_type}</p>
                    <p className="text-sm text-gray-600">
                      Kecepatan: <strong>{vehicle.last_speed || 0} km/h</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <strong className={isOnline ? 'text-green-600' : 'text-gray-500'}>
                        {isOnline ? 'Online' : 'Offline'}
                      </strong>
                    </p>
                    {vehicle.last_seen_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Update: {new Date(vehicle.last_seen_at).toLocaleTimeString('id-ID')}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}