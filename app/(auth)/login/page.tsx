'use client'

import React, { useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Activity, LogIn } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(searchParams.get('error'))

  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl text-orange-600 mb-2">
            <Activity className="w-8 h-8" />
            <span>RunnerTracker</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">ยินดีต้อนรับกลับ</h2>
          <p className="text-slate-500 text-sm">เข้าสู่ระบบเพื่อติดตามความก้าวหน้าในการวิ่งของคุณ</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : <><LogIn className="w-4 h-4" /> เข้าสู่ระบบด้วยอีเมล</>}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">หรือเข้าสู่ระบบด้วย</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58v2.98h3.84c2.25-2.07 3.59-5.12 3.59-8.8z"/>
            <path fill="#4285F4" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.98c-1.06.71-2.42 1.14-4.09 1.14-3.15 0-5.82-2.13-6.77-5.01H1.32v3.08C3.31 20.12 7.37 24 12 24z"/>
            <path fill="#FBBC05" d="M5.23 14.24A7.14 7.14 0 0 1 4.8 12c0-.79.13-1.57.38-2.31V6.61H1.32A11.95 11.95 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l3.98-3.15z"/>
            <path fill="#34A853" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.37 0 3.31 3.88 1.32 8.13l3.98 3.15c.95-2.88 3.62-5.01 6.77-5.01z"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-orange-600 hover:underline font-medium">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
