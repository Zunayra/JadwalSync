import { getClassesForUser } from './db'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDT(date: Date, h: number, m: number): string {
  const y = date.getFullYear()
  const mo = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  return `${y}${mo}${d}T${pad(h)}${pad(m)}00`
}

export function generateICS(userId: string): string {
  const classes = getClassesForUser(userId).filter(c => c.isMyClass)

  // Week anchor: Sunday May 10, 2026 (first day of the simulated week)
  const weekStart = new Date(2026, 4, 10)

  const events = classes.map(c => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + c.dayIndex)

    const [startH, startM] = c.timeStart.split(':').map(Number)
    const [endH, endM] = c.timeEnd.split(':').map(Number)

    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatDT(day, startH, startM)}`,
      `DTEND:${formatDT(day, endH, endM)}`,
      'RRULE:FREQ=WEEKLY',
      `SUMMARY:${c.course} Kelas ${c.classGroup}`,
      `LOCATION:${c.room}`,
      `UID:${c.id}@jadwalsync.feb.unpad.ac.id`,
      `STATUS:${c.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
    ].join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JadwalSync//FEB Unpad//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:JadwalSync FEB Unpad',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}
