import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  const diagnosis: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseConfigured: !!supabaseUrl && !!supabaseKey,
    supabaseUrl: supabaseUrl || 'MISSING',
    supabaseKeyPrefix: supabaseKey?.substring(0, 20) + '...' || 'MISSING',
  }

  if (!supabaseUrl || !supabaseKey) {
    diagnosis.error = 'Supabase configuration is missing'
    return NextResponse.json(diagnosis, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('professionals')
      .select('count')
      .limit(1)

    diagnosis.supabaseConnection = {
      success: !testError,
      error: testError?.message || null,
    }

    // Get table structure
    const { data: sample, error: sampleError } = await supabase
      .from('professionals')
      .select('*')
      .limit(1)

    if (!sampleError && sample && sample.length > 0) {
      diagnosis.tableStructure = {
        columns: Object.keys(sample[0]),
        sampleRecord: sample[0],
      }
    } else {
      diagnosis.tableStructure = {
        error: sampleError?.message || 'Table is empty or query failed',
      }
    }

    return NextResponse.json(diagnosis)
  } catch (error) {
    diagnosis.error = String(error)
    return NextResponse.json(diagnosis, { status: 500 })
  }
}
