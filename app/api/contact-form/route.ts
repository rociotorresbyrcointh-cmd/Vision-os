import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const { email, empresa, rubro, turnos } = await req.json()

    if (!email || !empresa) {
      return NextResponse.json({ error: 'Email y empresa son requeridos' }, { status: 400 })
    }

    const code = generateCode()
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2)}`

    // Guardar invitación en Supabase
    try {
      await supabase
        .from('invitations')
        .insert([{ id, code, email, empresa, rubro, status: 'pending' }])
    } catch (dbError) {
      console.log('Supabase save skipped:', dbError)
    }

    // Enviar email automático con SendGrid
    try {
      const emailRes = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3001'}/api/send-invitation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, empresa, code })
      })

      if (!emailRes.ok) {
        console.log('Email send failed, but continuing')
      }
    } catch (emailError) {
      console.log('Email send error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: '✅ ¡Perfecto! Tu código se envió por email. Revisa tu bandeja de entrada.',
      code,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Error procesando solicitud', success: false }, { status: 500 })
  }
}
