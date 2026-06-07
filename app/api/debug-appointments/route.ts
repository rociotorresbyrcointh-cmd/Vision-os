import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, userId, appointmentData } = body

  const result: any = {
    timestamp: new Date().toISOString(),
    action,
    userId,
  }

  if (!supabaseUrl || !supabaseKey) {
    result.error = 'Supabase config missing'
    return NextResponse.json(result, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (action === 'INSERT') {
      console.log('🔍 DEBUG: Inserting appointment:', appointmentData)

      result.payloadSent = appointmentData

      // Attempt INSERT
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()

      console.log('📤 INSERT Response:', { data, error })

      result.insertResponse = {
        success: !error,
        data: data,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
      }

      if (data && data[0]) {
        result.insertedRecord = data[0]
        result.insertedId = data[0].id
        result.storedUserId = data[0].user_id

        // Immediately verify with SELECT
        console.log('🔍 Verifying with SELECT immediately after INSERT')
        const { data: verifyData, error: verifyError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', data[0].id)
          .eq('user_id', userId)

        result.immediateSelectResponse = {
          success: !verifyError,
          recordCount: verifyData?.length || 0,
          data: verifyData,
          error: verifyError ? { message: verifyError.message, code: verifyError.code } : null,
        }

        console.log('✅ Verification:', result.immediateSelectResponse)
      }
    } else if (action === 'SELECT') {
      console.log('🔍 DEBUG: Selecting appointments for user:', userId)

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('📥 SELECT Response:', { recordCount: data?.length || 0, error })

      result.selectResponse = {
        success: !error,
        recordCount: data?.length || 0,
        records: data,
        error: error ? { message: error.message, code: error.code } : null,
      }

      if (data && data.length > 0) {
        result.latestRecord = data[0]
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    result.exception = String(error)
    return NextResponse.json(result, { status: 500 })
  }
}
