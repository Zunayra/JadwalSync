'use client'

import useSWR from 'swr'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { ClassItem, SIMULATED_TODAY, customEventToClassItem } from '@/lib/db'
import { useAuth } from '@/app/contexts/AuthContext'
import { useSchedule } from '@/app/contexts/ScheduleContext'
import Header from '@/app/components/Header'

const fetcher = (url: string) => fetch(url).then(r => r.json())

/* ─── Constants ──────────────────────────────────────────── */
const CELL_H = 48
const START_HOUR = 7
const END_HOUR = 19

const DAY_SHORTS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB']

/* ─── Helpers ────────────────────────────────────────────── */
function toTimeStr(decimal: number): string {
  const h = Math.floor(decimal)
  const m = Math.round((decimal - h) * 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

function hourLabel(h: number): string {
  if (h === 12) return '12 PM'
  if (h > 12) return `${h - 12} PM`
  return `${h} AM`
}

const HOURS      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const HALF_SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => i)

/* ─── Conflict layout engine ─────────────────────────────── */
interface EventLayout { col: number; totalCols: number }

function timesOverlap(a: ClassItem, b: ClassItem): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime
}

function computeLayout(events: ClassItem[]): Map<string, EventLayout> {
  const result = new Map<string, EventLayout>()
  if (!events.length) return result

  const sorted = [...events].sort((a, b) => a.startTime - b.startTime)
  const n = sorted.length
  const visited = new Set<number>()
  const components: number[][] = []

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue
    const component: number[] = []
    const queue = [i]
    visited.add(i)
    while (queue.length) {
      const curr = queue.shift()!
      component.push(curr)
      for (let j = 0; j < n; j++) {
        if (!visited.has(j) && timesOverlap(sorted[curr], sorted[j])) {
          visited.add(j)
          queue.push(j)
        }
      }
    }
    components.push(component)
  }

  for (const comp of components) {
    const group = comp.map(i => sorted[i]).sort((a, b) => a.startTime - b.startTime)
    const colEndTimes: number[] = []
    const colOf = new Map<string, number>()

    for (const e of group) {
      let lane = colEndTimes.findIndex(end => end <= e.startTime)
      if (lane === -1) { lane = colEndTimes.length; colEndTimes.push(0) }
      colEndTimes[lane] = e.endTime
      colOf.set(e.id, lane)
    }

    const totalCols = colEndTimes.length
    for (const e of group) {
      result.set(e.id, { col: colOf.get(e.id)!, totalCols })
    }
  }

  return result
}

/* ─── Event block ─────────────────────────────────────────── */
const OUTER_PAD = 2
const INNER_GAP = 2

