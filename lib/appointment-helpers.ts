import { Appointment, Service, TurnosConfig, getDateKey } from './turnos-types'

// UUID generator (simple implementation without external dependency)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Check if a time slot is blocked (globally or for a specific professional)
 */
export function isTimeBlocked(
  config: TurnosConfig,
  professionalId: string,
  startTime: string, // ISO 8601: "2026-07-09T09:00"
  endTime: string    // ISO 8601: "2026-07-09T10:00"
): boolean {
  return config.blockedTimes.some(block => {
    // If block has a professionalId, only apply to that professional
    if (block.professionalId && block.professionalId !== professionalId) {
      return false
    }

    // Check if appointment time overlaps with blocked time
    // Overlap occurs if: startTime < block.endTime AND endTime > block.startTime
    return startTime < block.endTime && endTime > block.startTime
  })
}

/**
 * UNIFIED appointment generation logic used by ALL calendar views
 * This is the SINGLE SOURCE OF TRUTH for how appointments are created
 */
export function generateAppointments(
  form: any,
  config: TurnosConfig,
  service: Service
): Appointment[] {
  const appointments: Appointment[] = []
  const recurrenceGroupId = form.recurring ? generateUUID() : undefined
  const recurrenceCreatedAt = form.recurring ? new Date().toISOString() : undefined

  if (form.recurring) {
    const startDate = new Date(form.date)
    const recurringDays = form.recurring.split(',').map(Number)
    const sessionCount = Number(form.sessionCount) || 1

    let currentDate = new Date(startDate)
    let sessionsCreated = 0

    while (sessionsCreated < sessionCount) {
      if (recurringDays.includes(currentDate.getDay())) {
        const dateKey = getDateKey(currentDate)
        const startDateTime = `${dateKey}T${form.startTime}`
        const apptStartDate = new Date(startDateTime)
        const apptEndDate = new Date(apptStartDate.getTime() + service.durationMinutes * 60 * 1000)
        const endDateTime = apptEndDate.toISOString()

        // Skip if this time slot is blocked for this professional
        if (!isTimeBlocked(config, form.profId, startDateTime, endDateTime)) {
          appointments.push({
            id: `${Date.now()}_${sessionsCreated}_${Math.random().toString(36).substring(2)}`,
            clientName: form.clientName,
            clientWhatsApp: form.clientWhatsApp,
            clientEmail: form.clientEmail,
            professionalId: form.profId,
            serviceId: form.serviceId,
            startTime: startDateTime,
            endTime: endDateTime,
            status: form.status,
            notes: form.notes,
            capacityPerHour: form.capacityPerHour ? Number(form.capacityPerHour) : 1,
            patientLabel: form.patientLabel,
            healthInsurance: form.healthInsurance,
            membershipNumber: form.membershipNumber,
            createdAt: new Date().toISOString(),
            source: 'admin',
            recurrenceGroupId,
            recurrenceCreatedAt,
            recurrenceMetadata: {
              session: sessionsCreated + 1,
              totalSessions: sessionCount,
              daysOfWeek: form.recurring,
            },
          })
          sessionsCreated++
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else {
    const startDateTime = `${form.date}T${form.startTime}`
    const startDate = new Date(startDateTime)
    const endDate = new Date(startDate.getTime() + service.durationMinutes * 60 * 1000)
    const endDateTime = endDate.toISOString()

    appointments.push({
      id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      clientName: form.clientName,
      clientWhatsApp: form.clientWhatsApp,
      clientEmail: form.clientEmail,
      professionalId: form.profId,
      serviceId: form.serviceId,
      startTime: startDateTime,
      endTime: endDateTime,
      status: form.status,
      notes: form.notes,
      capacityPerHour: form.capacityPerHour ? Number(form.capacityPerHour) : 1,
      patientLabel: form.patientLabel,
      healthInsurance: form.healthInsurance,
      membershipNumber: form.membershipNumber,
      createdAt: new Date().toISOString(),
      source: 'admin',
      // No recurrence metadata for non-recurring appointments
      recurrenceGroupId: undefined,
      recurrenceCreatedAt: undefined,
      recurrenceMetadata: undefined,
    })
  }

  return appointments
}
