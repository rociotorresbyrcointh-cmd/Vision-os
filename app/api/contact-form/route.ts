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
    const { error: dbError } = await supabase
      .from('invitations')
      .insert([{ id, code, email, empresa, rubro, status: 'pending' }])

    if (dbError) {
      console.error('DB Error:', dbError)
      return NextResponse.json({ error: 'Error guardando invitación' }, { status: 500 })
    }

    // Email y WhatsApp se agregarán después
    // Por ahora solo guardamos la invitación en Supabase

    return NextResponse.json({
      success: true,
      message: 'Invitación creada. Email enviado.',
      code,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 })
  }
}