function EventBlock({ event, layout }: { event: ClassItem; layout: EventLayout }) {
  const top    = (event.startTime - START_HOUR) * CELL_H
  const height = Math.max((event.endTime - event.startTime) * CELL_H - 2, 24)
  const { col, totalCols } = layout

  const slotW      = 100 / totalCols
  const leftInset  = col === 0             ? OUTER_PAD : INNER_GAP / 2
  const rightInset = col === totalCols - 1 ? OUTER_PAD : INNER_GAP / 2

  let colorClass: string
  if (event.isCustom) {
    colorClass = 'bg-teal-500 text-white'
  } else if (event.isMyClass) {
    colorClass = event.status === 'cancelled'
      ? 'bg-[#DF1923] text-white'
      : 'bg-[#F4A21C] text-[#3E2000]'
  } else if (event.classGroup === 'C') {
    colorClass = 'bg-indigo-100 border border-indigo-300 text-indigo-700'
  } else {
    colorClass = event.status === 'cancelled'
      ? 'bg-[#DF1923]/10 border border-[#DF1923]/30 text-[#DF1923]/70'
      : 'bg-[#F4A21C]/10 border border-[#F4A21C]/30 text-gray-500'
  }

  const isNarrow = totalCols > 1

  return (
    <div
      style={{
        top, height, position: 'absolute',
        left:  `calc(${col * slotW}% + ${leftInset}px)`,
        width: `calc(${slotW}% - ${leftInset + rightInset}px)`,
      }}
      className={`
        rounded-[6px] cursor-pointer overflow-hidden shadow-sm transition-all duration-150
        hover:brightness-95 active:brightness-90
        ${isNarrow ? 'hover:z-10 hover:scale-[1.03] hover:shadow-md' : ''}
        ${colorClass}
      `}
    >
      <div className="px-1.5 py-1 h-full flex flex-col overflow-hidden">
        <p className="text-[11px] font-semibold leading-snug line-clamp-2">
          {event.course}{event.isCustom ? '' : ` ${event.classGroup}`}
        </p>
        {height > 44 && (
          <p className="text-[10px] opacity-80 leading-tight mt-0.5 shrink-0">
            {toTimeStr(event.startTime)} – {toTimeStr(event.endTime)}
          </p>
        )}
        {height > 64 && (
          <p className="text-[10px] opacity-70 leading-tight mt-0.5 truncate shrink-0">
            {event.room}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Loading skeleton for calendar grid ────────────────── */
function CalendarSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#F4A21C] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-gray-400">Memuat jadwal minggu ini…</p>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function CalendarPage() {
  const { currentUser } = useAuth()
  const { activeDate, customEvents } = useSchedule()

  const weekStart = startOfWeek(activeDate, { weekStartsOn: 0 })
  const totalHeight = HOURS.length * CELL_H

  const DAYS = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i)
    return {
      short:   DAY_SHORTS[i],
      date:    d.getDate(),
      dateStr: format(d, 'yyyy-MM-dd'),
      isToday: isSameDay(d, SIMULATED_TODAY),
    }
  })

  // Fetches all classes for the current user — drives the weekly grid
  const { data: allClasses, isLoading } = useSWR<ClassItem[]>(
    `/api/schedule?userId=${currentUser.id}`,
    fetcher,
  )

  return (
    <div className="flex flex-col overflow-hidden bg-white font-sans" style={{ height: '100dvh' }}>

      <Header />

      <div className="flex flex-1 overflow-hidden">
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <div className="flex flex-col min-w-[640px]">

              {/* Day header row */}
              <div className="flex sticky top-0 bg-white z-20 border-b border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="w-14 shrink-0 flex items-end pb-2 pr-1 justify-end select-none">
                  <span className="text-[10px] text-gray-400 leading-none">GMT+07</span>
                </div>
                {DAYS.map((d, i) => (
                  <div key={i} className="flex-1 text-center py-2 min-w-0">
                    <p className={`text-[11px] font-medium uppercase tracking-wide mb-1 leading-none ${d.isToday ? 'text-[#F4A21C]' : 'text-gray-500'}`}>
                      {d.short}
                    </p>
                    <div
                      className={`
                        w-10 h-10 mx-auto rounded-full flex items-center justify-center
                        text-[22px] font-normal leading-none select-none cursor-pointer transition-colors
                        ${d.isToday ? 'bg-[#F4A21C] text-[#3E2000]' : 'text-gray-700 hover:bg-gray-100'}
                      `}
                    >
                      {d.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="flex" style={{ minHeight: totalHeight }}>

                {/* Hour labels */}
                <div className="w-14 shrink-0 relative select-none" style={{ minHeight: totalHeight }}>
                  {HOURS.map((h, i) => (
                    <div key={h} style={{ height: CELL_H }} className="relative">
                      {i > 0 && (
                        <span className="absolute right-2 -top-[9px] text-[10px] text-gray-400 leading-none whitespace-nowrap">
                          {hourLabel(h)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                <div className="flex flex-1" style={{ minHeight: totalHeight }}>
                  {DAYS.map((d, dayIdx) => {
                    const regularForDay = (allClasses ?? []).filter(e => e.dayIndex === dayIdx)
                    const customForDay  = customEvents
                      .filter(e => e.date === d.dateStr)
                      .map(customEventToClassItem)
                    const dayEvents = [...regularForDay, ...customForDay]
                    const layouts = computeLayout(dayEvents)

                    return (
                      <div
                        key={dayIdx}
                        className={`flex-1 relative border-l border-gray-200 min-w-0 ${d.isToday ? 'bg-[#F4A21C]/5' : ''}`}
                        style={{ minHeight: totalHeight }}
                      >
                        {HALF_SLOTS.map((slot) => (
                          <div
                            key={slot}
                            className={`absolute w-full ${slot % 2 === 0 ? 'border-t border-gray-200' : 'border-t border-gray-100'}`}
                            style={{ top: slot * (CELL_H / 2) }}
                          />
                        ))}

                        {dayEvents.map((e) => (
                          <EventBlock key={e.id} event={e} layout={layouts.get(e.id)!} />
                        ))}
                      </div>
                    )
                  })}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
