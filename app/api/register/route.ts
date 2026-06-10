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

    // Verificar si el usuario fue creado, incluso si hay un error
    const userCreated = authData.user?.id

    if (authError && !userCreated) {
      console.error('❌ Auth error completo:', JSON.stringify(authError, null, 2))
      return NextResponse.json(
        { error: authError.message || 'Error en autenticación', details: authError.code },
        { status: 400 }
      )
    }

    if (!userCreated) {
      console.error('❌ No user returned from signup')
      return NextResponse.json(
        { error: 'Usuario no creado' },
        { status: 400 }
      )
    }

    if (authError) {
      console.warn('⚠️ Auth warning (cuenta creada anyway):', authError.message)
    }

    console.log('✅ Usuario creado en Auth:', userCreated)

    // Guardar configuración del negocio (admin client bypasses RLS)
    const { error: configError } = await supabaseAdmin
      .from('business_config')
      .insert({
        id: `config_${Date.now()}`,
        user_id: authData.user!.id,
        business_name: company,
        sector: sector || 'Otro',
      })

    if (configError) {
      console.error('❌ Config error detallado:', JSON.stringify(configError, null, 2))
      console.warn('⚠️ Config error (no crítico):', configError.message)
      // No es crítico si falla - la cuenta de Auth se creó
    } else {
      console.log('✅ Config guardada exitosamente')
    }

    console.log('✅ Registro completado')

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Register API error:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
