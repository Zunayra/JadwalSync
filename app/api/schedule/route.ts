import { NextRequest, NextResponse } from 'next/server'
import { getClassesForUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const classes = getClassesForUser(userId)

  if (date) {
    // Filter to just the requested day-of-week
    const dayOfWeek = new Date(date).getDay() // 0=Sun, 1=Mon, … same as dayIndex
    return NextResponse.json(classes.filter(c => c.dayIndex === dayOfWeek))
  }

  return NextResponse.json(classes)
}
