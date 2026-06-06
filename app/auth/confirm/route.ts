import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'sms' | 'recovery',
      token_hash,
      email: searchParams.get('email') || '',
    })

    if (error) {
      console.error('❌ Verification error:', error)
      return NextResponse.redirect(new URL('/login?error=verification_failed', req.url))
    }

    console.log('✅ Email confirmado exitosamente')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (err) {
    console.error('❌ Confirm error:', err)
    return NextResponse.redirect(new URL('/login?error=server_error', req.url))
  }
}
