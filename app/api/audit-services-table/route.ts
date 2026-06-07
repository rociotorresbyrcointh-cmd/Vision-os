import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const TEST_USER_ID = 'e9231268-5d44-4f6f-aed0-cf9928c72712'

export async function GET(req: NextRequest) {
  const audit: any = {
    timestamp: new Date().toISOString(),
    table: 'services',
    methodology: 'Insert minimal record to discover table structure',
  }

  if (!supabaseUrl || !supabaseKey) {
    audit.error = 'Supabase config missing'
    return NextResponse.json(audit, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const testId = `audit_${Date.now()}`

    // Step 1: Try minimal insert with only id and user_id
    audit.step1 = { description: 'Testing minimal insert (id + user_id)' }
    const minimal = { id: testId, user_id: TEST_USER_ID }
    const { data: data1, error: error1 } = await supabase
      .from('services')
      .insert([minimal])
      .select()

    if (error1) {
      audit.step1.error = error1.message
      // Step 1 failed, but continue - column structure might still be revealed in error
      audit.step1.note = 'Minimal insert failed - table likely requires more fields'
    } else {
      audit.step1.success = true
      audit.step1.result = data1
      if (data1 && data1[0]) {
        const record = data1[0]
        audit.discoveredColumns = Object.keys(record)
        audit.discoveredColumnTypes = {}

        for (const [key, value] of Object.entries(record)) {
          const jsType = typeof value
          let inferredType = 'unknown'

          if (value === null) {
            inferredType = 'NULL'
          } else if (jsType === 'string') {
            const strValue = value as string
            if (strValue.length === 36 && strValue.includes('-')) {
              inferredType = 'uuid'
            } else {
              inferredType = 'text/varchar'
            }
          } else if (jsType === 'number') {
            inferredType = Number.isInteger(value) ? 'integer' : 'numeric'
          } else if (jsType === 'boolean') {
            inferredType = 'boolean'
          } else if (Array.isArray(value)) {
            inferredType = 'array'
          } else if (jsType === 'object') {
            inferredType = value instanceof Date ? 'timestamp' : 'json'
          }

          audit.discoveredColumnTypes[key] = inferredType
        }

        // Clean up test record
        await supabase.from('services').delete().eq('id', testId)
        audit.step1.cleaned = true
      }
    }

    // Step 2: If Step 1 failed, try adding more fields
    if (error1 && !data1) {
      audit.step2 = { description: 'Testing with additional common fields (id, user_id, name)' }
      const withName = {
        id: `${testId}_2`,
        user_id: TEST_USER_ID,
        name: 'AUDIT_TEST_SERVICE',
      }

      const { data: data2, error: error2 } = await supabase
        .from('services')
        .insert([withName])
        .select()

      if (error2) {
        audit.step2.error = error2.message
      } else {
        audit.step2.success = true
        audit.step2.result = data2
        if (data2 && data2[0]) {
          const record = data2[0]
          audit.discoveredColumns = Object.keys(record)
          audit.discoveredColumnTypes = {}

          for (const [key, value] of Object.entries(record)) {
            const jsType = typeof value
            let inferredType = 'unknown'

            if (value === null) {
              inferredType = 'NULL'
            } else if (jsType === 'string') {
              const strValue = value as string
              if (strValue.length === 36 && strValue.includes('-')) {
                inferredType = 'uuid'
              } else {
                inferredType = 'text/varchar'
              }
            } else if (jsType === 'number') {
              inferredType = Number.isInteger(value) ? 'integer' : 'numeric'
            } else if (jsType === 'boolean') {
              inferredType = 'boolean'
            } else if (Array.isArray(value)) {
              inferredType = 'array'
            } else if (jsType === 'object') {
              inferredType = value instanceof Date ? 'timestamp' : 'json'
            }

            audit.discoveredColumnTypes[key] = inferredType
          }

          // Clean up
          await supabase.from('services').delete().eq('id', `${testId}_2`)
          audit.step2.cleaned = true
        }
      }
    }

    return NextResponse.json(audit)
  } catch (error) {
    audit.exception = String(error)
    return NextResponse.json(audit, { status: 500 })
  }
}
