import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  const audit: any = {
    timestamp: new Date().toISOString(),
    table: 'services',
  }

  if (!supabaseUrl || !supabaseKey) {
    audit.error = 'Supabase config missing'
    return NextResponse.json(audit, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Query information_schema.columns directly to get table structure
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, ordinal_position')
      .eq('table_schema', 'public')
      .eq('table_name', 'services')
      .order('ordinal_position', { ascending: true })

    if (columnError) {
      audit.error = `Failed to query column info: ${columnError.message}`
      return NextResponse.json(audit, { status: 500 })
    }

    if (columns && columns.length > 0) {
      audit.columns = columns
      audit.columnCount = columns.length
      audit.columnNames = columns.map((c: any) => c.column_name)
    } else {
      audit.error = 'No columns found for services table'
      return NextResponse.json(audit, { status: 404 })
    }

    // Try to get constraints (primary key, foreign keys, etc.)
    const { data: constraints } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'services')

    if (constraints && constraints.length > 0) {
      audit.constraints = constraints
    }

    // Try to get one sample record if table has data
    const { data: sampleData } = await supabase
      .from('services')
      .select('*')
      .limit(1)

    if (sampleData && sampleData.length > 0) {
      audit.sampleRecord = sampleData[0]
    } else {
      audit.sampleRecord = null
      audit.note = 'Table exists but is empty'
    }

    return NextResponse.json(audit)
  } catch (error) {
    audit.error = `Exception: ${String(error)}`
    return NextResponse.json(audit, { status: 500 })
  }
}
