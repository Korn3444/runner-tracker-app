'use client'

import React from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({ id, imageUrl }: { id: string; imageUrl: string | null }) {
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบบันทึกการวิ่งนี้ใช่หรือไม่?')) return
    setDeleting(true)
    try {
      const { createClient: createBrowserClient } = await import('@/utils/supabase/client')
      const supabase = createBrowserClient()

      // 1. ลบรูปออกจาก Storage ก่อนหากมีรูปภาพผูกอยู่
      if (imageUrl) {
        const urlParts = imageUrl.split('/storage/v1/object/public/run-images/')
        if (urlParts.length === 2) {
          const filePath = urlParts[1]
          await supabase.storage.from('run-images').remove([filePath])
        }
      }

      // 2. ลบ Row ข้อมูลออกจาก Database
      const { error } = await supabase.from('runs').delete().eq('id', id)
      if (error) throw error

      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all disabled:opacity-50"
      title="ลบบันทึก"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
