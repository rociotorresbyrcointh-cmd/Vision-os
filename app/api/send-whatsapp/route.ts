import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { to, body, type } = await req.json()

    // Validar entrada
    if (!to || !body) {
      return NextResponse.json(
        { error: 'Faltan parámetros: to, body' },
        { status: 400 }
      )
    }

    // Obtener credenciales de Twilio desde variables de entorno
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      console.error('Credenciales de Twilio no configuradas')
      return NextResponse.json(
        { error: 'WhatsApp no está configurado en el servidor' },
        { status: 500 }
      )
    }

    // Importar Twilio dinámicamente (cliente necesita instalar: npm install twilio)
    const twilio = require('twilio')
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    // Formatear número (remover espacios y guiones)
    const formattedTo = to.replace(/\s+|-/g, '')

    // Enviar mensaje de WhatsApp
    const message = await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${formattedTo}`,
      body: body,
    })

    return NextResponse.json({
      success: true,
      messageId: message.sid,
      timestamp: new Date().toISOString(),
      type: type,
    })
  } catch (error: any) {
    console.error('Error enviando WhatsApp:', error)
    return NextResponse.json(
      { error: error.message || 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}
