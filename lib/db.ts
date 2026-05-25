/* ─── Types ──────────────────────────────────────────────── */
export type ClassStatus = 'on-time' | 'online' | 'cancelled'

export interface MasterClass {
  id: string
  course: string
  classGroup: string
  code: string
  dayIndex: number   // 0=MIN(Sun) 1=SEN(Mon) 2=SEL(Tue) 3=RAB(Wed) 4=KAM(Thu) 5=JUM(Fri) 6=SAB(Sat)
  timeStart: string  // "HH:MM"
  timeEnd: string    // "HH:MM"
  startTime: number  // decimal hours for calendar grid (e.g. 7.5 = 07:30)
  endTime: number
  room: string
  status: ClassStatus
  zoomLink?: string
}

// ClassItem = MasterClass + isMyClass resolved per-user at runtime
export interface ClassItem extends MasterClass {
  isMyClass: boolean
  isCustom?: boolean // true for ad-hoc custom events
}

export interface User {
  id: string
  name: string          // full legal name
  displayName: string   // short name for the header chip
  role: 'Mahasiswa' | 'Dosen'
  initials: string
}

export interface Enrollment {
  userId: string
  classId: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  building: string
}

export interface CustomEvent {
  id: string
  title: string
  type: 'Praktikum' | 'Sidang' | 'Training'
  date: string        // "YYYY-MM-DD"
  dayIndex: number    // 0-6, derived from date
  timeStart: string   // "HH:MM"
  timeEnd: string     // "HH:MM"
  startTime: number   // decimal hours
  endTime: number
  room: string
}

/* ─── Simulation: Today is Senin, 11 Mei 2026 ───────────── */
export const TODAY_DAY_INDEX = 1
export const SIMULATED_TODAY = new Date(2026, 4, 11) // May 11, 2026

/* ─── Rooms ──────────────────────────────────────────────── */
// IUP classes (Kelas C) may ONLY be placed in Delta (Creation Lab) or Epsilon buildings
export const IUP_ALLOWED_BUILDINGS = ['Delta', 'Epsilon']

export const ROOMS: Room[] = [
  { id: 'lambda-106', name: 'Lambda 106', capacity: 40, building: 'Lambda' },
  { id: 'lambda-107', name: 'Lambda 107', capacity: 40, building: 'Lambda' },
  { id: 'lambda-108', name: 'Lambda 108', capacity: 40, building: 'Lambda' },
  { id: 'lambda-201', name: 'Lambda 201', capacity: 35, building: 'Lambda' },
  { id: 'lambda-202', name: 'Lambda 202', capacity: 35, building: 'Lambda' },
  { id: 'lambda-204', name: 'Lambda 204', capacity: 35, building: 'Lambda' },
  { id: 'lambda-205', name: 'Lambda 205', capacity: 35, building: 'Lambda' },
  { id: 'lambda-207', name: 'Lambda 207', capacity: 40, building: 'Lambda' },
  { id: 'lambda-210', name: 'Lambda 210', capacity: 45, building: 'Lambda' },
  { id: 'epsilon-308', name: 'Epsilon 308', capacity: 50, building: 'Epsilon' },
  { id: 'epsilon-309', name: 'Epsilon 309', capacity: 50, building: 'Epsilon' },
  { id: 'epsilon-310', name: 'Epsilon 310', capacity: 50, building: 'Epsilon' },
  { id: 'labkom-1',   name: 'Labkom 1',    capacity: 30, building: 'Labkom' },
  { id: 'delta-103',  name: 'Delta 1.03',  capacity: 35, building: 'Delta' },
  { id: 'delta-104',  name: 'Delta 1.04',  capacity: 35, building: 'Delta' },
]

/* ─── Users ──────────────────────────────────────────────── */
export const USERS: User[] = [
  {
    id: '120510240028',
    name: 'Zunaira Habiba Khoirunnisa',
    displayName: 'Zunaira Habiba',
    role: 'Mahasiswa',
    initials: 'ZH',
  },
  {
    id: '120510240036',
    name: "Putry Vi'Azdha Rany",
    displayName: "Putry Vi'Azdha",
    role: 'Mahasiswa',
    initials: 'PV',
  },
  {
    id: 'DSN-001',
    name: 'Muhammad Rifqi Arviansyah, S.E., M.S.M',
    displayName: 'M. Rifqi Arviansyah',
    role: 'Dosen',
    initials: 'MR',
  },
]

