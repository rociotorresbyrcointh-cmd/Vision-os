import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    // Verificar trial status
    const { data: trial } = await supabase
      .from('trial_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!trial) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'no_trial',
        message: 'Trial no existe'
      })
    }

    const now = new Date()
    const expiresAt = new Date(trial.trial_expires_at)
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft <= 0) {
      // Trial expirado - necesita pagar
      return NextResponse.json({
        hasAccess: false,
        reason: 'trial_expired',
        message: 'Tu período de prueba expiró. Por favor, suscríbete.',
        daysLeft: 0
      })
    }

    // Trial válido
    return NextResponse.json({
      hasAccess: true,
      reason: 'trial_active',
      daysLeft,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Check access error:', error)
    return NextResponse.json({
      hasAccess: true, // Por defecto permitir si hay error (fail open)
      error: 'check_failed'
    })
  }
}
