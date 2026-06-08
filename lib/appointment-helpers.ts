import { Appointment, Service, TurnosConfig, getDateKey } from './turnos-types'

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

        appointments.push({
          id: `${Date.now()}_${sessionsCreated}_${Math.random().toString(36).substring(2)}`,
          clientName: form.clientName,
          clientWhatsApp: form.clientWhatsApp,
          clientEmail: form.clientEmail,
          professionalId: form.profId,
          serviceId: form.serviceId,
          startTime: startDateTime,
          endTime: apptEndDate.toISOString(),
          status: form.status,
          notes: form.notes,
          capacityPerHour: form.capacityPerHour ? Number(form.capacityPerHour) : 1,
          patientLabel: form.patientLabel,
          healthInsurance: form.healthInsurance,
          membershipNumber: form.membershipNumber,
          createdAt: new Date().toISOString(),
          source: 'admin',
        })
        sessionsCreated++
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
    })
  }

  return appointments
}
