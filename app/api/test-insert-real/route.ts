import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const REAL_USER_ID = 'e9231268-5d44-4f6f-aed0-cf9928c72712'

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const results: any = {}

  // Test 1: Only basic fields with REAL user_id
  console.log('Test 1: Basic fields with real user_id')
  const test1 = {
    id: `test1_${Date.now()}`,
    user_id: REAL_USER_ID,
    name: 'TEST_REAL_1',
    specialty: 'Test Specialty',
    color: '#ff0000',
  }

  const { data: data1, error: error1 } = await supabase
    .from('professionals')
    .insert([test1])
    .select()

  results.test1_basic_with_real_uuid = {
    success: !error1,
    error: error1?.message,
    insertedRecord: data1?.[0] || null,
  }

  if (data1) {
    await supabase.from('professionals').delete().eq('id', test1.id)
  }

  // Test 2: With all fields EXCEPT capacity
  console.log('Test 2: All fields except capacity')
  const test2 = {
    id: `test2_${Date.now()}`,
    user_id: REAL_USER_ID,
    name: 'TEST_REAL_2',
    specialty: 'Test Specialty',
    color: '#0000ff',
    hours_start: '09:00',
    hours_end: '18:00',
    days_of_week: [1, 2, 3, 4, 5],
  }

  const { data: data2, error: error2 } = await supabase
    .from('professionals')
    .insert([test2])
    .select()

  results.test2_all_except_capacity = {
    success: !error2,
    error: error2?.message,
    insertedRecord: data2?.[0] || null,
  }

  if (data2) {
    console.log('✅ SUCCESS! Record inserted:', data2[0])
    console.log('Column names in returned record:', Object.keys(data2[0]))

    await supabase.from('professionals').delete().eq('id', test2.id)
  }

  return NextResponse.json(results)
}
