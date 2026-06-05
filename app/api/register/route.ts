import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, company, sector } = await request.json()

    if (!email || !password || !company) {
      return NextResponse.json(
        { error: 'Email, password, and company are required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError?.message)
      return NextResponse.json(
        { error: authError?.message || 'Registration failed' },
        { status: 400 }
      )
    }

    // Create business config record
    const { error: configError } = await supabase.from('business_config').insert({
      id: `config_${Date.now()}`,
      user_id: authData.user.id,
      business_name: company,
      sector: sector || 'Otro',
    })

    if (configError) {
      console.error('Config error:', configError.message)
      // Don't fail if config creation fails - user can update later
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
