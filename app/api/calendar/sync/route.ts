import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClassesForUser } from '@/lib/db'
import { google } from 'googleapis'

function formatGCalDateTime(date: Date, h: number, m: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(h)}:${pad(m)}:00`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { userId } = await req.json() as { userId: string }
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const classes = getClassesForUser(userId).filter(
    c => c.isMyClass && c.status !== 'cancelled',
  )

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ access_token: session.accessToken })
  const calendar = google.calendar({ version: 'v3', auth })

  // Anchor: Sunday May 10, 2026 — dayIndex 1 = Mon May 11, etc.
  const weekStart = new Date(2026, 4, 10)

  const results = await Promise.allSettled(
    classes.map((c) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + c.dayIndex)

      const [startH, startM] = c.timeStart.split(':').map(Number)
      const [endH, endM] = c.timeEnd.split(':').map(Number)

      return calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `${c.course} Kelas ${c.classGroup}`,
          location: c.room,
          start: {
            dateTime: formatGCalDateTime(day, startH, startM),
            timeZone: 'Asia/Jakarta',
          },
          end: {
            dateTime: formatGCalDateTime(day, endH, endM),
            timeZone: 'Asia/Jakarta',
          },
          recurrence: ['RRULE:FREQ=WEEKLY'],
        },
      })
    }),
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ succeeded, failed, total: classes.length })
}
