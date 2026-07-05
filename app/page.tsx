import Link from 'next/link'
import { Activity, ArrowRight, Shield, Dumbbell } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <Activity className="w-6 h-6" />
          <span>RunnerTracker</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors">
            เริ่มต้นใช้งาน
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-6 text-center max-w-4xl mx-auto py-20">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
          บันทึกการวิ่งของคุณ <span className="text-orange-600">พิชิตทุกเป้าหมาย</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl">
          มาวิ่งกันเถอะ
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all shadow-md hover:shadow-lg">
            เริ่มต้นฟรี <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <section className="grid md:grid-cols-3 gap-8 mt-24 text-left w-full max-w-5xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">บันทึกสถิติการวิ่ง</h3>
            <p className="text-slate-600 text-sm">บันทึกระยะทาง เวลา และบันทึกส่วนตัวของการวิ่งแต่ละครั้งได้อย่างแม่นยำและปลอดภัย</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">เก็บภาพความทรงจำ</h3>
            <p className="text-slate-600 text-sm">อัปโหลดรูปภาพจากเส้นทางวิ่งหรือเซลฟี่ผ่าน Supabase Storage ได้โดยตรง</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">ความปลอดภัยสูงสุด</h3>
            <p className="text-slate-600 text-sm">ข้อมูลของคุณถูกแยกและปกป้องด้วยมาตรฐาน PostgreSQL Row Level Security (RLS)</p>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-sm text-slate-500">
        © 2026 RunnerTracker System. สร้างขึ้นเพื่อประสิทธิภาพสูงสุด
      </footer>
    </div>
  )
}
