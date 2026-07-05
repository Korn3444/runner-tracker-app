'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Activity, ArrowLeft, Save, ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function EditRunPage() {
  const router = useRouter()
  const params = useParams()
  const runId = params?.id as string
  const supabase = createClient()

  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [runDate, setRunDate] = useState('')
  const [notes, setNotes] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // ห่อฟังก์ชันใน useCallback เพื่อใช้ใน useEffect อย่างปลอดภัย
  const fetchRunDetails = useCallback(async () => {
    try {
      const { data: run, error } = await supabase
        .from('runs')
        .select('*')
        .eq('id', runId)
        .single()

      if (error) throw error
      if (!run) throw new Error('ไม่พบข้อมูลการวิ่งที่ต้องการ')

      setDistance(run.distance_km.toString())
      setDuration(run.duration_minutes.toString())
      setRunDate(new Date(run.run_date).toISOString().split('T')[0])
      setNotes(run.notes || '')
      setExistingImageUrl(run.image_url)
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถโหลดข้อมูลการวิ่งได้')
    } finally {
      setInitializing(false)
    }
  }, [runId, supabase])

  useEffect(() => {
    if (runId) {
      fetchRunDetails()
    }
  }, [runId, fetchRunDetails])

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

      let updatedImageUrl = existingImageUrl

      // จัดการอัปโหลดไฟล์ตัวใหม่เข้าไปล้างไฟล์เก่าทิ้งออกถ้ามีการระบุมาใหม่
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        // ลบไฟล์ตัวเดิมออกไปจาก Storage Bucket เคลียร์สเปซเนื้อที่ว่าง
        if (existingImageUrl) {
          const urlParts = existingImageUrl.split('/storage/v1/object/public/run-images/')
          if (urlParts.length === 2) {
            await supabase.storage.from('run-images').remove([urlParts[1]])
          }
        }

        const { error: uploadError } = await supabase.storage
          .from('run-images')
          .upload(fileName, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('run-images')
          .getPublicUrl(fileName)

        updatedImageUrl = publicUrl
      }

      // บันทึกและแมปอัปเดตลงตาราง SQL database
      const { error: updateError } = await supabase
        .from('runs')
        .update({
          distance_km: parseFloat(distance),
          duration_minutes: parseInt(duration, 10),
          run_date: new Date(runDate).toISOString(),
          notes: notes || null,
          image_url: updatedImageUrl
        })
        .eq('id', runId)

      if (updateError) throw updateError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-medium text-sm text-slate-500">
        กำลังโหลดข้อมูล...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> ยกเลิกการแก้ไข
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">แก้ไขบันทึกการวิ่ง</h1>
              <p className="text-xs text-slate-400">แก้ไขข้อมูลหรือเปลี่ยนรูปภาพของการวิ่ง</p>
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
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">รูปภาพ</label>
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
                    <p className="text-xs text-orange-600 font-semibold">คลิกเพื่อเปลี่ยนรูปภาพ</p>
                  </div>
                ) : existingImageUrl ? (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={existingImageUrl} alt="รูปภาพปัจจุบัน" className="max-h-40 mx-auto rounded-lg object-cover mb-3" />
                    <p className="text-xs text-slate-500">รูปภาพปัจจุบัน คลิกเพื่อเปลี่ยน</p>
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
                <Save className="w-4 h-4" /> {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
