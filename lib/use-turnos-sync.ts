import { useEffect } from 'react'
import { TurnosConfig } from './turnos-types'
import { addMultipleAppointments, updateAppointment, deleteAppointment } from './supabase-operations'

export function useTurnosSync(userId: string | undefined, config: TurnosConfig) {
  useEffect(() => {
    if (!userId) return

    // Sync to Supabase whenever config changes
    const syncAppointments = async () => {
      try {
        // Get previous sync timestamp from localStorage
        const lastSync = localStorage.getItem(`bos_sync_${userId}`)
        const lastSyncTime = lastSync ? new Date(lastSync).getTime() : 0

        // Find appointments created after last sync
        const newAppointments = config.appointments.filter(a => {
          const createdTime = new Date(a.createdAt).getTime()
          return createdTime > lastSyncTime
        })

        if (newAppointments.length > 0) {
          await addMultipleAppointments(userId, newAppointments)
        }

        // Update sync timestamp
        localStorage.setItem(`bos_sync_${userId}`, new Date().toISOString())
      } catch (error) {
        console.log('Sync to Supabase failed, using localStorage as fallback', error)
      }
    }

    const timer = setTimeout(syncAppointments, 1000)
    return () => clearTimeout(timer)
  }, [userId, config.appointments])
}
