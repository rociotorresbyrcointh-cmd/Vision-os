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

    // Get one sample record to see structure
    const { data: sampleData, error: selectError } = await supabase
      .from('services')
      .select('*')
      .limit(1)

    if (selectError) {
      audit.error = selectError.message
      return NextResponse.json(audit, { status: 500 })
    }

    if (sampleData && sampleData.length > 0) {
      const record = sampleData[0]
      audit.sampleRecord = record
      audit.columns = Object.keys(record)
      audit.columnCount = audit.columns.length

      // Analyze types
      audit.columnTypes = {}
      for (const [key, value] of Object.entries(record)) {
        const jsType = typeof value
        let inferredType = 'unknown'

        if (value === null) {
          inferredType = 'null'
        } else if (jsType === 'string') {
          const strValue = value as string
          inferredType = strValue.length === 36 && strValue.includes('-') ? 'uuid' : 'text'
        } else if (jsType === 'number') {
          inferredType = Number.isInteger(value) ? 'integer' : 'numeric'
        } else if (jsType === 'boolean') {
          inferredType = 'boolean'
        } else if (Array.isArray(value)) {
          inferredType = 'array'
        } else if (jsType === 'object') {
          inferredType = value instanceof Date ? 'timestamp' : 'json'
        }

        audit.columnTypes[key] = {
          jsType,
          inferredType,
          exampleValue: value,
        }
      }
    } else {
      audit.message = 'Table is empty or no records found'
    }

    return NextResponse.json(audit)
  } catch (error) {
    audit.error = String(error)
    return NextResponse.json(audit, { status: 500 })
  }
}