/* ─── Master Class Schedule ──────────────────────────────── */
export const CLASSES: MasterClass[] = [

  // ── Senin (Mon) ────────────────────────────────────────
  // Teknologi Finansial A — both students enrolled; Dosen teaches; DIBATALKAN
  {
    id: 'tekfin-a',
    course: 'Teknologi Finansial', classGroup: 'A', code: 'B10E.5106',
    dayIndex: 1, timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    room: 'Lambda 107', status: 'cancelled',
  },
  // Pengembangan Web A — Putry enrolled
  {
    id: 'penWeb-a',
    course: 'Pengembangan Web', classGroup: 'A', code: 'B10E.2108',
    dayIndex: 1, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Lambda 106', status: 'on-time',
  },
  // Pengembangan Web B — Zunaira enrolled (same day/time, different room)
  {
    id: 'penWeb-b',
    course: 'Pengembangan Web', classGroup: 'B', code: 'B10E.2108',
    dayIndex: 1, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Lambda 108', status: 'on-time',
  },
  // IUP Kelas C — Teknologi Finansial C (Mon 07:30-10:00)
  {
    id: 'tf-c',
    course: 'Teknologi Finansial', classGroup: 'C', code: 'B10E.5106',
    dayIndex: 1, timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    room: 'Delta 1.03', status: 'on-time',
  },
  // IUP Kelas C — Pengembangan Web C (Mon 13:30-16:00)
  {
    id: 'pw-c',
    course: 'Pengembangan Web', classGroup: 'C', code: 'B10E.2108',
    dayIndex: 1, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Delta 1.04', status: 'on-time',
  },

  // ── Selasa (Tue) ───────────────────────────────────────
  // Pengambilan Keputusan B — Putry enrolled (Selasa 07:30-10:00)
  {
    id: 'keputusan-b',
    course: 'Pengambilan Keputusan dan Pemecahan Masalah', classGroup: 'B', code: 'B10E.3106',
    dayIndex: 2, timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    room: 'Lambda 201', status: 'on-time',
  },
  // Mengelola Organisasi Digital A — Zunaira enrolled
  {
    id: 'orgDig-a',
    course: 'Mengelola Organisasi Digital', classGroup: 'A', code: 'B10E.4101',
    dayIndex: 2, timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    room: 'Lambda 202', status: 'online', zoomLink: 'https://zoom.us/j/98765432100',
  },
  // Mengelola Organisasi Digital B — Putry enrolled (same slot)
  {
    id: 'orgDig-b',
    course: 'Mengelola Organisasi Digital', classGroup: 'B', code: 'B10E.4101',
    dayIndex: 2, timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    room: 'Lambda 204', status: 'on-time',
  },
  // Penilaian Bisnis A — both students enrolled
  {
    id: 'penBis-a',
    course: 'Penilaian Bisnis', classGroup: 'A', code: 'B10E.4106',
    dayIndex: 2, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Epsilon 308', status: 'on-time',
  },
  // IUP Kelas C — Mengelola Organisasi Digital C (Tue 10:30-13:00)
  {
    id: 'mod-c',
    course: 'Mengelola Organisasi Digital', classGroup: 'C', code: 'B10E.4101',
    dayIndex: 2, timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    room: 'Delta 1.03', status: 'on-time',
  },
  // IUP Kelas C — Penilaian Bisnis C (Tue 13:30-16:00)
  {
    id: 'pb-c',
    course: 'Penilaian Bisnis', classGroup: 'C', code: 'B10E.4106',
    dayIndex: 2, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Delta 1.04', status: 'on-time',
  },

  // ── Rabu (Wed) ─────────────────────────────────────────
  // Manajemen Media Sosial B — both students enrolled (same section)
  {
    id: 'medSos-b',
    course: 'Manajemen Media Sosial', classGroup: 'B', code: 'B10E.5101',
    dayIndex: 3, timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    room: 'Labkom 1', status: 'on-time',
  },
  // Pengambilan Keputusan A — Zunaira enrolled
  {
    id: 'keputusan-a',
    course: 'Pengambilan Keputusan dan Pemecahan Masalah', classGroup: 'A', code: 'B10E.3106',
    dayIndex: 3, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Lambda 207', status: 'on-time',
  },
  // IUP Kelas C — Manajemen Media Sosial C (Wed 10:30-13:00)
  {
    id: 'mms-c',
    course: 'Manajemen Media Sosial', classGroup: 'C', code: 'B10E.5101',
    dayIndex: 3, timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    room: 'Epsilon 310', status: 'on-time',
  },
  // IUP Kelas C — Pengambilan Keputusan dan Pemecahan Masalah C (Wed 13:30-16:00)
  {
    id: 'pkpm-c',
    course: 'Pengambilan Keputusan dan Pemecahan Masalah', classGroup: 'C', code: 'B10E.3106',
    dayIndex: 3, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Epsilon 309', status: 'on-time',
  },

  // ── Kamis (Thu) ────────────────────────────────────────
  // Analitik Bisnis dan Maha Data A — Putry enrolled
  {
    id: 'analitik-a',
    course: 'Analitik Bisnis dan Maha Data', classGroup: 'A', code: 'B10E.3103',
    dayIndex: 4, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Lambda 210', status: 'on-time',
  },
  // Analitik Bisnis dan Maha Data B — Zunaira enrolled (same slot)
  {
    id: 'analitik-b',
    course: 'Analitik Bisnis dan Maha Data', classGroup: 'B', code: 'B10E.3103',
    dayIndex: 4, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Lambda 205', status: 'online', zoomLink: 'https://zoom.us/j/44556677889',
  },
  // IUP Kelas C — Analitik Bisnis dan Maha Data C (Thu 13:30-16:00)
  {
    id: 'abmd-c',
    course: 'Analitik Bisnis dan Maha Data', classGroup: 'C', code: 'B10E.3103',
    dayIndex: 4, timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    room: 'Delta 1.03', status: 'on-time',
  },

  // ── Jumat (Fri) ────────────────────────────────────────
  // Desain Antar Muka Pengguna A — both students enrolled (same section)
  {
    id: 'uiux-a',
    course: 'Desain Antar Muka Pengguna/Pengalaman Pengguna', classGroup: 'A', code: 'B10E.4103',
    dayIndex: 5, timeStart: '09:40', timeEnd: '11:40',
    startTime: 9 + 40 / 60, endTime: 11 + 40 / 60,
    room: 'Epsilon 309', status: 'on-time',
  },
  // IUP Kelas C — Desain Antar Muka Pengguna C (Fri 09:40-11:40)
  {
    id: 'uiux-c',
    course: 'Desain Antar Muka Pengguna/Pengalaman Pengguna', classGroup: 'C', code: 'B10E.4103',
    dayIndex: 5, timeStart: '09:40', timeEnd: '11:40',
    startTime: 9 + 40 / 60, endTime: 11 + 40 / 60,
    room: 'Epsilon 308', status: 'on-time',
  },
]

