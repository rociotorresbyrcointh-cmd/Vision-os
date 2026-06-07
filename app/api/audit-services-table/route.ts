import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const audit: any = {
    timestamp: new Date().toISOString(),
    table: 'services',
    findings: {},
  }

  // 1. Try to SELECT to see structure
  console.log('1. Attempting SELECT from services table...')
  const { data: sampleData, error: selectError } = await supabase
    .from('services')
    .select('*')
    .limit(1)

  audit.findings.selectQuery = {
    success: !selectError,
    error: selectError?.message,
    recordCount: sampleData?.length || 0,
  }

  if (sampleData && sampleData.length > 0) {
    const sampleRecord = sampleData[0]
    audit.findings.sampleRecord = sampleRecord
    audit.findings.columnNames = Object.keys(sampleRecord)
    audit.findings.columnTypes = {}
    audit.findings.columnValues = {}

    for (const [key, value] of Object.entries(sampleRecord)) {
      const jsType = typeof value
      let supabaseType = 'unknown'

      if (value === null) supabaseType = 'null'
      else if (jsType === 'string') supabaseType = 'text/varchar/uuid'
      else if (jsType === 'number') {
        supabaseType = Number.isInteger(value) ? 'integer' : 'numeric/decimal'
      }
      else if (jsType === 'boolean') supabaseType = 'boolean'
      else if (Array.isArray(value)) supabaseType = 'array'
      else if (jsType === 'object') supabaseType = 'json/jsonb/timestamp'

      audit.findings.columnTypes[key] = {
        jsType,
        supabaseType,
        exampleValue: value,
        isNull: value === null,
      }

      audit.findings.columnValues[key] = value
    }
  }

  // 2. Test minimal INSERT
  console.log('2. Testing minimal INSERT...')
  const testId = `audit_${Date.now()}`
  const minimalRecord = {
    id: testId,
    user_id: 'e9231268-5d44-4f6f-aed0-cf9928c72712',
    name: 'AUDIT_TEST',
  }

  const { data: insertData, error: insertError } = await supabase
    .from('services')
    .insert([minimalRecord])
    .select()

  audit.findings.minimalInsert = {
    attempted: minimalRecord,
    success: !insertError,
    error: insertError?.message,
  }

  if (insertData) {
    audit.findings.minimalInsertResult = insertData[0]
    // Clean up
    await supabase.from('services').delete().eq('id', testId)
  }

  // 3. Query information_schema for detailed column info
  console.log('3. Querying information_schema for column details...')
  const { data: columnInfo, error: columnError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'services')

  audit.findings.columnDetails = {
    success: !columnError,
    error: columnError?.message,
    columns: columnInfo,
  }

  // 4. Check for constraints
  console.log('4. Checking table constraints...')
  const { data: constraints, error: constraintError } = await supabase
    .from('information_schema.table_constraints')
    .select('constraint_name, constraint_type')
    .eq('table_name', 'services')

  audit.findings.constraints = {
    success: !constraintError,
    error: constraintError?.message,
    constraints: constraints,
  }

  // 5. Check RLS policies
  console.log('5. Checking RLS policies...')
  const { data: policies, error: policyError } = await supabase
    .rpc('get_policies')
    .then(
      result => ({ data: result.data, error: null }),
      error => ({ data: null, error: error.message })
    )
    .catch(() => ({ data: null, error: 'RLS policies not accessible' }))

  audit.findings.rlsPolicies = {
    attempted: true,
    note: 'RLS policies for services table',
    error: policyError,
  }

  // 6. Summary
  audit.summary = {
    tableExists: !selectError,
    hasData: sampleData && sampleData.length > 0,
    columnCount: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]).length : 0,
    canInsert: !insertError,
    message: !selectError
      ? 'Table exists and is accessible'
      : 'Table not found or not accessible',
  }

  return NextResponse.json(audit, { status: 200 })
}
