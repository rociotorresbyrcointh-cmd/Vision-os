// ─── Inicialización del servidor con cron jobs ────────────────────

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeRemindersJob } = await import('./lib/cron-jobs')
    initializeRemindersJob()
    console.log('✓ Cron jobs inicializados')
  }
}
