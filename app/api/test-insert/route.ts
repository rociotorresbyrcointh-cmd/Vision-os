import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test: Insert a professional with correct field mapping
  const testRecord = {
    id: `test_${Date.now()}`,
    user_id: 'test_user_123',
    name: 'TEST_PROFESSIONAL',
    specialty: 'Test Specialty',
    color: '#ff0000',
    hours_start: '09:00',
    hours_end: '18:00',
    days_of_week: [1, 2, 3, 4, 5],
    max_capacity_per_hour: 4,
  }

  console.log('🔧 TEST INSERT:', testRecord)

  const { data, error } = await supabase
    .from('professionals')
    .insert([testRecord])
    .select()

  const result = {
    testRecord,
    insertResult: {
      success: !error,
      data: data,
      error: error ? { message: error.message, code: error.code, details: error.details } : null,
    },
  }

  console.log('📊 TEST RESULT:', result)

  // Clean up
  if (data) {
    await supabase.from('professionals').delete().eq('id', testRecord.id)
  }

  return NextResponse.json(result)
}
