import { supabase } from './supabase-client'

// ─── PROFESIONALES ───
export async function getProfessionals(userId: string) {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', userId)
  return data || []
}

export async function addProfessional(userId: string, prof: any) {
  const { data, error } = await supabase
    .from('professionals')
    .insert([{ ...prof, user_id: userId }])
    .select()
  return data?.[0] || null
}

export async function updateProfessional(userId: string, profId: string, updates: any) {
  const { data } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', profId)
    .eq('user_id', userId)
    .select()
  return data?.[0] || null
}

export async function deleteProfessional(userId: string, profId: string) {
  await supabase
    .from('professionals')
    .delete()
    .eq('id', profId)
    .eq('user_id', userId)
}

// ─── SERVICIOS ───
export async function getServices(userId: string) {
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
  return data || []
}

export async function addService(userId: string, svc: any) {
  const { data } = await supabase
    .from('services')
    .insert([{ ...svc, user_id: userId }])
    .select()
  return data?.[0] || null
}

export async function updateService(userId: string, svcId: string, updates: any) {
  const { data } = await supabase
    .from('services')
    .update(updates)
    .eq('id', svcId)
    .eq('user_id', userId)
    .select()
  return data?.[0] || null
}

export async function deleteService(userId: string, svcId: string) {
  await supabase
    .from('services')
    .delete()
    .eq('id', svcId)
    .eq('user_id', userId)
}

// ─── TURNOS (APPOINTMENTS) ───
export async function getAppointments(userId: string) {
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
  return data || []
}

export async function addAppointment(userId: string, appt: any) {
  const { data } = await supabase
    .from('appointments')
    .insert([{ ...appt, user_id: userId }])
    .select()
  return data?.[0] || null
}

export async function addMultipleAppointments(userId: string, appts: any[]) {
  const withUserId = appts.map(a => ({ ...a, user_id: userId }))
  const { data } = await supabase
    .from('appointments')
    .insert(withUserId)
    .select()
  return data || []
}

export async function updateAppointment(userId: string, apptId: string, updates: any) {
  const { data } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', apptId)
    .eq('user_id', userId)
    .select()
  return data?.[0] || null
}

export async function deleteAppointment(userId: string, apptId: string) {
  await supabase
    .from('appointments')
    .delete()
    .eq('id', apptId)
    .eq('user_id', userId)
}

// ─── CLIENTES ───
export async function getClients(userId: string) {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
  return data || []
}

export async function addClient(userId: string, client: any) {
  const { data } = await supabase
    .from('clients')
    .insert([{ ...client, user_id: userId }])
    .select()
  return data?.[0] || null
}

export async function updateClient(userId: string, clientId: string, updates: any) {
  const { data } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .eq('user_id', userId)
    .select()
  return data?.[0] || null
}

export async function deleteClient(userId: string, clientId: string) {
  await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', userId)
}

// ─── CONFIG ───
export async function getBusinessConfig(userId: string) {
  const { data } = await supabase
    .from('business_config')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data || null
}

export async function updateBusinessConfig(userId: string, updates: any) {
  const { data } = await supabase
    .from('business_config')
    .update(updates)
    .eq('user_id', userId)
    .select()
  return data?.[0] || null
}
