'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Activity, ArrowLeft, Save, ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function CreateRunPage() {
  const router = useRouter()
  const supabase = createClient()

  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')

      let uploadedImageUrl: string | null = null

      // จัดการอัปโหลดไฟล์รูปภาพเข้าสู่ Supabase Storage Bucket 'run-images'
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('run-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        // ดึง Public URL ของรูปภาพออกมาเก็บ
        const { data: { publicUrl } } = supabase.storage
          .from('run-images')
          .getPublicUrl(fileName)

        uploadedImageUrl = publicUrl
      }

      // บันทึกข้อมูลลงฐานข้อมูลผ่านตาราง runs
      const { error: dbError } = await supabase.from('runs').insert({
        user_id: user.id,
        distance_km: parseFloat(distance),
        duration_minutes: parseInt(duration, 10),
        run_date: new Date(runDate).toISOString(),
        notes: notes || null,
        image_url: uploadedImageUrl
      })

      if (dbError) throw dbError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">บันทึกการวิ่งใหม่</h1>
              <p className="text-xs text-slate-400">กรอกข้อมูลและอัปโหลดรูปภาพการวิ่งของคุณ</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ระยะทาง (กิโลเมตร)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="เช่น 5.25"
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">เวลา (นาที)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="เช่น 35"
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">วันที่วิ่ง</label>
              <input
                type="date"
                required
                value={runDate}
                onChange={(e) => setRunDate(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">บันทึกความรู้สึก / หมายเหตุ</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="รู้สึกอย่างไร? สภาพอากาศเป็นอย่างไร?"
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">แนบรูปภาพ</label>
              <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {imagePreview ? (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover mb-3" />
                    <p className="text-xs text-orange-600 font-semibold">คลิกหรือลากไฟล์เพื่อเปลี่ยนรูป</p>
                  </div>
                ) : (
                  <div className="space-y-1 text-center pointer-events-none">
                    <ImageIcon className="mx-auto h-10 w-10 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <span className="font-semibold text-orange-600">อัปโหลดรูปภาพ</span>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP ขนาดไม่เกิน 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link href="/dashboard" className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {loading ? 'กำลังบันทึก...' : 'บันทึกการวิ่ง'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
