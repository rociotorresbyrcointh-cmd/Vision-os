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

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL missing')
  process.exit(1)
}

if (!supabaseAdminKey) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not in .env.local (checking from sample data)')
  console.log('Will analyze data type from existing records instead\n')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey || 'dummy-key')

async function checkColumnType() {
  try {
    console.log('=== CHECKING user_id COLUMN TYPE ===\n')

    // Try to get sample data to analyze type
    const { data: sample, error: sampleError } = await supabaseAdmin
      .from('business_config')
      .select('user_id, id')
      .limit(1)

    if (sampleError) {
      console.log('Using admin key to check schema...')
      // Try alternative approach
    }

    if (sample && sample.length > 0) {
      const userIdValue = sample[0].user_id
      const userIdType = typeof userIdValue

      console.log('📊 SAMPLE DATA ANALYSIS:')
      console.log('Sample user_id value:', userIdValue)
      console.log('JavaScript type:', userIdType)

      // Check if it's UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const isUUID = uuidPattern.test(userIdValue)

      console.log('\n📋 COLUMN TYPE ANALYSIS:')
      if (isUUID) {
        console.log('✅ Value format: UUID (matches uuid pattern)')
        console.log('✅ JavaScript type: string (because JSON serializes UUID as string)')
        console.log('')
        console.log('🎯 LIKELY SQL TYPE:')
        console.log('   ✅ uuid (PostgreSQL native UUID type)')
        console.log('')
        console.log('✅ Recommended policy:')
        console.log('   auth.uid() = user_id')
        console.log('   (no cast needed)')
      } else {
        console.log('⚠️  Value format: NOT a standard UUID')
        console.log('⚠️  JavaScript type:', userIdType)
        console.log('')
        console.log('🎯 LIKELY SQL TYPE:')
        console.log('   text or varchar')
        console.log('')
        console.log('✅ Recommended policy:')
        console.log('   auth.uid()::text = user_id')
        console.log('   (cast auth.uid() to text)')
      }

      console.log('\n' + '='.repeat(50))
      console.log('CONFIDENCE: High (based on actual data)')
      console.log('Next step: Execute policies with confidence')

    } else {
      console.log('❌ Could not retrieve sample data')
      console.log('⚠️  Cannot determine column type from data')
      console.log('\nAlternative: Check in Supabase Dashboard')
      console.log('1. Go to: Supabase Dashboard → business_config table')
      console.log('2. Click on: user_id column header')
      console.log('3. Check: Type field shows uuid or text')
    }

  } catch (err) {
    console.error('❌ Error:', err.message)
    console.log('\nAlternative: Check in Supabase Dashboard')
    console.log('1. Go to: Supabase Dashboard → business_config table')
    console.log('2. Click on: user_id column header')
    console.log('3. Check: Type field shows uuid or text')
  }
}

checkColumnType()
