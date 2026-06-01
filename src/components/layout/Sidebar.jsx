import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, History, Bell,
  Car, Shield, BarChart2, LogOut, X, User
} from 'lucide-react'
import { useState } from 'react'
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

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 w-64 bg-blue-900 flex flex-col z-[1000]
        transform transition-transform duration-300 ease-in-out
        h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:shrink-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-blue-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-white font-bold text-sm">Monitoring Kendaraan</p>
              <p className="text-blue-300 text-xs">PEMKOT Salatiga</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-blue-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menus.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
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

        {/* User Profile */}
        <div className="p-4 border-t border-blue-800 shrink-0">
          {/* Tombol profile - bisa diklik */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 w-full mb-2 hover:bg-blue-800 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{user?.name || 'Admin'}</p>
              <p className="text-blue-300 text-xs capitalize">{user?.role || 'operator'}</p>
            </div>
            <User size={14} className="text-blue-300" />
          </button>

          {/* Dropdown profil */}
          {showProfile && (
            <div className="bg-blue-800 rounded-lg p-3 mb-2 text-sm">
              <p className="text-blue-200 text-xs mb-1">Email</p>
              <p className="text-white text-xs truncate">{user?.email || '-'}</p>
              <p className="text-blue-200 text-xs mt-2 mb-1">Role</p>
              <p className="text-white text-xs capitalize">{user?.role || '-'}</p>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 text-blue-300 hover:text-white text-sm w-full px-2 py-2 rounded hover:bg-blue-800 transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}