/* ─── Types ──────────────────────────────────────────────── */
export type ClassStatus = 'on-time' | 'online' | 'cancelled'

export interface ClassItem {
  id: string
  course: string
  classGroup: string   // 'A', 'B', or 'C'
  room: string
  dayIndex: number     // 0=MIN(Sun) 1=SEN(Mon) 2=SEL(Tue) 3=RAB(Wed) 4=KAM(Thu) 5=JUM(Fri) 6=SAB(Sat)
  timeStart: string    // "HH:MM" — used in daily view
  timeEnd: string      // "HH:MM"
  startTime: number    // decimal hours — used in calendar grid
  endTime: number
  status: ClassStatus
  zoomLink?: string
  isMyClass: boolean   // true = Zunaira Habiba is enrolled in this section
}

/* ─── Simulation: "Today" is Senin, 11 Mei 2026 ─────────── */
export const TODAY_DAY_INDEX = 1 // SEN / Monday

/* ─── Comprehensive Class Database ──────────────────────── */
// 8 courses × 3 sections (A, B, C) = 24 entries
// isMyClass: true marks Zunaira's enrolled section per course

export const ALL_CLASSES: ClassItem[] = [

  // ── 1. Teknologi Finansial — Zunaira: Kelas A ─────────
  {
    id: 'tf-a',
    course: 'Teknologi Finansial', classGroup: 'A',
    room: 'Lambda 107', dayIndex: 1,
    timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    status: 'on-time', isMyClass: true,
  },
  {
    id: 'tf-b',
    course: 'Teknologi Finansial', classGroup: 'B',
    room: 'Lambda 103', dayIndex: 2,
    timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'tf-c',
    course: 'Teknologi Finansial', classGroup: 'C',
    room: 'Epsilon 305', dayIndex: 3,
    timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    status: 'on-time', isMyClass: false,
  },

  // ── 2. Pengembangan Web — Zunaira: Kelas B ────────────
  {
    id: 'pw-a',
    course: 'Pengembangan Web', classGroup: 'A',
    room: 'Lambda 106', dayIndex: 2,
    timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'pw-b',
    course: 'Pengembangan Web', classGroup: 'B',
    room: 'Lambda 108', dayIndex: 1,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'cancelled', isMyClass: true,
  },
  {
    id: 'pw-c',
    course: 'Pengembangan Web', classGroup: 'C',
    room: 'Epsilon 310', dayIndex: 4,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'on-time', isMyClass: false,
  },

  // ── 3. Mengelola Organisasi Digital — Zunaira: Kelas A ─
  {
    id: 'mod-a',
    course: 'Mengelola Organisasi Digital', classGroup: 'A',
    room: 'Lambda 202', dayIndex: 2,
    timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    status: 'online', zoomLink: 'https://zoom.us/j/98765432100', isMyClass: true,
  },
  {
    id: 'mod-b',
    course: 'Mengelola Organisasi Digital', classGroup: 'B',
    room: 'Lambda 204', dayIndex: 1,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'mod-c',
    course: 'Mengelola Organisasi Digital', classGroup: 'C',
    room: 'Epsilon 301', dayIndex: 3,
    timeStart: '07:40', timeEnd: '09:40', startTime: 7 + 40 / 60, endTime: 9 + 40 / 60,
    status: 'on-time', isMyClass: false,
  },

  // ── 4. Penilaian Bisnis — Zunaira: Kelas A ────────────
  {
    id: 'pb-a',
    course: 'Penilaian Bisnis', classGroup: 'A',
    room: 'Epsilon 308', dayIndex: 1,
    timeStart: '10:45', timeEnd: '13:15', startTime: 10.75, endTime: 13.25,
    status: 'online', zoomLink: 'https://zoom.us/j/11223344550', isMyClass: true,
  },
  {
    id: 'pb-b',
    course: 'Penilaian Bisnis', classGroup: 'B',
    room: 'Epsilon 304', dayIndex: 2,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'pb-c',
    course: 'Penilaian Bisnis', classGroup: 'C',
    room: 'Epsilon 306', dayIndex: 4,
    timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    status: 'on-time', isMyClass: false,
  },

  // ── 5. Manajemen Media Sosial — Zunaira: Kelas B ──────
  {
    id: 'mms-a',
    course: 'Manajemen Media Sosial', classGroup: 'A',
    room: 'Lambda 206', dayIndex: 2,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'mms-b',
    course: 'Manajemen Media Sosial', classGroup: 'B',
    room: 'Labkom 1', dayIndex: 4,
    timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    status: 'on-time', isMyClass: true,
  },
  {
    id: 'mms-c',
    course: 'Manajemen Media Sosial', classGroup: 'C',
    room: 'Epsilon 307', dayIndex: 5,
    timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    status: 'on-time', isMyClass: false,
  },

  // ── 6. Pengambilan Keputusan dan Pemecahan Masalah — Zunaira: Kelas A ─
  {
    id: 'pkpm-a',
    course: 'Pengambilan Keputusan dan Pemecahan Masalah', classGroup: 'A',
    room: 'Lambda 207', dayIndex: 3,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'on-time', isMyClass: true,
  },
  {
    id: 'pkpm-b',
    course: 'Pengambilan Keputusan dan Pemecahan Masalah', classGroup: 'B',
    room: 'Lambda 201', dayIndex: 1,
    timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'pkpm-c',
    course: 'Pengambilan Keputusan dan Pemecahan Masalah', classGroup: 'C',
    room: 'Lambda 209', dayIndex: 4,
    timeStart: '07:30', timeEnd: '10:00', startTime: 7.5, endTime: 10,
    status: 'on-time', isMyClass: false,
  },

  // ── 7. Analitik Bisnis dan Maha Data — Zunaira: Kelas B ─
  {
    id: 'abmd-a',
    course: 'Analitik Bisnis dan Maha Data', classGroup: 'A',
    room: 'Lambda 210', dayIndex: 3,
    timeStart: '10:30', timeEnd: '13:00', startTime: 10.5, endTime: 13,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'abmd-b',
    course: 'Analitik Bisnis dan Maha Data', classGroup: 'B',
    room: 'Lambda 205', dayIndex: 5,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'online', zoomLink: 'https://zoom.us/j/44556677889', isMyClass: true,
  },
  {
    id: 'abmd-c',
    course: 'Analitik Bisnis dan Maha Data', classGroup: 'C',
    room: 'Epsilon 311', dayIndex: 2,
    timeStart: '13:30', timeEnd: '16:00', startTime: 13.5, endTime: 16,
    status: 'on-time', isMyClass: false,
  },

  // ── 8. Desain Antar Muka Pengguna/Pengalaman Pengguna — Zunaira: Kelas A ─
  {
    id: 'dapu-a',
    course: 'Desain Antar Muka Pengguna/Pengalaman Pengguna', classGroup: 'A',
    room: 'Epsilon 309', dayIndex: 3,
    timeStart: '07:40', timeEnd: '09:40', startTime: 7 + 40 / 60, endTime: 9 + 40 / 60,
    status: 'on-time', isMyClass: true,
  },
  {
    id: 'dapu-b',
    course: 'Desain Antar Muka Pengguna/Pengalaman Pengguna', classGroup: 'B',
    room: 'Lambda 208', dayIndex: 5,
    timeStart: '07:40', timeEnd: '09:40', startTime: 7 + 40 / 60, endTime: 9 + 40 / 60,
    status: 'on-time', isMyClass: false,
  },
  {
    id: 'dapu-c',
    course: 'Desain Antar Muka Pengguna/Pengalaman Pengguna', classGroup: 'C',
    room: 'Epsilon 302', dayIndex: 2,
    timeStart: '07:30', timeEnd: '09:30', startTime: 7.5, endTime: 9.5,
    status: 'on-time', isMyClass: false,
  },
]
