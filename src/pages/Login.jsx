import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, Users, UserCog, ShieldCheck } from 'lucide-react'
import supabase from '../lib/supabase'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [resetEmail, setResetEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleResetChange = (e) => {
    setResetEmail(e.target.value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login with:', formData.email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      })

      if (error) {
        console.error('❌ Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in.')
        } else {
          setError(error.message)
        }
        return
      }

      console.log('✅ Login successful!', data.user)
      navigate('/dashboard')
      
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setResetSent(true)
      setError('')
    } catch (error) {
      console.error('❌ Reset error:', error)
      setError(error.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleResetMode = () => {
    setIsResetMode(!isResetMode)
    setResetSent(false)
    setError('')
    setResetEmail('')
  }

  const fillCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@econetfc.com', password: 'Admin@2026!' },
      manager: { email: 'manager@econetfc.com', password: 'Manager@2026!' },
      coach: { email: 'coach@econetfc.com', password: 'Coach@2026!' },
      viewer: { email: 'viewer@econetfc.com', password: 'Viewer@2026!' }
    }
    setFormData(credentials[role] || credentials.admin)
    setSelectedRole(role)
    setError('')
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <ShieldCheck className="w-4 h-4" />
      case 'manager': return <UserCog className="w-4 h-4" />
      case 'coach': return <Users className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'border-green-200 bg-green-50 hover:bg-green-100'
      case 'manager': return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
      case 'coach': return 'border-purple-200 bg-purple-50 hover:bg-purple-100'
      default: return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
    }
  }

  // If reset email was sent
  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Check Your Email</h2>
              <p className="text-sm text-gray-500 mt-2">
                We've sent a password reset link to:
                <br />
                <span className="font-medium text-gray-700">{resetEmail}</span>
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={toggleResetMode}
                className="w-full py-2.5 text-[#1a4d7a] font-medium rounded-lg border border-[#1a4d7a] hover:bg-[#1a4d7a] hover:text-white transition-colors"
              >
                Back to Login
              </button>
              <button
                onClick={() => {
                  setResetSent(false)
                  setIsResetMode(false)
                }}
                className="w-full py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Resend Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Password Reset Mode
  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-12 h-12 text-[#e67e22]" />
              <div>
                <h1 className="text-2xl font-bold text-[#1a1a2e]">Nchoathi FC</h1>
                <p className="text-sm text-gray-500">Reset Password</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={toggleResetMode}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Your Password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={handleResetChange}
                  placeholder="admin@econetfc.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d7a] focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1a4d7a] text-white font-medium rounded-lg hover:bg-[#0f3460] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Normal Login Mode
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-12 h-12 text-[#e67e22]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a2e]">Nchoathi FC</h1>
              <p className="text-sm text-gray-500">Football Management System</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('Invalid login credentials') && (
                  <p className="text-xs text-red-600 mt-1">
                    Use the demo credentials below to log in
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@econetfc.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d7a] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d7a] focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleResetMode}
                className="text-sm text-[#1a4d7a] hover:text-[#e67e22] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1a4d7a] text-white font-medium rounded-lg hover:bg-[#0f3460] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Role Selection - Demo Credentials */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Login with Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillCredentials('admin')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${getRoleColor('admin')} ${selectedRole === 'admin' ? 'ring-2 ring-green-500' : ''}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                onClick={() => fillCredentials('manager')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${getRoleColor('manager')} ${selectedRole === 'manager' ? 'ring-2 ring-blue-500' : ''}`}
              >
                <UserCog className="w-3.5 h-3.5" />
                Manager
              </button>
              <button
                onClick={() => fillCredentials('coach')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${getRoleColor('coach')} ${selectedRole === 'coach' ? 'ring-2 ring-purple-500' : ''}`}
              >
                <Users className="w-3.5 h-3.5" />
                Coach
              </button>
              <button
                onClick={() => fillCredentials('viewer')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${getRoleColor('viewer')} ${selectedRole === 'viewer' ? 'ring-2 ring-gray-500' : ''}`}
              >
                <Users className="w-3.5 h-3.5" />
                Viewer
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-medium">Demo Credentials:</span>
              <br />
              <span className="font-mono text-[10px]">admin@econetfc.com</span> / <span className="font-mono text-[10px]">Admin@2026!</span>
              <br />
              <span className="font-mono text-[10px]">coach@econetfc.com</span> / <span className="font-mono text-[10px]">Coach@2026!</span>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Public users can view matches, players, and statistics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login