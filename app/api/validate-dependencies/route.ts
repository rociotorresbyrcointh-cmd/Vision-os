import { NextResponse } from 'next/server'

export async function GET() {
  const consoleScript = `const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
const supabase = createClient('https://sinjhkjlsgyajjiixpcd.supabase.co', 'sb_publishable_CQd7iPZQGvBc6vC9k2n2ZA_B-_FgnJD')
const result = {}
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('NOT AUTHENTICATED')
result.userId = user.id
const { data: apts, error: e1 } = await supabase.from('appointments').select('*').eq('user_id', user.id).limit(1)
if (e1) { result.error = e1.message } else if (apts?.length > 0) { result.appointmentColumns = Object.keys(apts[0]); result.sampleAppointment = apts[0] } else { result.note = 'No appointments found' }
const testId = 'test_' + Date.now()
const { data: svc, error: e2 } = await supabase.from('services').insert([{ id: testId, user_id: user.id, name: 'TEST' }]).select()
if (!e2) { const { error: delErr } = await supabase.from('services').delete().eq('id', testId); result.canDeleteService = !delErr; result.deleteError = delErr?.message || null }
console.log(JSON.stringify(result, null, 2))`

  return NextResponse.json({
    step: 'Copy and paste this script in browser console',
    script: consoleScript,
  })
}
