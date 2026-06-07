import { NextResponse } from 'next/server'

export async function GET() {
  const script = `
// Ejecuta este script en la consola del navegador mientras estés autenticado en la app
// This script discovers the services table structure by attempting a test insert

const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
const supabase = createClient(
  'https://sinjhkjlsgyajjiixpcd.supabase.co',
  'sb_publishable_CQd7iPZQGvBc6vC9k2n2ZA_B-_FgnJD'
)

const audit = {
  timestamp: new Date().toISOString(),
  analysis: 'Services-Appointments Dependencies',
}

const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  audit.error = 'NOT AUTHENTICATED'
  console.log(audit)
  throw new Error('Not authenticated')
}

console.log('📊 STEP 1: Discover appointments table structure')
const { data: appointments, error: appointmentsError } = await supabase
  .from('appointments')
  .select('*')
  .eq('user_id', user.id)
  .limit(1)

if (appointmentsError) {
  audit.appointmentsStructure = { error: appointmentsError.message }
} else if (appointments && appointments.length > 0) {
  const apt = appointments[0]
  audit.appointmentsStructure = {
    columns: Object.keys(apt),
    sampleRecord: apt,
  }
  console.log('✅ Found sample appointment:', apt)
} else {
  audit.appointmentsStructure = { note: 'No appointments found for user' }
  console.log('⚠️ No appointments found')
}

console.log('📊 STEP 2: Check if services are referenced')
if (audit.appointmentsStructure.columns) {
  const cols = audit.appointmentsStructure.columns
  audit.serviceReferences = {
    hasServiceId: cols.includes('service_id'),
    hasServiceName: cols.includes('service_name'),
    hasServiceInfo: cols.includes('service_info'),
  }
  console.log('Service references:', audit.serviceReferences)
}

console.log('📊 STEP 3: Test safe delete')
const testServiceId = \`test_svc_\${Date.now()}\`
const { data: createdService, error: createError } = await supabase
  .from('services')
  .insert([{ id: testServiceId, user_id: user.id, name: 'DELETE_TEST' }])
  .select()

if (!createError && createdService) {
  console.log('✅ Created test service')
  const { error: deleteError } = await supabase
    .from('services')
    .delete()
    .eq('id', testServiceId)

  audit.safeDeleteTest = {
    canDeleteEmptyService: !deleteError,
    error: deleteError?.message || null,
  }
  console.log('Safe delete result:', audit.safeDeleteTest)
}

console.log('\\n✅ FULL DEPENDENCY ANALYSIS:')
console.log(JSON.stringify(audit, null, 2))
`

  return NextResponse.json({
    message: 'Valida las dependencias entre services y appointments:',
    instructions: [
      '1. Abre DevTools (F12)',
      '2. Ve a Console',
      '3. Escribe: allow pasting',
      '4. Presiona Enter',
      '5. Copia y pega el script de abajo',
      '6. El script validará todas las dependencias',
      '7. Copia el resultado y envíamelo'
    ],
    script: script,
  })
}
