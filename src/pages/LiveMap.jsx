import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { getVehicles } from '../services/api'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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
  const socketRef = useRef(null)
  const [socketUpdates, setSocketUpdates] = useState({})

  const { data } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  })

  const baseVehicles = data?.data?.data || []

  const vehicles = baseVehicles.map(v => ({
    ...v,
    ...(socketUpdates[v.vehicle_id] || {})
  }))

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL)
    socketRef.current = socket

    socket.on('vehicle:updated', (payload) => {
      setSocketUpdates(prev => ({
        ...prev,
        [payload.vehicle_id]: {
          last_latitude:  payload.latitude,
          last_longitude: payload.longitude,
          last_seen_at:   payload.timestamp,
        }
      }))
    })

    socket.on('vehicle:alert', (payload) => {
      if (payload.type === 'geofence') {
        toast.error(`Geofence! Kendaraan ${payload.vehicle_id} keluar area`)
      }
    })

    return () => socket.disconnect()
  }, [])

  const now = new Date()

  return (
    <div className="h-screen flex flex-col">
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

      <div className="flex-1">
        <MapContainer
          center={[-7.3306, 110.4981]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vehicles.map(vehicle => {
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