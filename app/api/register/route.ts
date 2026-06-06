import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password, company, sector } = await req.json()

    if (!email || !password || !company) {
      return NextResponse.json(
        { error: 'Email, contraseña y empresa son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Crear usuario en Supabase Auth
    console.log('📝 Registrando:', email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('❌ Auth error completo:', JSON.stringify(authError, null, 2))
      return NextResponse.json(
        { error: authError.message || 'Error en autenticación', details: authError.code },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error('❌ No user returned from signup')
      return NextResponse.json(
        { error: 'Usuario no creado' },
        { status: 400 }
      )
    }

    console.log('✅ Usuario creado en Auth:', authData.user.id)

    // Guardar configuración del negocio
    const { error: configError } = await supabase
      .from('business_config')
      .insert({
        id: `config_${Date.now()}`,
        user_id: authData.user.id,
        business_name: company,
        sector: sector || 'Otro',
      })

    if (configError) {
      console.error('❌ Config error:', configError)
      return NextResponse.json(
        { error: 'Error guardando configuración' },
        { status: 400 }
      )
    }

    console.log('✅ Registro completado')

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error('❌ Register API error:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
