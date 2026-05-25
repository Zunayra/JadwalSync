'use client'

import { useState, useEffect, useRef } from 'react'
import { useSchedule } from '@/app/contexts/ScheduleContext'
import { ROOMS } from '@/lib/db'
import { format } from 'date-fns'

interface Props {
  onClose: () => void
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

function dateStrDayIndex(dateStr: string): number {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).getDay()
}

export default function AddEventModal({ onClose }: Props) {
  const { addCustomEvent, activeDate } = useSchedule()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [title, setTitle]         = useState('')
  const [type, setType]           = useState<'Praktikum' | 'Sidang' | 'Training'>('Praktikum')
  const [date, setDate]           = useState(format(activeDate, 'yyyy-MM-dd'))
  const [timeStart, setTimeStart] = useState('10:30')
  const [timeEnd, setTimeEnd]     = useState('13:00')
  const [room, setRoom]           = useState('')
  const [error, setError]         = useState('')

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  function handleSave() {
    if (!title.trim()) { setError('Judul agenda wajib diisi.'); return }
    if (!room.trim())  { setError('Ruangan wajib dipilih.'); return }
    if (parseTime(timeEnd) <= parseTime(timeStart)) {
      setError('Waktu selesai harus setelah waktu mulai.')
      return
    }

    addCustomEvent({
      title: title.trim(),
      type,
      date,
      dayIndex: dateStrDayIndex(date),
      timeStart,
      timeEnd,
      startTime: parseTime(timeStart),
      endTime: parseTime(timeEnd),
      room,
    })
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F4A21C] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(244,162,28,0.35)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1E1E1E] leading-none">Tambah Agenda</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Jadwal Kustom / Ad-hoc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Judul Agenda</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Cth: Praktikum Data Science"
              className="w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F4A21C] focus:border-transparent placeholder:text-gray-300 text-[#1E1E1E] transition"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Tipe</label>
            <div className="flex gap-2">
              {(['Praktikum', 'Sidang', 'Training'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 text-[12px] font-semibold py-2 rounded-xl border-2 transition-all ${
                    type === t
                      ? 'border-[#F4A21C] bg-[#FFFBF2] text-[#D97706]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F4A21C] focus:border-transparent text-[#1E1E1E] transition"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Mulai</label>
              <input
                type="time"
                value={timeStart}
                onChange={e => setTimeStart(e.target.value)}
                className="w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F4A21C] focus:border-transparent text-[#1E1E1E] transition"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Selesai</label>
              <input
                type="time"
                value={timeEnd}
                onChange={e => setTimeEnd(e.target.value)}
                className="w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F4A21C] focus:border-transparent text-[#1E1E1E] transition"
              />
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Ruangan</label>
            <select
              value={room}
              onChange={e => setRoom(e.target.value)}
              className="w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F4A21C] focus:border-transparent text-[#1E1E1E] bg-white transition"
            >
              <option value="">Pilih ruangan…</option>
              {ROOMS.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name} — {r.building} ({r.capacity} kursi)
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 py-2.5 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 text-[13px] font-semibold bg-[#F4A21C] text-white py-2.5 rounded-xl hover:bg-[#E09610] active:scale-[0.97] transition-all shadow-[0_2px_8px_rgba(244,162,28,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A21C]"
          >
            Simpan Agenda
          </button>
        </div>

      </div>
    </div>
  )
}
