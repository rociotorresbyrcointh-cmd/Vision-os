import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function POST(req: NextRequest) {
  try {
    const { email, password, company, sector } = await req.json()

    if (!email || !password || !company) {
      return NextResponse.json(
        { error: 'Email, contraseña y empresa son requeridos' },
        { status: 400 }
      )
    }

    // Cliente 1: Supabase público para autenticación estándar
    const supabasePublic = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Cliente 2: Supabase admin para business_config (RLS bypassed)
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Crear usuario en Supabase Auth
    console.log('📝 Registrando:', email)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { data: authData, error: authError } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/confirm`,
        data: { company, sector }
      }
    })

    // DEBUG: Capturar respuesta exacta de signUp()
    console.log('=== SIGNUP RESPONSE DEBUG ===')
    console.log('authError exists:', !!authError)
    console.log('authError:', authError ? JSON.stringify(authError, null, 2) : 'null')
    console.log('authData exists:', !!authData)
    console.log('authData.user exists:', !!authData?.user)
    console.log('authData.user?.id:', authData?.user?.id || 'undefined')
    console.log('authData.user?.email:', authData?.user?.email || 'undefined')
    console.log('authData.user?.email_confirmed_at:', authData?.user?.email_confirmed_at)
    console.log('authData.session:', authData?.session ? 'present' : 'null')
    console.log('=== END DEBUG ===')

    // Verificar si el usuario fue creado
    const userCreated = authData?.user?.id

    // IMPORTANTE: Fallar si hay error, incluso si user existe parcialmente
    if (authError) {
      console.error('❌ Auth error (aborting):', authError.message)
      console.error('   Code:', authError.code)
      console.error('   Status:', authError.status)
      return NextResponse.json(
        {
          error: authError.message || 'Error en autenticación',
          code: authError.code,
          status: authError.status
        },
        { status: 400 }
      )
    }

    if (!userCreated) {
      console.error('❌ No user ID returned from signup despite no error')
      return NextResponse.json(
        { error: 'Usuario no creado - por favor intenta de nuevo' },
        { status: 400 }
      )
    }

    console.log('✅ Usuario creado en Auth:', userCreated)

    // Guardar configuración del negocio (admin client bypasses RLS)
    console.log('📝 Intentando guardar business_config...')
    console.log('   user_id:', authData.user!.id)
    console.log('   business_name:', company)
    console.log('   sector:', sector)

    const { error: configError, data: configData } = await supabaseAdmin
      .from('business_config')
      .insert({
        id: `config_${Date.now()}`,
        user_id: authData.user!.id,
        business_name: company,
        sector: sector || 'Otro',
      })
      .select()

    console.log('=== CONFIG INSERT RESPONSE ===')
    console.log('configError exists:', !!configError)
    if (configError) {
      console.error('❌ Config error:', JSON.stringify(configError, null, 2))
      console.error('   Code:', configError.code)
      console.error('   Message:', configError.message)
      console.warn('⚠️ Config insert failed (non-critical for auth)')
    } else {
      console.log('✅ Config saved successfully')
      console.log('   Data returned:', JSON.stringify(configData, null, 2))
    }
    console.log('=== END CONFIG DEBUG ===')

    // Crear trial de 7 días (admin client bypasses RLS)
    console.log('📝 Intentando crear trial de 7 días...')
    const trialExpiresAt = new Date()
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7)
    console.log('   user_id:', authData.user!.id)
    console.log('   status:', 'trial')
    console.log('   trial_expires_at:', trialExpiresAt.toISOString())

    const { error: trialError, data: trialData } = await supabaseAdmin
      .from('trial_status')
      .insert({
        user_id: authData.user!.id,
        trial_expires_at: trialExpiresAt.toISOString(),
        status: 'trial'
      })
      .select()

    console.log('=== TRIAL INSERT RESPONSE ===')
    console.log('trialError exists:', !!trialError)
    if (trialError) {
      console.error('❌ Trial error:', JSON.stringify(trialError, null, 2))
      console.error('   Code:', trialError.code)
      console.error('   Message:', trialError.message)
      console.warn('⚠️ Trial insert failed (non-critical for auth)')
    } else {
      console.log('✅ Trial created successfully')
      console.log('   Data returned:', JSON.stringify(trialData, null, 2))
    }
    console.log('=== END TRIAL DEBUG ===')

    console.log('✅ Registro completado exitosamente')
    console.log('=== FINAL RESPONSE ===')
    const response = {
      success: true,
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
      },
    }
    console.log('Returning HTTP 200:', JSON.stringify(response, null, 2))
    console.log('=== END RESPONSE ===')

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ CATCH: Unhandled error in /api/register')
    console.error('   Error type:', error?.constructor?.name)
    console.error('   Error message:', error instanceof Error ? error.message : String(error))
    console.error('   Full error:', JSON.stringify(error, null, 2))
    if (error instanceof Error) {
      console.error('   Stack:', error.stack)
    }
    return NextResponse.json(
      {
        error: 'Error en el servidor',
        type: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}
