import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, History, Bell,
  Car, Shield, BarChart2, LogOut
} from 'lucide-react'
import useAuthStore from '../../stores/authStore'

const menus = [
  { path: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/live-map',      icon: Map,             label: 'Live Map' },
  { path: '/history',       icon: History,         label: 'Riwayat' },
  { path: '/notifications', icon: Bell,            label: 'Notifikasi' },
  { path: '/vehicles',      icon: Car,             label: 'Kendaraan' },
  { path: '/geofences',     icon: Shield,          label: 'Geofence' },
  { path: '/statistics',    icon: BarChart2,       label: 'Statistik' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="w-64 bg-blue-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          <div>
            <p className="text-white font-bold text-sm">Monitoring Kendaraan</p>
            <p className="text-blue-300 text-xs">PEMKOT Salatiga</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="text-blue-300 text-xs capitalize">{user?.role || 'operator'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-blue-300 hover:text-white text-sm w-full px-2 py-2 rounded hover:bg-blue-800 transition-colors"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  )
}