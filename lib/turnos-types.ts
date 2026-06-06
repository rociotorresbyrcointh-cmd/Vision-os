// ─── Tipos para el módulo de Turnos ────────────────────────────────────

export interface Professional {
  id: string
  name: string
  specialty: string
  color: string
  hoursStart: string // "09:00"
  hoursEnd: string   // "18:00"
  daysOfWeek: number[] // 0 = domingo, 1 = lunes, ... 6 = sábado
  maxCapacityPerHour?: number // 1-20: capacidad máxima por hora (default: 4)
}

export interface Service {
  id: string
  name: string
  durationMinutes: number
  price: number
  description?: string
}

export interface Appointment {
  id: string
  clientName: string
  clientWhatsApp?: string
  clientEmail?: string
  professionalId: string
  serviceId: string
  startTime: string // ISO 8601: "2026-06-05T14:30"
  endTime: string   // ISO 8601: "2026-06-05T15:15"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  complexity?: number // 1-4: complejidad/slots que ocupa este turno
  createdAt: string
  source: 'admin' | 'public' // admin = creado por el dueño, public = reserva del cliente
}

// Configuración de turnos por negocio
export interface TurnosConfig {
  professionals: Professional[]
  services: Service[]
  appointments: Appointment[]
  blockedTimes: BlockedTime[] // vacaciones, almuerzo, etc
  enableComplexity?: boolean // mostrar sistema de complejidad/slots
  enableProfessionalCalendars?: boolean // mostrar calendario por profesional
}

export interface BlockedTime {
  id: string
  title: string
  startTime: string
  endTime: string
  professionalId?: string // si es específico de un profesional
  recurring?: 'daily' | 'weekly' | 'monthly' // opcional: si se repite
}

// ─── Colores predefinidos para profesionales ───────────────────────
export const PROFESSIONAL_COLORS = [
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#a78bfa', // violet
  '#14b8a6', // teal
]

// ─── Helpers ───────────────────────────────────────────────────────

export const getDayName = (dayNumber: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayNumber] || 'Inválido'
}

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getWeekDates = (date: Date): Date[] => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  const sunday = new Date(d)
  sunday.setDate(diff)

  return Array.from({ length: 7 }, (_, i) => {
    const weekDate = new Date(sunday)
    weekDate.setDate(sunday.getDate() + i)
    return weekDate
  })
}
