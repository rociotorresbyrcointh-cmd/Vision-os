import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, empresa, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y code requeridos' }, { status: 400 })
    }

    // Por ahora devolvemos el código directamente
    // El usuario puede copiarlo de la interfaz
    // El email se configura cuando verificamos el dominio en Resend

    return NextResponse.json({
      success: true,
      message: '✅ Tu código está listo. Cópialo abajo para registrarte.',
      code,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: `Error: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 })
  }
}
