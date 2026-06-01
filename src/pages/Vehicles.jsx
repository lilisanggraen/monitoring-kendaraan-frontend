import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getVehicles, createVehicle, updateVehicle, deleteVehicle
} from '../services/api'
import { Plus, Pencil, Trash2, X, Car, Search, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Modal Tambah / Edit ─────────────────────────────
function VehicleModal({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({
    vehicle_id:   vehicle?.vehicle_id   || '',
    plate_number: vehicle?.plate_number || '',
    vehicle_type: vehicle?.vehicle_type || 'mobil',
  })
  const [loading, setLoading] = useState(false)
  const isEdit = !!vehicle

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vehicle_id || !form.plate_number || !form.vehicle_type) {
      toast.error('Semua field wajib diisi.')
      return
    }
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      // error sudah dihandle di mutasi
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? '✏️ Edit Kendaraan' : '➕ Tambah Kendaraan Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* ID Kendaraan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Kendaraan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.vehicle_id}
              onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
              placeholder="Contoh: KBT-001"
              disabled={isEdit}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">ID kendaraan tidak dapat diubah.</p>
            )}
          </div>

          {/* Nomor Plat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Plat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.plate_number}
              onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })}
              placeholder="Contoh: H 1234 AB"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipe Kendaraan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Kendaraan <span className="text-red-500">*</span>
            </label>
            <select
              value={form.vehicle_type}
              onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="motor">🏍️ Motor</option>
              <option value="mobil">🚗 Mobil</option>
              <option value="truk">🚛 Truk</option>
              <option value="bus">🚌 Bus</option>
            </select>
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors">
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal Konfirmasi Hapus ───────────────────────────
function DeleteModal({ vehicle, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Hapus Kendaraan?</h2>
          <p className="text-gray-500 text-sm mb-1">
            Kendaraan <strong>{vehicle.vehicle_id}</strong> akan dihapus dari sistem.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Plat: {vehicle.plate_number} · Tipe: {vehicle.vehicle_type}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2.5 rounded-lg">
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Icon tipe kendaraan ─────────────────────────────
function VehicleTypeIcon({ type }) {
  const icons = { motor: '🏍️', mobil: '🚗', truk: '🚛', bus: '🚌' }
  return <span>{icons[type] || '🚗'}</span>
}

// ─── HALAMAN UTAMA ───────────────────────────────────
export default function Vehicles() {
  const queryClient = useQueryClient()

  const [showAddModal, setShowAddModal]    = useState(false)
  const [editVehicle, setEditVehicle]      = useState(null)
  const [deleteTarget, setDeleteTarget]    = useState(null)
  const [deleteLoading, setDeleteLoading]  = useState(false)
  const [search, setSearch]                = useState('')
  const [filterType, setFilterType]        = useState('semua')
  const [showInactive, setShowInactive] = useState(true)

  // Ambil data kendaraan
  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
    refetchInterval: 30000
  })
  const vehicles = data?.data?.data || []

  // Filter
  const filtered = vehicles.filter(v => {
  const matchSearch =
    v.vehicle_id.toLowerCase().includes(search.toLowerCase()) ||
    v.plate_number.toLowerCase().includes(search.toLowerCase())
  const matchType   = filterType === 'semua' || v.vehicle_type === filterType
  const matchActive = showInactive ? true : v.is_active === true
  return matchSearch && matchType && matchActive
  })

  // Tambah
  const { mutateAsync: addVehicle } = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles'])
      toast.success('Kendaraan berhasil ditambahkan! 🚗')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal menambahkan kendaraan.')
  })

  // Edit
  const { mutateAsync: editVehicleFn } = useMutation({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles'])
      toast.success('Kendaraan berhasil diperbarui! ✅')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal memperbarui kendaraan.')
  })

  // Hapus
  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteVehicle(deleteTarget.id)
      queryClient.invalidateQueries(['vehicles'])
      toast.success('Kendaraan berhasil dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus kendaraan.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Toggle aktif/nonaktif
  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, is_active }) => updateVehicle(id, { is_active }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['vehicles'])
      toast.success(vars.is_active ? 'Kendaraan diaktifkan.' : 'Kendaraan dinonaktifkan.')
    }
  })

  const totalAktif    = vehicles.filter(v => v.is_active).length
  const totalNonaktif = vehicles.filter(v => !v.is_active).length

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kendaraan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total {vehicles.length} kendaraan terdaftar
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition-colors">
          <Plus size={18} /> Tambah Kendaraan
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🚗</div>
          <div>
            <p className="text-gray-500 text-sm">Total Kendaraan</p>
            <p className="text-2xl font-bold text-gray-800">{vehicles.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{totalAktif}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Nonaktif</p>
            <p className="text-2xl font-bold text-red-500">{totalNonaktif}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID kendaraan atau nomor plat..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          <option value="semua">Semua Tipe</option>
          <option value="motor">🏍️ Motor</option>
          <option value="mobil">🚗 Mobil</option>
          <option value="truk">🚛 Truk</option>
          <option value="bus">🚌 Bus</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Car size={40} className="mx-auto mb-3 opacity-30" />
            <p>Memuat data kendaraan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Car size={40} className="mx-auto mb-3 opacity-30" />
            <p>Tidak ada kendaraan ditemukan.</p>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-blue-500 text-sm mt-2 hover:underline">
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ID Kendaraan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Nomor Plat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Kecepatan Terakhir</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((vehicle) => {
                  const now = new Date()
                  const isOnline = vehicle.last_seen_at &&
                    (now - new Date(vehicle.last_seen_at)) / 1000 / 60 < 5

                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <VehicleTypeIcon type={vehicle.vehicle_type} />
                          <span className="font-semibold text-gray-800">{vehicle.vehicle_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">
                          {vehicle.plate_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize text-gray-600">{vehicle.vehicle_type}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {vehicle.last_speed != null
                          ? `${vehicle.last_speed} km/h`
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                            vehicle.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {vehicle.is_active ? '✓ Aktif' : '✗ Nonaktif'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                            isOnline ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isOnline ? '● Online' : '○ Offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditVehicle(vehicle)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => toggleActive({ id: vehicle.id, is_active: !vehicle.is_active })}
                            className={`p-2 rounded-lg transition-colors ${
                              vehicle.is_active
                                ? 'text-orange-500 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={vehicle.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                            {vehicle.is_active ? <XCircle size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button onClick={() => setDeleteTarget(vehicle)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-400">
              Menampilkan {filtered.length} dari {vehicles.length} kendaraan
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {showAddModal && (
        <VehicleModal
          onClose={() => setShowAddModal(false)}
          onSave={(form) => addVehicle(form)}
        />
      )}

      {/* Modal Edit */}
      {editVehicle && (
        <VehicleModal
          vehicle={editVehicle}
          onClose={() => setEditVehicle(null)}
          onSave={(form) => editVehicleFn({ id: editVehicle.id, data: form })}
        />
      )}

      {/* Modal Hapus */}
      {deleteTarget && (
        <DeleteModal
          vehicle={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}