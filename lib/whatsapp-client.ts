// ─── Cliente para enviar mensajes de WhatsApp desde el navegador ────

export const sendWhatsAppFromClient = async (
  to: string,
  body: string,
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation' = 'confirmation'
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, body, type }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al enviar mensaje',
      }
    }

    return {
      success: true,
      messageId: data.messageId,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error de conexión',
    }
  }
}
