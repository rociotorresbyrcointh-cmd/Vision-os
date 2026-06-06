import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, empresa, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y code requeridos' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      code: code,
      message: 'Código generado'
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
