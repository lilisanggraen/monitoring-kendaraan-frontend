import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVehicles, getVehicleStats, getVehicleHistory } from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts'
import { BarChart2, TrendingUp, Gauge, Activity } from 'lucide-react'

export default function Statistics() {
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Ambil daftar kendaraan
  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  })
  const vehicles = vehiclesRes?.data?.data || vehiclesRes?.data || []

  // Ambil statistik kendaraan terpilih
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', selectedVehicle],
    queryFn: () => getVehicleStats(selectedVehicle),
    enabled: !!selectedVehicle
  })
  const stats = statsRes?.data?.data || statsRes?.data

  // Ambil riwayat untuk grafik
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['history-chart', selectedVehicle, startDate, endDate],
    queryFn: () => getVehicleHistory(selectedVehicle, startDate, endDate),
    enabled: !!selectedVehicle && !!startDate && !!endDate
  })

  const logs = historyRes?.data?.data || historyRes?.data || []

  // Siapkan data grafik kecepatan (1 titik per 5 data)
  const chartData = logs
    .filter((_, i) => i % 5 === 0)
    .map((log, i) => ({
      index: i + 1,
      time: new Date(log.recorded_at).toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit'
      }),
      kecepatan: Math.round(log.speed || 0)
    }))

  // Data per jam untuk bar chart
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const logsThisHour = logs.filter(log =>
      new Date(log.recorded_at).getHours() === hour
    )
    const avgSpeed = logsThisHour.length > 0
      ? Math.round(logsThisHour.reduce((sum, l) => sum + (l.speed || 0), 0) / logsThisHour.length)
      : 0
    return {
      jam: `${hour.toString().padStart(2, '0')}:00`,
      rata_kecepatan: avgSpeed,
      jumlah_data: logsThisHour.length
    }
  }).filter(d => d.jumlah_data > 0)

  const selectedVehicleData = vehicles.find(v => String(v.id) === String(selectedVehicle))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistik Kendaraan</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Filter Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Kendaraan
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Placeholder jika belum pilih kendaraan */}
      {!selectedVehicle ? (
        <div className="bg-white rounded-xl shadow p-16 text-center text-gray-400">
          <BarChart2 size={56} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Pilih kendaraan untuk melihat statistik</p>
          <p className="text-sm mt-1">Data kecepatan dan riwayat perjalanan akan ditampilkan di sini.</p>
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
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Data GPS</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total_data_points?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-400">titik perjalanan</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Kecepatan Rata-rata</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.avg_speed_kmh || 0}
                  </p>
                  <p className="text-xs text-gray-400">km/jam</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Gauge size={22} className="text-red-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Kecepatan Tertinggi</p>
                  <p className="text-2xl font-bold text-red-500">
                    {stats.max_speed_kmh || 0}
                  </p>
                  <p className="text-xs text-gray-400">km/jam</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Grafik Kecepatan */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Grafik Kecepatan</h2>
              {logs.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {logs.length} titik data
                </span>
              )}
            </div>

            {historyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 flex-col gap-2">
                <BarChart2 size={32} className="opacity-30" />
                <p>Tidak ada data pada periode ini.</p>
                <p className="text-xs">Coba ubah rentang tanggal.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    interval={Math.floor(chartData.length / 8)}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    unit=" km/h"
                    domain={[0, 'dataMax + 10']}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} km/h`, 'Kecepatan']}
                    labelFormatter={(label) => `Waktu: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="kecepatan"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Kecepatan (km/h)"
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart per jam */}
          {hourlyData.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-gray-800 mb-4">
                Rata-rata Kecepatan per Jam
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="jam" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" km/h" />
                  <Tooltip
                    formatter={(val) => [`${val} km/h`, 'Rata-rata Kecepatan']}
                  />
                  <Bar
                    dataKey="rata_kecepatan"
                    fill="#3b82f6"
                    name="Rata-rata Kecepatan"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}