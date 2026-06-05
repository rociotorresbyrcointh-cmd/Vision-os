import { NextRequest, NextResponse } from 'next/server'
import { registerUserTurnos } from '@/lib/cron-jobs'

export const POST = async (req: NextRequest) => {
  try {
    const { userId, config, generalConfig } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    // Guardar turnos en la memoria del servidor para que el cron job pueda acceder
    registerUserTurnos(userId, config, generalConfig)

    return NextResponse.json({
      success: true,
      message: 'Turnos sincronizados correctamente',
    })
  } catch (error: any) {
    console.error('Error sincronizando turnos:', error)
    return NextResponse.json(
      { error: error.message || 'Error al sincronizar' },
      { status: 500 }
    )
  }
}
