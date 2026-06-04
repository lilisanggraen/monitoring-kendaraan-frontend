import { useState } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { getVehicles, getVehicleHistory } from '../services/api'
import toast from 'react-hot-toast'

export default function History() {
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [startDate, setStartDate]             = useState('')
  const [endDate, setEndDate]                 = useState('')
  const [logs, setLogs]                       = useState([])
  const [loading, setLoading]                 = useState(false)

  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  })
  const vehicles = vehiclesRes?.data?.data || []

  const handleSearch = async () => {
    if (!selectedVehicle || !startDate || !endDate) {
      toast.error('Pilih kendaraan dan rentang tanggal terlebih dahulu.')
      return
    }
    setLoading(true)
    try {
      const res = await getVehicleHistory(selectedVehicle, startDate, endDate)
      setLogs(res.data.data || [])
      if (res.data.data?.length === 0) {
        toast('Tidak ada data perjalanan pada periode ini.', { icon: 'ℹ️' })
      }
    } catch {
      toast.error('Gagal mengambil riwayat perjalanan.')
    } finally {
      setLoading(false)
    }
  }

  const polylinePoints = logs.map(l => [l.latitude, l.longitude])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Perjalanan</h1>

      {/* Form Filter */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Kendaraan --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_id} — {v.plate_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Memuat...' : 'Cari Rute'}
            </button>
          </div>
        </div>
      </div>

      {/* Peta Rute */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6" style={{ height: '400px' }}>
        <MapContainer
          center={[-7.3306, 110.4981]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {polylinePoints.length > 0 && (
            <Polyline positions={polylinePoints} color="blue" weight={3} opacity={0.8} />
          )}
          {logs.length > 0 && (
            <CircleMarker
              center={[logs[0].latitude, logs[0].longitude]}
              radius={8} color="green" fillColor="green" fillOpacity={1}
            >
              <Popup>Titik Awal — {new Date(logs[0].recorded_at).toLocaleString('id-ID')}</Popup>
            </CircleMarker>
          )}
          {logs.length > 1 && (
            <CircleMarker
              center={[logs[logs.length-1].latitude, logs[logs.length-1].longitude]}
              radius={8} color="red" fillColor="red" fillOpacity={1}
            >
              <Popup>Titik Akhir — {new Date(logs[logs.length-1].recorded_at).toLocaleString('id-ID')}</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {/* Tabel Log */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <p className="font-semibold text-gray-800">{logs.length} titik perjalanan ditemukan</p>
          </div>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">Waktu</th>
                  <th className="px-4 py-3 text-left text-gray-600">Latitude</th>
                  <th className="px-4 py-3 text-left text-gray-600">Longitude</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">
                      {new Date(log.recorded_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{log.latitude.toFixed(6)}</td>
                    <td className="px-4 py-2 text-gray-600">{log.longitude.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}