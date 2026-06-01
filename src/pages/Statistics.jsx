import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVehicles, getVehicleStats, getVehicleHistory } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { BarChart2, Activity, Clock, MapPin } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-green-600">🟢 Keluar: {data?.jam_keluar_label}</p>
        <p className="text-orange-500">🟠 Kembali: {data?.jam_kembali_label}</p>
      </div>
    )
  }
  return null
}

export default function Statistics() {
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const getDefaultStartDate = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}
const getDefaultEndDate = () => new Date().toISOString().split('T')[0]

const [startDate, setStartDate] = useState(getDefaultStartDate)
const [endDate, setEndDate] = useState(getDefaultEndDate)

  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  })
  const vehicles = vehiclesRes?.data?.data || vehiclesRes?.data || []

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', selectedVehicle],
    queryFn: () => getVehicleStats(selectedVehicle),
    enabled: !!selectedVehicle
  })
  const stats = statsRes?.data?.data || statsRes?.data

  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['history-chart', selectedVehicle, startDate, endDate],
    queryFn: () => getVehicleHistory(selectedVehicle, startDate, endDate),
    enabled: !!selectedVehicle && !!startDate && !!endDate
  })
  const logs = historyRes?.data?.data || historyRes?.data || []

  const toTimeStr = (decimal) => {
    if (!decimal && decimal !== 0) return '-'
    const h = Math.floor(decimal).toString().padStart(2, '0')
    const m = Math.round((decimal % 1) * 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  const dailyMap = {}
  logs.forEach(log => {
    const date = new Date(log.recorded_at).toLocaleDateString('id-ID')
    if (!dailyMap[date]) dailyMap[date] = []
    dailyMap[date].push(new Date(log.recorded_at))
  })

  const chartData = Object.entries(dailyMap).map(([date, times]) => {
    const sorted = [...times].sort((a, b) => a - b)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const keluarDecimal = first.getHours() + first.getMinutes() / 60
    const kembaliDecimal = last.getHours() + last.getMinutes() / 60
    return {
      tanggal: date,
      jam_keluar: parseFloat(keluarDecimal.toFixed(2)),
      jam_kembali: parseFloat(kembaliDecimal.toFixed(2)),
      jam_keluar_label: first.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      jam_kembali_label: last.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }
  })

  const avgKeluar = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.jam_keluar, 0) / chartData.length
    : 0
  const avgKembali = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.jam_kembali, 0) / chartData.length
    : 0

  const selectedVehicleData = vehicles.find(v => String(v.id) === String(selectedVehicle))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistik Kendaraan</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Filter Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kendaraan</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {!selectedVehicle ? (
        <div className="bg-white rounded-xl shadow p-16 text-center text-gray-400">
          <BarChart2 size={56} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Pilih kendaraan untuk melihat statistik</p>
          <p className="text-sm mt-1">Data perjalanan akan ditampilkan di sini.</p>
        </div>
      ) : (
        <>
          {/* Info kendaraan */}
          {selectedVehicleData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">🚗</span>
              <div>
                <p className="font-bold text-blue-800">{selectedVehicleData.vehicle_id}</p>
                <p className="text-sm text-blue-600">
                  {selectedVehicleData.plate_number} · {selectedVehicleData.vehicle_type}
                </p>
              </div>
            </div>
          )}

          {/* Stat Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Data GPS</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.total_data_points?.toLocaleString() || logs.length}
                  </p>
                  <p className="text-xs text-gray-400">titik perjalanan</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rata-rata Jam Keluar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {chartData.length > 0 ? toTimeStr(avgKeluar) : '-'}
                  </p>
                  <p className="text-xs text-gray-400">WIB</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin size={22} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rata-rata Jam Kembali</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {chartData.length > 0 ? toTimeStr(avgKembali) : '-'}
                  </p>
                  <p className="text-xs text-gray-400">WIB</p>
                </div>
              </div>
            </div>
          )}

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Jam Keluar & Kembali per Hari</h2>
            {historyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 flex-col gap-2">
                <BarChart2 size={32} className="opacity-30" />
                <p>Tidak ada data pada periode ini.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={[0, 24]}
                    tickFormatter={(v) => `${String(v).padStart(2, '0')}:00`}
                  />
                  <Tooltip content={CustomTooltip} />
                  <Bar dataKey="jam_keluar" fill="#22c55e" name="Jam Keluar" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="jam_kembali" fill="#f97316" name="Jam Kembali" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabel detail */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b">
                <p className="font-semibold text-gray-800">Detail Per Hari</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">Tanggal</th>
                      <th className="px-4 py-3 text-left text-gray-600">Jam Keluar</th>
                      <th className="px-4 py-3 text-left text-gray-600">Jam Kembali</th>
                      <th className="px-4 py-3 text-left text-gray-600">Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((d, i) => {
                      const durasi = d.jam_kembali - d.jam_keluar
                      const jam = Math.floor(Math.abs(durasi))
                      const menit = Math.round((Math.abs(durasi) % 1) * 60)
                      return (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{d.tanggal}</td>
                          <td className="px-4 py-3 text-green-600 font-medium">{d.jam_keluar_label}</td>
                          <td className="px-4 py-3 text-orange-500 font-medium">{d.jam_kembali_label}</td>
                          <td className="px-4 py-3 text-gray-600">{jam}j {menit}m</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}