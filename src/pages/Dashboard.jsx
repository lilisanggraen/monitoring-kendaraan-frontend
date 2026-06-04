import { useQuery } from '@tanstack/react-query'
import { getVehicles, getNotifications } from '../services/api'
import { Car, Wifi, WifiOff, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
    refetchInterval: 10000
  })

  const { data: notifRes } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 10000
  })

const vehicles = vehiclesRes?.data?.data || vehiclesRes?.data || []
const notifications = notifRes?.data?.data || notifRes?.data || []

  const now    = new Date()
  const aktif  = vehicles.filter(v => {
    if (!v.last_seen_at) return false
    return (now - new Date(v.last_seen_at)) / 1000 / 60 < 5
  })
  const offline = vehicles.filter(v => {
    if (!v.last_seen_at) return true
    return (now - new Date(v.last_seen_at)) / 1000 / 60 >= 5
  })
  const unread  = notifications.filter(n => !n.is_read)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Car}     label="Total Kendaraan"   value={vehicles.length} color="bg-blue-500" />
        <StatCard icon={Wifi}    label="Kendaraan Online"  value={aktif.length}    color="bg-green-500" />
        <StatCard icon={WifiOff} label="Kendaraan Offline" value={offline.length}  color="bg-red-500" />
        <StatCard icon={Bell}    label="Notifikasi Baru"   value={unread.length}   color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifikasi Terbaru */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="font-bold text-gray-800 mb-4">Notifikasi Terbaru</h2>
          {notifications.slice(0, 5).length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada notifikasi.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`p-3 rounded-lg border-l-4 ${
                  n.type === 'overspeed'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-orange-50 border-orange-500'
                }`}>
                  <p className="text-sm font-medium text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Kendaraan - full box */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="font-bold text-gray-800 mb-4">Status Kendaraan</h2>
          {vehicles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Belum ada kendaraan terdaftar.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {vehicles.map(v => {
                const isOnline = v.last_seen_at &&
                  (now - new Date(v.last_seen_at)) / 1000 / 60 < 5
                return (
                  <div key={v.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{v.vehicle_id}</p>
                      <p className="text-xs text-gray-400">{v.plate_number} · {v.vehicle_type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isOnline
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}