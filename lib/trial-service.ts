import { supabase } from './supabase-client'

export async function createTrialStatus(userId: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { error } = await supabase
    .from('trial_status')
    .insert([{
      user_id: userId,
      trial_expires_at: expiresAt.toISOString(),
      status: 'trial'
    }])

  return !error
}

export async function getTrialStatus(userId: string) {
  const { data } = await supabase
    .from('trial_status')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) return null

  const now = new Date()
  const expiresAt = new Date(data.trial_expires_at)
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    status: data.status,
    expiresAt,
    daysLeft: Math.max(0, daysLeft),
    isExpired: daysLeft <= 0
  }
}

export async function markTrialAsActive(userId: string) {
  await supabase
    .from('trial_status')
    .update({ status: 'active' })
    .eq('user_id', userId)
}
