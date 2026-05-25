'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CustomEvent } from '@/lib/db'

interface ScheduleContextType {
  activeDate: Date
  setActiveDate: (date: Date) => void
  customEvents: CustomEvent[]
  addCustomEvent: (event: Omit<CustomEvent, 'id'>) => void
}

const ScheduleContext = createContext<ScheduleContextType>({
  activeDate: new Date(2026, 4, 11),
  setActiveDate: () => {},
  customEvents: [],
  addCustomEvent: () => {},
})

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [activeDate, setActiveDate] = useState<Date>(new Date(2026, 4, 11))
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])

  function addCustomEvent(event: Omit<CustomEvent, 'id'>) {
    setCustomEvents(prev => [
      ...prev,
      { ...event, id: `custom-${Date.now()}` },
    ])
  }

  return (
    <ScheduleContext.Provider value={{ activeDate, setActiveDate, customEvents, addCustomEvent }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export const useSchedule = () => useContext(ScheduleContext)
