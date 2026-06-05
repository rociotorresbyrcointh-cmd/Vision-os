// ─── Sincronización de turnos con el servidor ────────────────────

import { TurnosConfig } from './turnos-types'

export const syncTurnosWithServer = async (
  userId: string,
  config: TurnosConfig,
  generalConfig: any
): Promise<boolean> => {
  try {
    const response = await fetch('/api/sync-turnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, config, generalConfig }),
    })

    if (!response.ok) {
      console.warn('Error sincronizando turnos:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.warn('Error conectando con servidor para sincronizar:', error)
    return false
  }
}
