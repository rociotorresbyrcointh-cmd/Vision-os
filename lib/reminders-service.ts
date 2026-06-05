// ─── Servicio de recordatorios automáticos ────────────────────────

import { Appointment, TurnosConfig } from './turnos-types'
import { sendWhatsAppFromClient } from './whatsapp-client'

export interface ReminderPending {
  appointment: Appointment
  type: 'reminder_24h' | 'reminder_2h'
  reminderText: string
}

export const getPendingReminders = (
  config: TurnosConfig,
  generalConfig: any
): ReminderPending[] => {
  const now = new Date()
  const pending: ReminderPending[] = []

  config.appointments.forEach(appt => {
    // Solo procesar turnos confirmados
    if (appt.status !== 'confirmed') return
    // Solo procesar si el cliente tiene WhatsApp
    if (!appt.clientWhatsApp) return

    const appointmentTime = new Date(appt.startTime)
    const timeUntilAppointment = appointmentTime.getTime() - now.getTime()
    const hoursUntil = timeUntilAppointment / (1000 * 60 * 60)

    // Recordatorio 24h antes (entre 23h y 25h)
    if (hoursUntil > 23 && hoursUntil < 25) {
      if (
        generalConfig?.whatsappReminder24h &&
        !isReminderSent(appt, 'reminder_24h')
      ) {
        pending.push({
          appointment: appt,
          type: 'reminder_24h',
          reminderText: generalConfig.whatsappReminder24h,
        })
      }
    }

    // Recordatorio 2h antes (entre 1h 50m y 2h 10m)
    if (hoursUntil > 1.8 && hoursUntil < 2.2) {
      if (
        generalConfig?.whatsappReminder2h &&
        !isReminderSent(appt, 'reminder_2h')
      ) {
        pending.push({
          appointment: appt,
          type: 'reminder_2h',
          reminderText: generalConfig.whatsappReminder2h,
        })
      }
    }
  })

  return pending
}

const isReminderSent = (appointment: Appointment, type: string): boolean => {
  // Guardar recordatorios enviados en localStorage
  const sentReminders = JSON.parse(
    localStorage.getItem('bos_sent_reminders') || '{}'
  )
  const key = `${appointment.id}_${type}`
  return !!sentReminders[key]
}

export const markReminderAsSent = (appointmentId: string, type: string) => {
  const sentReminders = JSON.parse(
    localStorage.getItem('bos_sent_reminders') || '{}'
  )
  sentReminders[`${appointmentId}_${type}`] = new Date().toISOString()
  localStorage.setItem('bos_sent_reminders', JSON.stringify(sentReminders))
}

export const sendPendingReminders = async (
  reminders: ReminderPending[]
): Promise<void> => {
  for (const reminder of reminders) {
    try {
      await sendWhatsAppFromClient(
        reminder.appointment.clientWhatsApp || '',
        reminder.reminderText,
        reminder.type
      )
      markReminderAsSent(reminder.appointment.id, reminder.type)
    } catch (error) {
      console.error(
        `Error enviando recordatorio ${reminder.type}:`,
        error
      )
    }
  }
}
