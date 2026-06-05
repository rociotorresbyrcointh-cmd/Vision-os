// ─── Servicio de WhatsApp con Twilio ────────────────────────────────

interface SendWhatsAppMessage {
  to: string // número del cliente con formato: +54 9 11 0000-0000
  body: string
  professionalName?: string
  serviceName?: string
  date?: string
  time?: string
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation'
}

export const generateWhatsAppMessage = (params: SendWhatsAppMessage): string => {
  const { type, professionalName, serviceName, date, time } = params

  switch (type) {
    case 'confirmation':
      return `¡Tu turno está confirmado! 📅

${serviceName ? `Servicio: ${serviceName}` : ''}
${professionalName ? `Profesional: ${professionalName}` : ''}
${date ? `Fecha: ${date}` : ''}
${time ? `Hora: ${time}` : ''}

Si necesitás cancelar o cambiar la fecha, respondé este mensaje.`

    case 'reminder_24h':
      return `⏰ Recordatorio: Tu turno es en 24 horas

${date} a las ${time}
${serviceName ? `${serviceName}` : ''}

Confirmamos tu asistencia. ¡Hasta pronto!`

    case 'reminder_2h':
      return `⏰ Recordatorio: Tu turno es en 2 horas

${date} a las ${time}

¡Te esperamos!`

    case 'cancellation':
      return `Tu turno ha sido cancelado.

Si fue un error o querés reprogramar, contactanos.`

    default:
      return params.body
  }
}

export const formatPhoneNumber = (phone: string): string => {
  // Convierte +54 9 11 0000-0000 a +54911000000
  return phone.replace(/\s+|-/g, '')
}

// Placeholder - será reemplazado por la implementación real de Twilio en el backend
export const sendWhatsAppMessage = async (
  message: SendWhatsAppMessage,
  twilioSID: string,
  twilioToken: string,
  fromNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  // Esta función será llamada desde una API route con credenciales del servidor
  return { success: true }
}
