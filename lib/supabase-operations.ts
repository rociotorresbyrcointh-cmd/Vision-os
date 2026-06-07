import { supabase } from './supabase-client'

// Mapeo de campos TypeScript a Supabase (snake_case)
function mapProfessionalToDb(prof: any) {
  return {
    id: prof.id,
    user_id: prof.user_id,
    name: prof.name,
    specialty: prof.specialty,
    color: prof.color,
    hours_start: prof.hoursStart,
    hours_end: prof.hoursEnd,
    days_of_week: prof.daysOfWeek,
    max_capacity_per_hour: prof.maxCapacityPerHour,
  }
}

function mapProfessionalFromDb(prof: any) {
  return {
    id: prof.id,
    user_id: prof.user_id,
    name: prof.name,
    specialty: prof.specialty,
    color: prof.color,
    hoursStart: prof.hours_start,
    hoursEnd: prof.hours_end,
    daysOfWeek: prof.days_of_week,
    maxCapacityPerHour: prof.max_capacity_per_hour,
  }
}

// ─── PROFESIONALES ───
export async function getProfessionals(userId: string) {
  console.log('🔍 [SUPABASE] getProfessionals called with userId:', userId)

  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', userId)

  console.log('🔍 [SUPABASE] Query result:', { recordCount: data?.length || 0, data, error })

  if (error) {
    console.error('❌ [SUPABASE] Query error:', error.message, error.code, error.details)
    return []
  }

  return (data || []).map(mapProfessionalFromDb)
}

export async function addProfessional(userId: string, prof: any) {
  console.log('🔧 [SUPABASE] addProfessional called with:', { userId, prof })
  const recordToInsert = mapProfessionalToDb({ ...prof, user_id: userId })
  console.log('🔧 [SUPABASE] Inserting record with mapped fields:', recordToInsert)

  const { data, error } = await supabase
    .from('professionals')
    .insert([recordToInsert])
    .select()

  console.log('🔧 [SUPABASE] Insert response:', { data, error })

  if (error) {
    console.error('❌ [SUPABASE] Insert error:', error.message, error.code, error.details)
    return null
  }

  if (data && data[0]) {
    return mapProfessionalFromDb(data[0])
  }

  return null
}

export async function updateProfessional(userId: string, profId: string, updates: any) {
  console.log('🔧 [SUPABASE] updateProfessional called with:', { userId, profId, updates })
  const mappedUpdates = mapProfessionalToDb(updates)
  console.log('🔧 [SUPABASE] Updating with mapped fields:', mappedUpdates)

  const { data, error } = await supabase
    .from('professionals')
    .update(mappedUpdates)
    .eq('id', profId)
    .eq('user_id', userId)
    .select()

  if (error) {
    console.error('❌ [SUPABASE] Update error:', error.message)
    return null
  }

  return data?.[0] ? mapProfessionalFromDb(data[0]) : null
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
