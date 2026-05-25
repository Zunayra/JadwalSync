'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { addDays, addWeeks, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { useSession, signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useSchedule } from '../contexts/ScheduleContext'
import { USERS, User, SIMULATED_TODAY } from '@/lib/db'
import AddEventModal from './AddEventModal'

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

/** Google "G" logomark */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function dropdownLabel(user: User): string {
  if (user.role === 'Dosen') return 'Muhammad Rifqi A. (Dosen)'
  return `${user.displayName.split(' ')[0]} (${user.id})`
}

export default function Header() {
  const pathname = usePathname()
  const isDaily = pathname === '/'
  const { currentUser, setCurrentUser } = useAuth()
  const { activeDate, setActiveDate } = useSchedule()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  function switchUser(user: User) {
    setCurrentUser(user)
    setOpen(false)
  }

  function navigatePrev() {
    setActiveDate(isDaily ? addDays(activeDate, -1) : addWeeks(activeDate, -1))
  }

  function navigateNext() {
    setActiveDate(isDaily ? addDays(activeDate, 1) : addWeeks(activeDate, 1))
  }

  function goToToday() {
    setActiveDate(new Date(SIMULATED_TODAY))
  }

  async function handleGCalSync() {
    if (!session) {
      signIn('google')
      return
    }
    setSyncing(true)
    setOpen(false)
    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      const data = await res.json() as { succeeded: number; failed: number; total: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Sync gagal')
      toast.success(
        `${data.succeeded} dari ${data.total} kelas disinkronkan ke Google Calendar!`,
        { description: data.failed > 0 ? `${data.failed} kelas gagal dikirim.` : undefined },
      )
    } catch (err) {
      toast.error('Gagal sinkronisasi ke Google Calendar.', {
        description: err instanceof Error ? err.message : 'Coba lagi nanti.',
      })
    } finally {
      setSyncing(false)
    }
  }

  const isToday = isSameDay(activeDate, SIMULATED_TODAY)

  let dateLabel: string
  if (isDaily) {
    dateLabel = activeDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  } else {
    const ws = startOfWeek(activeDate, { weekStartsOn: 0 })
    const we = endOfWeek(activeDate, { weekStartsOn: 0 })
    const sameMonth = ws.getMonth() === we.getMonth()
    if (sameMonth) {
      dateLabel = `${ws.getDate()}–${we.getDate()} ${we.toLocaleDateString('id-ID', { month: 'short' })}`
    } else {
      dateLabel = `${ws.getDate()} ${ws.toLocaleDateString('id-ID', { month: 'short' })} – ${we.getDate()} ${we.toLocaleDateString('id-ID', { month: 'short' })}`
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.04)] sticky top-0 z-30 shrink-0">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">

          {/* ── Left: Logo ───────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-[#F4A21C] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(244,162,28,0.35)] shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
            </div>
            <span className="text-[17px] font-bold text-[#1E1E1E] leading-none tracking-tight hidden sm:block">
              JadwalSync
            </span>
          </div>

          {/* ── Date Navigator ────────────────────────────── */}
          <div className="flex items-center gap-1 flex-1 sm:flex-none justify-center sm:justify-start">
            <button
              onClick={navigatePrev}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C]"
              aria-label="Sebelumnya"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={goToToday}
              className="text-[12px] font-semibold text-[#1E1E1E] hover:bg-gray-100 active:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors min-w-0 truncate max-w-[120px] sm:max-w-[180px]"
              title={isToday ? 'Hari ini' : 'Kembali ke hari ini'}
            >
              {dateLabel}
            </button>
            <button
              onClick={navigateNext}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C]"
              aria-label="Berikutnya"
            >
              <ChevronRight />
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="hidden sm:block text-[11px] font-semibold text-[#F4A21C] border border-[#F4A21C]/30 bg-[#FFFBF2] hover:bg-[#FFF3D0] px-2 py-0.5 rounded-lg transition-colors ml-1"
              >
                Hari ini
              </button>
            )}
          </div>

          {/* ── Center: Toggle ────────────────────────────── */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 shrink-0">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C] ${
                isDaily
                  ? 'bg-white text-[#1E1E1E] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon />
              <span className="hidden sm:inline">Hari Ini</span>
            </Link>
            <Link
              href="/calendar"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C] ${
                !isDaily
                  ? 'bg-white text-[#1E1E1E] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon />
              <span className="hidden sm:inline">Mingguan</span>
            </Link>
          </div>

          {/* ── Tambah Agenda (Dosen only) ─────────────────── */}
          {currentUser.role === 'Dosen' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold bg-[#F4A21C] text-white px-3 py-1.5 rounded-xl hover:bg-[#E09610] active:scale-[0.97] transition-all shadow-[0_2px_8px_rgba(244,162,28,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C] shrink-0"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Tambah Agenda</span>
            </button>
          )}

          {/* ── Profile dropdown ─────────────────────────── */}
          <div className="relative shrink-0" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 rounded-xl px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C]"
              aria-expanded={open}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-[#F4A21C] flex items-center justify-center shrink-0 shadow-[0_1px_4px_rgba(244,162,28,0.4)]">
                <span className="text-[11px] font-bold text-white select-none">
                  {currentUser.initials}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[13px] font-semibold text-[#1E1E1E] leading-none">
                  {currentUser.displayName}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-none">
                  {currentUser.role === 'Dosen' ? 'Dosen Pengampu' : `Semester 4 · ${currentUser.id}`}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.10),0_16px_48px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden z-50">
                <div className="px-3.5 py-2.5 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Simulasi Login
                  </p>
                </div>
                {USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className={`w-full text-left px-3.5 py-2.5 text-[13px] font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${
                      currentUser.id === user.id ? 'text-[#F4A21C]' : 'text-[#1E1E1E]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                        currentUser.id === user.id ? 'bg-[#F4A21C]' : 'bg-transparent border border-gray-300'
                      }`}
                    />
                    <span className="flex-1 min-w-0">{dropdownLabel(user)}</span>
                    {user.role === 'Dosen' && (
                      <span className="text-[10px] font-semibold text-white bg-[#1E1E1E] px-1.5 py-0.5 rounded-md shrink-0">
                        DOSEN
                      </span>
                    )}
                  </button>
                ))}

                {/* ── Google Calendar sync ───── */}
                <div className="border-t border-gray-100">
                  {session?.user?.email && (
                    <div className="px-3.5 pt-2 pb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <p className="text-[11px] text-gray-500 truncate">{session.user.email}</p>
                    </div>
                  )}
                  <button
                    onClick={handleGCalSync}
                    disabled={syncing}
                    className="w-full text-left px-3.5 py-2.5 text-[13px] font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors text-[#1E1E1E] disabled:opacity-60"
                  >
                    {syncing ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-[#4285F4] rounded-full animate-spin shrink-0" />
                    ) : (
                      <GoogleIcon />
                    )}
                    {session
                      ? syncing ? 'Menyinkronkan…' : 'Sync ke Google Calendar'
                      : 'Login Google & Sync Kalender'}
                  </button>
                </div>

                <div className="border-t border-gray-100">
                  <button
                    onClick={() => { switchUser(USERS[0]); setOpen(false) }}
                    className="w-full text-left px-3.5 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {showModal && <AddEventModal onClose={() => setShowModal(false)} />}
    </>
  )
}