/* ─── Enrollments ────────────────────────────────────────── */
export const ENROLLMENTS: Enrollment[] = [
  // Zunaira Habiba Khoirunnisa (120510240028)
  { userId: '120510240028', classId: 'tekfin-a' },
  { userId: '120510240028', classId: 'penWeb-b' },
  { userId: '120510240028', classId: 'orgDig-a' },
  { userId: '120510240028', classId: 'penBis-a' },
  { userId: '120510240028', classId: 'medSos-b' },
  { userId: '120510240028', classId: 'keputusan-a' },
  { userId: '120510240028', classId: 'analitik-b' },
  { userId: '120510240028', classId: 'uiux-a' },

  // Putry Vi'Azdha Rany (120510240036)
  { userId: '120510240036', classId: 'tekfin-a' },
  { userId: '120510240036', classId: 'penWeb-a' },
  { userId: '120510240036', classId: 'orgDig-b' },
  { userId: '120510240036', classId: 'penBis-a' },
  { userId: '120510240036', classId: 'medSos-b' },
  { userId: '120510240036', classId: 'keputusan-b' },
  { userId: '120510240036', classId: 'analitik-a' },
  { userId: '120510240036', classId: 'uiux-a' },

  // Muhammad Rifqi Arviansyah (DSN-001) — teaches Teknologi Finansial A
  { userId: 'DSN-001', classId: 'tekfin-a' },
]

/* ─── Query helpers ──────────────────────────────────────── */
export function getEnrolledClassIds(userId: string): Set<string> {
  return new Set(
    ENROLLMENTS.filter(e => e.userId === userId).map(e => e.classId)
  )
}

/**
 * Returns ALL classes in the master schedule, with isMyClass=true for
 * every class the given user is enrolled in (or teaches).
 */
export function getClassesForUser(userId: string): ClassItem[] {
  const enrolled = getEnrolledClassIds(userId)
  return CLASSES.map(c => ({ ...c, isMyClass: enrolled.has(c.id) }))
}

/**
 * Converts a CustomEvent into a ClassItem-compatible shape so it can be
 * rendered alongside regular classes in the timeline and calendar grid.
 */
export function customEventToClassItem(e: CustomEvent): ClassItem {
  return {
    id: e.id,
    course: e.title,
    classGroup: e.type,
    code: e.type,
    dayIndex: e.dayIndex,
    timeStart: e.timeStart,
    timeEnd: e.timeEnd,
    startTime: e.startTime,
    endTime: e.endTime,
    room: e.room,
    status: 'on-time',
    isMyClass: true,
    isCustom: true,
  }
}
