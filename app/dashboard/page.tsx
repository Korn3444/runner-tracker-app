import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Activity, Plus, Calendar, Map, Clock, LogOut } from 'lucide-react'
import DeleteButton from './DeleteButton'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ดึงข้อมูลการวิ่งของผู้ใช้ที่ล็อกอินอยู่
  const { data: runs, error } = await supabase
    .from('runs')
    .select('*')
    .order('run_date', { ascending: false })

  if (error) {
    console.error('Error fetching runs:', error)
  }

  // คำนวณหาผลรวมของ Metrics
  const totalDistance = runs?.reduce((sum, run) => sum + Number(run.distance_km), 0) || 0
  const totalDuration = runs?.reduce((sum, run) => sum + Number(run.duration_minutes), 0) || 0
  const totalRuns = runs?.length || 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* แถบนำทางด้านบน */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl text-orange-600">
            <Activity className="w-6 h-6" />
            <span>RunnerTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* พื้นที่หลัก */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ส่วนหัว */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">แดชบอร์ดการวิ่ง</h1>
            <p className="text-sm text-slate-500">ติดตามสถิติและประวัติการวิ่งของคุณ</p>
          </div>
          <Link
            href="/dashboard/runs/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" /> บันทึกการวิ่งใหม่
          </Link>
        </div>

        {/* กริดสถิติ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ระยะทางรวม</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalDistance.toFixed(2)} กม.</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">เวลารวม</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalDuration} นาที</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">จำนวนครั้งทั้งหมด</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalRuns} ครั้ง</h3>
            </div>
          </div>
        </div>

        {/* ประวัติการวิ่ง */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">ประวัติการวิ่งล่าสุด</h2>
        {!runs || runs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-medium mb-1">ยังไม่มีบันทึกการวิ่ง</p>
            <p className="text-slate-400 text-sm mb-4">ออกไปวิ่งแล้วบันทึกครั้งแรกของคุณเลย!</p>
            <Link
              href="/dashboard/runs/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              บันทึกการวิ่งครั้งแรก
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {runs.map((run) => (
              <div key={run.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  {run.image_url ? (
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={run.image_url}
                        alt="ภาพการวิ่ง"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-slate-100 border-b border-slate-100 flex items-center justify-center text-slate-300">
                      <Map className="w-10 h-10" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(run.run_date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">ระยะทาง</span>
                        <span className="text-lg font-extrabold text-slate-800">{run.distance_km} <span className="text-xs font-normal text-slate-500">กม.</span></span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">เวลา</span>
                        <span className="text-lg font-extrabold text-slate-800">{run.duration_minutes} <span className="text-xs font-normal text-slate-500">นาที</span></span>
                      </div>
                    </div>
                    {run.notes && (
                      <p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                        &ldquo;{run.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex gap-2 border-t border-slate-50">
                  <Link
                    href={`/dashboard/runs/${run.id}/edit`}
                    className="flex-1 py-2 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    แก้ไข
                  </Link>
                  <DeleteButton id={run.id} imageUrl={run.image_url} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
