/**
 * Google Calendar API integration scaffold.
 * Replace placeholder env vars with real credentials from Google Cloud Console.
 * Docs: https://developers.google.com/calendar/api/guides/overview
 */

export const GOOGLE_OAUTH_CONFIG = {
  clientId:    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID    ?? 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET           ?? 'YOUR_CLIENT_SECRET',
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/api/auth/callback/google',
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ],
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  location?: string
  start: { dateTime: string; timeZone: string }
  end:   { dateTime: string; timeZone: string }
  recurrence?: string[]
  status?: 'confirmed' | 'tentative' | 'cancelled'
}

/** Builds the Google OAuth2 authorization URL. Redirect the user's browser here to begin the flow. */
export function buildAuthUrl(): string {
  const params = new URLSearchParams({
    client_id:     GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri:  GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope:         GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    access_type:   'offline',
    prompt:        'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/** Fetches events from the user's primary Google Calendar within a time range. */
export async function fetchEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime' })
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) throw new Error(`Google Calendar fetchEvents error: ${res.status}`)
  const data = await res.json()
  return data.items as GoogleCalendarEvent[]
}

/** Pushes a new event to the user's primary Google Calendar. */
export async function pushEvent(
  accessToken: string,
  event: Omit<GoogleCalendarEvent, 'id'>,
): Promise<GoogleCalendarEvent> {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(event),
    },
  )
  if (!res.ok) throw new Error(`Google Calendar pushEvent error: ${res.status}`)
  return res.json() as Promise<GoogleCalendarEvent>
}
