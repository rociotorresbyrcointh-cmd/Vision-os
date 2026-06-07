import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const results: any = {}

  // Test 1: Only basic fields
  console.log('Test 1: Basic fields only')
  const test1 = {
    id: `test1_${Date.now()}`,
    user_id: 'test_user_123',
    name: 'TEST_1',
    specialty: 'Test',
    color: '#ff0000',
  }

  const { data: data1, error: error1 } = await supabase
    .from('professionals')
    .insert([test1])
    .select()

  results.test1_basic = { success: !error1, error: error1?.message }

  if (data1) await supabase.from('professionals').delete().eq('id', test1.id)

  // Test 2: Add hours_start and hours_end
  console.log('Test 2: Add hours_start and hours_end')
  const test2 = {
    ...test1,
    id: `test2_${Date.now()}`,
    hours_start: '09:00',
    hours_end: '18:00',
  }

  const { data: data2, error: error2 } = await supabase
    .from('professionals')
    .insert([test2])
    .select()

  results.test2_hours = { success: !error2, error: error2?.message }

  if (data2) await supabase.from('professionals').delete().eq('id', test2.id)

  // Test 3: Add days_of_week
  console.log('Test 3: Add days_of_week')
  const test3 = {
    ...test2,
    id: `test3_${Date.now()}`,
    days_of_week: [1, 2, 3, 4, 5],
  }

  const { data: data3, error: error3 } = await supabase
    .from('professionals')
    .insert([test3])
    .select()

  results.test3_days = { success: !error3, error: error3?.message }

  if (data3) await supabase.from('professionals').delete().eq('id', test3.id)

  // Test 4: Try different names for capacity
  console.log('Test 4: Try capacity variants')
  const capacityTests = [
    { field: 'max_capacity_per_hour', value: 4 },
    { field: 'maxCapacityPerHour', value: 4 },
    { field: 'capacity_per_hour', value: 4 },
    { field: 'max_capacity', value: 4 },
    { field: 'capacity', value: 4 },
  ]

  results.test4_capacity_variants = {}

  for (const capTest of capacityTests) {
    const testRecord = {
      ...test3,
      id: `test4_${capTest.field}_${Date.now()}`,
      [capTest.field]: capTest.value,
    }

    const { data: capData, error: capError } = await supabase
      .from('professionals')
      .insert([testRecord])
      .select()

    results.test4_capacity_variants[capTest.field] = {
      success: !capError,
      error: capError?.message,
    }

    if (capData) await supabase.from('professionals').delete().eq('id', testRecord.id)
  }

  return NextResponse.json(results)
}
