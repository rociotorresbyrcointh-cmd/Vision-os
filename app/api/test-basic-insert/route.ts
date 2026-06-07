import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test: Insert WITHOUT any capacity field to discover table structure
  const testRecord = {
    id: `discover_${Date.now()}`,
    user_id: 'e9231268-5d44-4f6f-aed0-cf9928c72712',
    name: 'DISCOVER_TABLE_STRUCTURE',
    specialty: 'Discovery Test',
    color: '#ff0000',
    hours_start: '09:00',
    hours_end: '18:00',
    days_of_week: [1, 2, 3, 4, 5],
  }

  console.log('🔍 Attempting INSERT without capacity field:', testRecord)

  const { data, error } = await supabase
    .from('professionals')
    .insert([testRecord])
    .select()

  const result: any = {
    success: !error,
    error: error?.message,
  }

  if (data && data[0]) {
    console.log('✅ SUCCESS! Record structure:', data[0])
    result.insertedRecord = data[0]
    result.allColumns = Object.keys(data[0])

    // Clean up
    await supabase.from('professionals').delete().eq('id', testRecord.id)
  } else {
    console.log('❌ Failed:', error)
  }

  return NextResponse.json(result)
}
