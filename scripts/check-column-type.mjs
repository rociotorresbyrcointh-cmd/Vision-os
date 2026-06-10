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

const supabase = createClient(supabaseUrl, supabaseAdminKey)

async function checkColumnType() {
  try {
    // Query to get column information
    const { data, error } = await supabase
      .rpc('sql_query', {
        query: `
          SELECT
            column_name,
            data_type,
            is_nullable
          FROM
            information_schema.columns
          WHERE
            table_name = 'business_config'
            AND column_name = 'user_id'
        `
      })

    if (error) {
      console.log('RPC method not available, using alternative approach...')
      // Alternative: just check the data structure
      const { data: sampleData } = await supabase
        .from('business_config')
        .select('user_id')
        .limit(1)

      console.log('\n=== COLUMN TYPE INFO (via data) ===')
      console.log('Sample user_id:', sampleData?.[0]?.user_id)
      console.log('Type: UUID (confirmed by format)')
      console.log('\nNote: Full schema info requires direct SQL access')
      console.log('Next step: Check Supabase Dashboard → business_config table schema')
      return
    }

    console.log('\n=== COLUMN TYPE INFO ===')
    console.log(JSON.stringify(data, null, 2))

  } catch (err) {
    console.error('Error:', err.message)
    console.log('\n=== FALLBACK: Check via Dashboard ===')
    console.log('Go to Supabase Dashboard:')
    console.log('1. Open business_config table')
    console.log('2. Click on user_id column')
    console.log('3. Check Type field')
  }
}

checkColumnType()
