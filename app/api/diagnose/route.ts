import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const diagnosis: any = {
    supabaseUrl: supabaseUrl ? '✓ Present' : '✗ Missing',
    supabaseKey: supabaseKey ? '✓ Present' : '✗ Missing',
    supabaseUrlValue: supabaseUrl,
    timestamp: new Date().toISOString(),
    supabaseConnection: '⏳ Checking...',
    supabaseError: 'None',
  }

  // Intentar conectar a Supabase
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase.auth.getSession()

      diagnosis.supabaseConnection = error ? `✗ Error: ${error.message}` : '✓ Connected'
      diagnosis.supabaseError = error?.message || 'None'
    } catch (err) {
      diagnosis.supabaseConnection = `✗ Exception: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  return NextResponse.json(diagnosis)
}
