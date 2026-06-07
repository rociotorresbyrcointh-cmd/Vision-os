import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const result: any = {}

  // Try to get the first record to see table structure
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .limit(1)

  result.querySuccess = !error
  result.error = error?.message
  result.recordCount = data?.length || 0

  if (data && data.length > 0) {
    result.sampleRecord = data[0]
    result.columns = Object.keys(data[0])
  }

  // Also try to query info schema (might fail due to RLS)
  const { data: tableInfo, error: infoError } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'professionals')
    .catch(() => ({ data: null, error: 'Not accessible' }))

  result.tableInfo = tableInfo
  result.tableInfoError = infoError

  return NextResponse.json(result)
}
