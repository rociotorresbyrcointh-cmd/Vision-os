import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const results: any = {}

  // Test 1: Absolute minimum fields
  console.log('Test 1: Only id and user_id')
  const test1 = {
    id: `min1_${Date.now()}`,
    user_id: 'e9231268-5d44-4f6f-aed0-cf9928c72712',
  }

  const { data: data1, error: error1 } = await supabase
    .from('professionals')
    .insert([test1])
    .select()

  results.test1_minimum = {
    success: !error1,
    error: error1?.message,
    data: data1,
  }

  if (data1) {
    results.test1_structure = Object.keys(data1[0])
    await supabase.from('professionals').delete().eq('id', test1.id)
  }

  // Test 2: Add name
  if (!error1) {
    console.log('Test 2: id, user_id, name')
    const test2 = {
      ...test1,
      id: `min2_${Date.now()}`,
      name: 'TEST',
    }

    const { data: data2, error: error2 } = await supabase
      .from('professionals')
      .insert([test2])
      .select()

    results.test2_with_name = {
      success: !error2,
      error: error2?.message,
      data: data2,
    }

    if (data2) {
      await supabase.from('professionals').delete().eq('id', test2.id)
    }
  }

  return NextResponse.json(results)
}
