import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet'
import { getGeofences, createGeofence, deleteGeofence } from '../services/api'
import { Plus, Trash2, X, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng) }
  })
  return null
}

function GeofenceModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', latitude: '', longitude: '', radius: 500
  })
  const [loading, setLoading] = useState(false)

  const handleMapClick = (latlng) => {
    setForm(prev => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.latitude || !form.longitude) {
      toast.error('Klik peta untuk pilih lokasi dan isi nama geofence.')
      return
    }
    setLoading(true)
    try {
      await onSave({
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        radius: parseFloat(form.radius)
      })
      onClose()
    } catch {
      // error dihandle di mutasi
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">➕ Tambah Area Geofence</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Form nama dulu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Area <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Area Kantor Walikota Salatiga"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (meter)
            </label>
            <input
              type="number"
              value={form.radius}
              onChange={(e) => setForm({ ...form, radius: e.target.value })}
              min="50" max="50000" step="50"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Peta */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              🖱️ Klik peta untuk memilih lokasi pusat geofence
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 300 }}>
              <MapContainer
                center={[-7.3306, 110.4981]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {form.latitude && form.longitude && (
                  <>
                    <Marker position={[parseFloat(form.latitude), parseFloat(form.longitude)]} />
                    <Circle
                      center={[parseFloat(form.latitude), parseFloat(form.longitude)]}
                      radius={parseFloat(form.radius)}
                      color="blue" fillColor="blue" fillOpacity={0.15}
                    />
                  </>
                )}
              </MapContainer>
            </div>
            {form.latitude ? (
              <p className="text-xs text-green-600 mt-1">
                ✓ Lokasi dipilih: {form.latitude}, {form.longitude}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Belum ada lokasi dipilih. Klik peta di atas.</p>
            )}
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg transition-colors">
              {loading ? 'Menyimpan...' : 'Simpan Geofence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Geofences() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['geofences'],
    queryFn: getGeofences
  })
  const rawData = data?.data
const geofences = Array.isArray(rawData?.data)
  ? rawData.data
  : Array.isArray(rawData)
  ? rawData
  : []

  const { mutateAsync: addGeofence } = useMutation({
    mutationFn: createGeofence,
    onSuccess: () => {
      queryClient.invalidateQueries(['geofences'])
      toast.success('Geofence berhasil dibuat! 🛡️')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal membuat geofence.')
  })

  const { mutate: removeGeofence } = useMutation({
    mutationFn: deleteGeofence,
    onSuccess: () => {
      queryClient.invalidateQueries(['geofences'])
      toast.success('Geofence berhasil dihapus.')
    },
    onError: () => toast.error('Gagal menghapus geofence.')
  })

  const handleDelete = (geofence) => {
    if (confirm(`Hapus geofence "${geofence.name}"?`)) {
      removeGeofence(geofence.id)
    }
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Geofence</h1>
          <p className="text-gray-500 text-sm mt-1">
            {geofences.length} area geofence terdaftar
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition-colors">
          <Plus size={18} /> Tambah Geofence
        </button>
      </div>

      {/* Peta semua geofence */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6" style={{ height: 400 }}>
        <MapContainer
          center={[-7.3306, 110.4981]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geofences.map(g => (
            <Circle
              key={g.id}
              center={[g.latitude, g.longitude]}
              radius={g.radius}
              color="red" fillColor="red" fillOpacity={0.1}
            />
          ))}
        </MapContainer>
      </div>

      {/* Daftar Geofence */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p>Memuat data geofence...</p>
          </div>
        ) : geofences.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada geofence.</p>
            <p className="text-sm mt-1">Klik tombol "Tambah Geofence" untuk membuat area baru.</p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              + Tambah Geofence Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama Area</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Koordinat Pusat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Radius</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {geofences.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                        <span className="font-semibold text-gray-800">{g.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {g.latitude.toFixed(6)}, {g.longitude.toFixed(6)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {g.radius} m
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        g.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {g.is_active ? '✓ Aktif' : '○ Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(g)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus geofence"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-400">
              Total {geofences.length} area geofence
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <GeofenceModal
          onClose={() => setShowModal(false)}
          onSave={(form) => addGeofence(form)}
        />
      )}
    </div>
  )
}