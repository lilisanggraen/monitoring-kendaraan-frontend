import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api'
import { Bell, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function Notifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 10000
  })

  const notifications = data?.data?.data || []
  const unread = notifications.filter(n => !n.is_read).length

  const { mutate: markRead } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  const { mutate: markAllRead } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      toast.success('Semua notifikasi ditandai sudah dibaca.')
    }
  })

  if (isLoading) return <div className="p-6 text-gray-500">Memuat notifikasi...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
          {unread > 0 && (
            <p className="text-sm text-orange-600">{unread} notifikasi belum dibaca</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <CheckCheck size={16} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada notifikasi.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`bg-white rounded-xl shadow p-4 border-l-4 flex items-start justify-between ${
                n.type === 'overspeed'
                  ? 'border-red-500'
                  : 'border-orange-500'
              } ${!n.is_read ? 'ring-1 ring-blue-200' : 'opacity-75'}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    n.type === 'overspeed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {n.type === 'overspeed' ? '🚨 Overspeed' : '📍 Geofence'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {n.vehicle?.vehicle_id} — {n.vehicle?.plate_number}
                  </span>
                  {!n.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                </p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-blue-500 hover:text-blue-700 text-xs ml-4 shrink-0"
                >
                  Tandai dibaca
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}