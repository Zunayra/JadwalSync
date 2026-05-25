'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { addDays, startOfWeek, format } from 'date-fns'
import {
  ClassItem, ClassStatus,
  customEventToClassItem,
  ROOMS, CLASSES, IUP_ALLOWED_BUILDINGS,
} from '@/lib/db'
import { useAuth } from '@/app/contexts/AuthContext'
import { useSchedule } from '@/app/contexts/ScheduleContext'
import Header from '@/app/components/Header'

const fetcher = (url: string) => fetch(url).then(r => r.json())

/* ─── Status config ─────────────────────────────────────── */
const STATUS_CONFIG: Record<ClassStatus, { label: string; badge: string; dot: string }> = {
  'on-time': {
    label: 'Tepat Waktu',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  'online': {
    label: 'Online',
    badge: 'bg-blue-50 text-blue-600 border border-blue-200',
    dot: 'bg-blue-500',
  },
  'cancelled': {
    label: 'Dibatalkan',
    badge: 'bg-red-50 text-[#C62828] border border-red-200',
    dot: 'bg-[#DF1923]',
  },
}

/* ─── Icons ─────────────────────────────────────────────── */
function ClockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  )
}

function PinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  )
}

function PersonIcon({ size = 12 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function ChairIcon({ size = 12 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4M5 10h14M5 10l-1 9h16l-1-9" />
    </svg>
  )
}

/* ─── Status Badge ──────────────────────────────────────── */
function StatusBadge({ status }: { status: ClassStatus }) {
  const { label, badge, dot } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap leading-none ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  )
}

/* ─── Regular Class Card ────────────────────────────────── */
function ClassCard({ item }: { item: ClassItem }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-shadow p-5 ${item.isCustom ? 'border-[#F4A21C]/30 bg-[#FFFBF2]' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-2.5">
        {item.isCustom ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F4A21C]/10 text-[#D97706] border border-[#F4A21C]/30 whitespace-nowrap leading-none">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#F4A21C]" />
            Agenda
          </span>
        ) : (
          <StatusBadge status={item.status} />
        )}
        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
          {item.isCustom ? item.classGroup : `Kelas ${item.classGroup}`}
        </span>
      </div>
      <h3 className="text-[17px] font-bold text-[#1E1E1E] leading-snug mb-3">{item.course}</h3>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-gray-500">
        <span className="flex items-center gap-1.5"><ClockIcon />{item.timeStart} - {item.timeEnd}</span>
        <span className="flex items-center gap-1.5"><PinIcon />{item.room}</span>
      </div>
      {item.zoomLink && (
        <div className="mt-3.5">
          <a
            href={item.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <VideoIcon />Join Zoom
          </a>
        </div>
      )}
    </div>
  )
}

/* ─── Loading skeleton ──────────────────────────────────── */
function ScheduleSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-5">
          <div className="w-7 pt-5 shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 animate-pulse mx-auto" />
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-full" />
              <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-md" />
            </div>
            <div className="h-5 w-56 bg-gray-200 animate-pulse rounded-md" />
            <div className="flex gap-5">
              <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
              <div className="h-4 w-28 bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Replacement slot generator ────────────────────────── */
const TIME_BLOCKS = [
  { timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10 },
  { timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13 },
  { timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16 },
]

interface ReplacementSlot {
  id: number
  day: string
  dayIndex: number
  timeStart: string
  timeEnd: string
  room: string
  roomCapacity: number
  roomBuilding: string
  conflict: number
}

function generateSlots(item: ClassItem, allClasses: ClassItem[], activeDate: Date): ReplacementSlot[] {
  const isIUP = item.classGroup === 'C'
  const eligibleRooms = isIUP
    ? ROOMS.filter(r => IUP_ALLOWED_BUILDINGS.includes(r.building))
    : ROOMS

  const weekStart = startOfWeek(activeDate, { weekStartsOn: 0 })
  const slots: ReplacementSlot[] = []
  let idCounter = 1

  const candidateDayIndices = [1, 2, 3, 4, 5].filter(d => d !== item.dayIndex)

  for (const dayIdx of candidateDayIndices) {
    const slotDate = addDays(weekStart, dayIdx)
    const dayLabel = slotDate.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long',
    })

    for (const block of TIME_BLOCKS) {
      const occupiedRooms = new Set(
        CLASSES.filter(c =>
          c.dayIndex === dayIdx &&
          c.startTime < block.endTime &&
          block.startTime < c.endTime &&
          c.status !== 'cancelled'
        ).map(c => c.room)
      )

      const available = eligibleRooms
        .filter(r => !occupiedRooms.has(r.name))
        .sort((a, b) => b.capacity - a.capacity)

      if (available.length === 0) continue

      const conflictCount = allClasses.filter(c =>
        c.isMyClass &&
        c.dayIndex === dayIdx &&
        c.startTime < block.endTime &&
        block.startTime < c.endTime &&
        c.status !== 'cancelled'
      ).length

      slots.push({
        id: idCounter++,
        day: dayLabel,
        dayIndex: dayIdx,
        timeStart: block.timeStart,
        timeEnd: block.timeEnd,
        room: available[0].name,
        roomCapacity: available[0].capacity,
        roomBuilding: available[0].building,
        conflict: conflictCount,
      })

      if (slots.length >= 3) return slots
    }
  }

  return slots
}

