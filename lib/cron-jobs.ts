// ─── Cron Jobs para recordatorios automáticos ────────────────────

import cron from 'node-cron'
import { getPendingReminders, sendPendingReminders } from './reminders-service'
import { TurnosConfig } from './turnos-types'

// Almacenamiento en memoria de turnos (en producción usar base de datos)
let allUsersTurnos: Map<string, { config: TurnosConfig; generalConfig: any }> = new Map()

export const registerUserTurnos = (userId: string, config: TurnosConfig, generalConfig: any) => {
  allUsersTurnos.set(userId, { config, generalConfig })
}

export const initializeRemindersJob = () => {
  // Ejecutar cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Verificando recordatorios pendientes...', new Date())

    for (const [userId, data] of allUsersTurnos.entries()) {
      try {
        const pending = getPendingReminders(data.config, data.generalConfig)
        if (pending.length > 0) {
          console.log(`[Cron] Enviando ${pending.length} recordatorios para usuario ${userId}`)
          await sendPendingReminders(pending)
        }
      } catch (error) {
        console.error(`[Cron] Error procesando recordatorios para ${userId}:`, error)
      }
    }
  })

  console.log('[Cron] Job de recordatorios inicializado (cada 5 minutos)')
}
