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
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Using Supabase URL:', supabaseUrl?.substring(0, 30) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('business_config')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }

    if (data && data.length > 0) {
      const record = data[0]
      const userIdValue = record.user_id
      const userIdType = typeof userIdValue

      console.log('\n=== SCHEMA INFO ===')
      console.log('user_id value:', userIdValue)
      console.log('JavaScript type:', userIdType)

      // Detectar si es UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidPattern.test(userIdValue)) {
        console.log('✅ Confirmado: user_id es UUID (formato correcto)')
      } else {
        console.log('⚠️ user_id no es UUID formato válido')
      }

      console.log('\nColumn names:', Object.keys(record))
    } else {
      console.log('⚠️ No records found in business_config')
    }
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

checkSchema()