/* ─── Cancelled Card (RBAC-aware) ───────────────────────── */
function CancelledCard({
  item,
  allClasses,
  activeDate,
}: {
  item: ClassItem
  allClasses: ClassItem[]
  activeDate: Date
}) {
  const { currentUser } = useAuth()
  const isDosen = currentUser.role === 'Dosen'
  const isIUP = item.classGroup === 'C'

  const [expanded, setExpanded]   = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [mode, setMode]           = useState<'offline' | 'online'>('offline')

  const slots = useMemo(
    () => generateSlots(item, allClasses, activeDate),
    [item, allClasses, activeDate]
  )

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status="cancelled" />
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              Kelas {item.classGroup}
              {isIUP && (
                <span className="ml-1 text-[10px] font-bold text-indigo-600">(IUP)</span>
              )}
            </span>
          </div>
          {isDosen && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Cari Jadwal Pengganti
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        <h3 className="text-[17px] font-bold text-gray-400 line-through leading-snug mb-3">
          {item.course}
        </h3>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-gray-400">
          <span className="flex items-center gap-1.5"><ClockIcon />{item.timeStart} - {item.timeEnd}</span>
          <span className="flex items-center gap-1.5"><PinIcon />{item.room}</span>
        </div>

        {!isDosen && (
          <p className="mt-3 text-[12px] text-gray-400 italic leading-relaxed">
            Menunggu dosen menetapkan jadwal pengganti.
          </p>
        )}
      </div>

      {/* ── Rekomendasi Cerdas panel (Dosen only) ──────── */}
      {isDosen && expanded && (
        <div className="bg-[#FFFBF2] border-t border-orange-100 p-5">

          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[15px] leading-none select-none">💡</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1E1E1E] leading-snug">Rekomendasi Cerdas</p>
              <p className="text-[12px] text-[#D97706] mt-0.5">
                {isIUP
                  ? 'IUP — hanya ruangan Creation Lab (Delta) & Epsilon'
                  : `Slot kosong tersedia untuk ${item.course}`}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Metode Pengganti</p>
            <div className="flex gap-2">
              {(['offline', 'online'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-2 text-[12px] font-semibold py-2 rounded-xl border-2 transition-all ${
                    mode === m
                      ? m === 'online'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-[#F4A21C] bg-[#FFFBF2] text-[#D97706]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {m === 'offline' ? (
                    <><PinIcon size={13} />Offline (Ruangan)</>
                  ) : (
                    <><VideoIcon />Online (Zoom)</>
                  )}
                </button>
              ))}
            </div>
          </div>

          {mode === 'online' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <VideoIcon />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-blue-800">Kelas dialihkan ke Zoom</p>
                  <p className="text-[12px] text-blue-600 mt-0.5 leading-relaxed">
                    Ruangan <span className="font-semibold">{item.room}</span> dibebaskan dan tersedia untuk SBA menjadwalkan kegiatan lain.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item.room} — Dibebaskan
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'offline' && (
            <>
              {slots.length === 0 ? (
                <p className="text-[12px] text-gray-400 italic text-center py-4">
                  Tidak ada slot kosong yang memenuhi syarat ditemukan.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {slots.map((slot, i) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(i)}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C] ${
                        selectedSlot === i
                          ? 'border-[#F4A21C] bg-[#FFFBF2] shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2.5 gap-1">
                        <p className="text-[12px] font-bold text-[#1E1E1E] leading-snug">{slot.day}</p>
                        {selectedSlot === i && (
                          <div className="w-5 h-5 rounded-full bg-[#F4A21C] flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <ClockIcon size={11} />{slot.timeStart} – {slot.timeEnd}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <PinIcon size={11} />{slot.room}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <ChairIcon size={11} />{slot.roomCapacity} kursi · {slot.roomBuilding}
                        </p>
                        <p className={`text-[11px] font-semibold flex items-center gap-1.5 ${slot.conflict > 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
                          <PersonIcon />{slot.conflict > 0 ? `${slot.conflict} mahasiswa konflik` : 'Tidak ada konflik'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {mode === 'online'
                ? 'Mahasiswa akan menerima notifikasi Zoom.'
                : 'Pilih slot untuk mengajukan jadwal pengganti'}
            </p>
            <button className="flex items-center gap-2 text-[13px] font-semibold bg-[#F4A21C] text-white px-4 py-2 rounded-xl hover:bg-[#E09610] active:scale-[0.97] transition-all shadow-[0_2px_8px_rgba(244,162,28,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C] shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Setujui &amp; Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { activeDate, customEvents } = useSchedule()

  const activeDateStr = format(activeDate, 'yyyy-MM-dd')

  // Fetches only today's classes — key changes on date navigation → triggers re-fetch + loading state
  const { data: dailyClasses, isLoading: isDailyLoading } = useSWR<ClassItem[]>(
    `/api/schedule?userId=${currentUser.id}&date=${activeDateStr}`,
    fetcher,
  )

  // Fetches all classes for the user — used by generateSlots for conflict detection
  const { data: allClasses = [] } = useSWR<ClassItem[]>(
    `/api/schedule?userId=${currentUser.id}`,
    fetcher,
  )

  const schedule = [
    ...(dailyClasses ?? []).filter(c => c.isMyClass),
    ...customEvents
      .filter(e => e.date === activeDateStr)
      .map(customEventToClassItem),
  ].sort((a, b) => a.startTime - b.startTime)

  const dateHeading = activeDate.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8 pb-16">

        {/* ── Date headline + legend ──────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[26px] font-bold text-[#1E1E1E] leading-tight capitalize">{dateHeading}</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              {isDailyLoading ? 'Memuat jadwal…' : `${schedule.length} kelas dijadwalkan`}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 shrink-0 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />Aktif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DF1923] shrink-0" />Batal
            </span>
          </div>
        </div>

        {/* ── Timeline ───────────────────────────────────── */}
        {isDailyLoading ? (
          <ScheduleSkeleton />
        ) : schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-gray-400">Tidak ada kelas hari ini</p>
            <p className="text-[12px] text-gray-300 mt-1">Gunakan navigasi untuk melihat hari lain</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[13px] top-6 bottom-6 w-[2px] bg-gray-200 rounded-full" />
            <div className="space-y-5">
              {schedule.map((item) => (
                <div key={item.id} className="flex gap-5">
                  <div className="relative z-10 shrink-0 flex justify-center pt-[22px]" style={{ width: 28 }}>
                    <div
                      className={`w-3.5 h-3.5 rounded-full ring-[3px] ring-[#F9FAFB] shadow-sm ${
                        item.isCustom ? 'bg-[#F4A21C]' : STATUS_CONFIG[item.status].dot
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.status === 'cancelled'
                      ? <CancelledCard item={item} allClasses={allClasses} activeDate={activeDate} />
                      : <ClassCard item={item} />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between text-[11px] text-gray-400">
          <p>JadwalSync · FEB Unpad</p>
          <p>© 2026</p>
        </div>
      </main>
    </div>
  )
}
