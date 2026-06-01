import { Menu } from 'lucide-react'

export default function Topbar({ onMenuClick }) {
  return (
    <header className="lg:hidden bg-blue-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="text-white hover:text-blue-300 transition-colors"
      >
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-2">
        <span className="text-lg">🚗</span>
        <p className="font-bold text-sm">Monitoring Kendaraan</p>
      </div>
    </header>
  )
}