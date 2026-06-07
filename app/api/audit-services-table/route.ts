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
  table: 'services',
  method: 'Authenticated client insert test'
}

// Get current user
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  audit.error = 'NOT AUTHENTICATED - Log in first'
  console.log(audit)
  throw new Error('Not authenticated')
}

audit.authenticatedAsUserId = user.id

// Test 1: Minimal insert
console.log('🧪 Test 1: Minimal insert (id + user_id)')
const testId = \`audit_\${Date.now()}\`
const { data: data1, error: error1 } = await supabase
  .from('services')
  .insert([{ id: testId, user_id: user.id }])
  .select()

if (error1) {
  audit.test1_error = error1.message
  console.log('❌ Test 1 failed:', error1.message)
} else {
  audit.test1_success = true
  audit.discoveredColumns = Object.keys(data1[0])
  audit.sampleRecord = data1[0]
  console.log('✅ Test 1 success! Columns:', audit.discoveredColumns)

  // Cleanup
  await supabase.from('services').delete().eq('id', testId)
}

// Test 2: With name field
if (error1) {
  console.log('🧪 Test 2: Insert with name field')
  const testId2 = \`audit_\${Date.now()}_2\`
  const { data: data2, error: error2 } = await supabase
    .from('services')
    .insert([{ id: testId2, user_id: user.id, name: 'TEST' }])
    .select()

  if (error2) {
    audit.test2_error = error2.message
    console.log('❌ Test 2 failed:', error2.message)
  } else {
    audit.test2_success = true
    audit.discoveredColumns = Object.keys(data2[0])
    audit.sampleRecord = data2[0]
    console.log('✅ Test 2 success! Columns:', audit.discoveredColumns)

    // Cleanup
    await supabase.from('services').delete().eq('id', testId2)
  }
}

console.log('\\n📋 FULL AUDIT RESULT:')
console.log(JSON.stringify(audit, null, 2))
console.log('\\nCopy the audit object above and send it to your developer')
`

  return NextResponse.json({
    message: 'Abre la consola del navegador (F12) en la app y ejecuta este script:',
    instructions: [
      '1. Asegúrate de estar autenticado en la app',
      '2. Presiona F12 para abrir DevTools',
      '3. Ve a la pestaña "Console"',
      '4. Copia y pega TODO el código debajo',
      '5. El script te mostrará la estructura de la tabla services',
      '6. Copia el resultado y envíamelo'
    ],
    script: script,
  })
}
