import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve('.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && key.trim() && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAdminKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAdminKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAdminKey)

async function checkRLSStatus() {
  try {
    console.log('=== CHECKING RLS STATUS ===\n')

    // Get all records to verify table access
    const { data: allRecords, error: recordError } = await supabase
      .from('business_config')
      .select('user_id, business_name, id')

    if (recordError) {
      console.error('❌ Error reading business_config:', recordError.message)
      process.exit(1)
    }

    console.log(`📊 Total records in business_config: ${allRecords?.length || 0}`)
    if (allRecords && allRecords.length > 0) {
      console.log(`   Sample records:`)
      allRecords.slice(0, 3).forEach(r => {
        console.log(`   - user_id: ${r.user_id}, business: ${r.business_name}`)
      })
    }

    // Try to fetch as anon user (should fail if RLS enabled)
    console.log('\n📝 Testing SELECT as ANON user (no auth)...')
    const anonClient = createClient(
      supabaseUrl,
      envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: anonData, error: anonError } = await anonClient
      .from('business_config')
      .select('*')

    if (anonError) {
      console.log(`✅ RLS appears ENABLED - ANON user rejected:`)
      console.log(`   Error: ${anonError.message}`)
    } else {
      console.log(`❌ RLS appears DISABLED - ANON user got ${anonData?.length || 0} records`)
    }

    // Show summary
    console.log('\n=== RLS STATUS SUMMARY ===')
    if (anonError && anonError.message.includes('policy')) {
      console.log('✅ RLS STATUS: LIKELY ENABLED (policy violation)')
    } else if (anonError) {
      console.log('⚠️  RLS STATUS: UNCLEAR (error but not policy-related)')
    } else {
      console.log('❌ RLS STATUS: DISABLED (anon user can read)')
    }

  } catch (err) {
    console.error('❌ Fatal error:', err.message)
    process.exit(1)
  }
}

checkRLSStatus()
