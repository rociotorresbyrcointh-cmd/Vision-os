import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''

export async function POST(req: NextRequest) {
  console.log('=== SEND EMAIL DEBUG START ===')
  console.log('API Key presente:', !!RESEND_API_KEY)
  console.log('API Key length:', RESEND_API_KEY?.length)

  try {
    const { email, empresa, code } = await req.json()
    console.log('Request params:', { email, empresa, code })

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y code requeridos' }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const registroLink = `https://vision-os-delta.vercel.app/register?code=${code}`

    const payload = {
      from: 'onboarding@resend.dev',
      to: email,
      subject: `Tu acceso a Vision OS - Código: ${code}`,
      html: `<h1>Hola ${empresa}</h1><p>Tu código es: <strong>${code}</strong></p><p><a href="${registroLink}">Registrate aquí</a></p>`,
    }

    console.log('Sending to Resend with payload:', JSON.stringify(payload))

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('Resend response status:', response.status)
    const responseText = await response.text()
    console.log('Resend response body:', responseText)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        console.error('Resend error details:', errorData)
        return NextResponse.json({
          error: `Resend error (${response.status}): ${JSON.stringify(errorData)}`
        }, { status: 500 })
      } catch {
        return NextResponse.json({
          error: `Resend error (${response.status}): ${responseText}`
        }, { status: 500 })
      }
    }

    console.log('=== EMAIL SENT SUCCESSFULLY ===')
    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
      data: responseText
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: `Error: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 })
  }
}
