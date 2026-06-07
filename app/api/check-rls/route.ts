import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Para testear RLS, abre la consola del navegador y ejecuta este script:',
    script: `
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
const supabase = createClient('https://sinjhkjlsgyajjiixpcd.supabase.co', 'sb_publishable_CQd7iPZQGvBc6vC9k2n2ZA_B-_FgnJD')

// Obtener sesión actual
const { data: { session } } = await supabase.auth.getSession()
console.log('Sesión actual:', session ? 'AUTENTICADO como ' + session.user.id : 'NO AUTENTICADO')

// Intentar INSERT
const testRecord = {
  id: 'test_rls_' + Date.now(),
  user_id: session?.user?.id || 'unknown',
  name: 'TEST_RLS',
  specialty: 'Test',
  color: '#ff0000',
  hours_start: '09:00',
  hours_end: '18:00',
  days_of_week: [1,2,3,4,5],
}

console.log('Intentando INSERT con user_id:', testRecord.user_id)

const { data, error } = await supabase
  .from('professionals')
  .insert([testRecord])
  .select()

console.log('Resultado:', { success: !error, data, error: error?.message })

// Limpiar si fue exitoso
if (data) {
  await supabase.from('professionals').delete().eq('id', testRecord.id)
}
    `,
  })
}
