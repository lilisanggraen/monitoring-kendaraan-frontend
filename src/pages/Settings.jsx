import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateProfile, changePassword, uploadAvatar } from '../services/api'
import useAuthStore from '../stores/authStore'
import { Camera, Save, Lock, User } from 'lucide-react'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef()

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const showError = (msg) => {
    setErrorMsg(msg)
    setSuccessMsg('')
    setTimeout(() => setErrorMsg(''), 3000)
  }

  // Update profil
  const profileMutation = useMutation({
    mutationFn: () => updateProfile(profileForm),
    onSuccess: (res) => {
      updateUser(res.data.data)
      showSuccess('Profil berhasil diperbarui!')
    },
    onError: (err) => showError(err.response?.data?.error || 'Gagal memperbarui profil.')
  })

  // Ganti password
  const passwordMutation = useMutation({
    mutationFn: () => changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }),
    onSuccess: () => {
      showSuccess('Password berhasil diubah!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => showError(err.response?.data?.error || 'Gagal mengubah password.')
  })

  // Upload avatar
  const avatarMutation = useMutation({
    mutationFn: (formData) => uploadAvatar(formData),
    onSuccess: (res) => {
      updateUser(res.data.data)
      showSuccess('Foto profil berhasil diperbarui!')
    },
    onError: () => showError('Gagal upload foto. Maksimal 2MB.')
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    avatarMutation.mutate(formData)
  }

  const handlePasswordSubmit = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showError('Konfirmasi password tidak cocok.')
    }
    if (passwordForm.newPassword.length < 6) {
      return showError('Password baru minimal 6 karakter.')
    }
    passwordMutation.mutate()
  }

  const avatarUrl = user?.avatar
    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
    : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Akun</h1>

      {/* Alert */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ❌ {errorMsg}
        </div>
      )}

      {/* Foto Profil */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={avatarMutation.isPending}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Camera size={14} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-blue-600 text-xs capitalize mt-1 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
              {user?.role}
            </p>
          </div>
        </div>
        {avatarMutation.isPending && (
          <p className="text-sm text-gray-400 mt-3">Mengupload foto...</p>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User size={16} /> Edit Profil
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'password'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Lock size={16} /> Ganti Password
        </button>
      </div>

      {/* Form Edit Profil */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Informasi Profil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {profileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}

      {/* Form Ganti Password */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Ganti Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handlePasswordSubmit}
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Lock size={16} />
              {passwordMutation.isPending ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}