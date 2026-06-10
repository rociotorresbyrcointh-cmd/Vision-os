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
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
const adminKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey || !adminKey) {
  console.error('❌ ERROR: Variables de entorno incompletas')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl ? '✅' : '❌')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!anonKey ? '✅' : '❌')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!adminKey ? '✅' : '❌')
  process.exit(1)
}

console.log('✅ Variables de entorno cargadas\n')

// Crear clientes exactamente como en /api/register
const supabasePublic = createClient(supabaseUrl, anonKey)
const supabaseAdmin = createClient(supabaseUrl, adminKey)

console.log('✅ Clientes Supabase creados\n')

async function testRegistrationFlow() {
  try {
    const testEmail = `test_${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    const testCompany = 'Test Company'
    const testSector = 'Testing'

    console.log('=== TEST: Simulación de flujo de registro ===\n')

    // PASO 1: Crear usuario con cliente PÚBLICO
    console.log(`📝 PASO 1: Crear usuario con supabasePublic`)
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: [hidden]`)

    const { data: authData, error: authError } = await supabasePublic.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/confirm',
        data: { company: testCompany, sector: testSector }
      }
    })

    if (authError) {
      console.error('   ❌ ERROR en signUp:', authError.message)
      process.exit(1)
    }

    if (!authData.user?.id) {
      console.error('   ❌ ERROR: Usuario no creado')
      process.exit(1)
    }

    console.log(`   ✅ Usuario creado en auth.users`)
    console.log(`   UUID: ${authData.user.id}\n`)

    // PASO 2: Insertar config con cliente ADMIN
    console.log(`📝 PASO 2: Insertar config en business_config con supabaseAdmin`)
    console.log(`   user_id: ${authData.user.id}`)
    console.log(`   business_name: ${testCompany}`)
    console.log(`   sector: ${testSector}`)

    const { data: configData, error: configError } = await supabaseAdmin
      .from('business_config')
      .insert({
        id: `config_${Date.now()}`,
        user_id: authData.user.id,
        business_name: testCompany,
        sector: testSector
      })
      .select()

    if (configError) {
      console.error('   ❌ ERROR en INSERT business_config:', configError.message)
      console.error('   Detalles:', JSON.stringify(configError, null, 2))
      process.exit(1)
    }

    console.log(`   ✅ Config creado en business_config\n`)

    // PASO 3: Leer config como usuario autenticado
    console.log(`📝 PASO 3: Verificar que se puede leer config`)

    // Simulamos que el usuario está autenticado
    const { data: session } = await supabasePublic.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (!session?.user) {
      console.error('   ❌ ERROR: No se pudo autenticar')
      process.exit(1)
    }

    console.log(`   ✅ Usuario autenticado`)
    console.log(`   session.user.id: ${session.user.id}\n`)

    // Nota: Esto simularía lo que haría el cliente autenticado
    console.log(`📝 PASO 4: Simular SELECT como cliente autenticado (sin RLS)`)
    console.log(`   (Con RLS, solo vería sus propios datos)`)

    const { data: readConfig, error: readError } = await supabaseAdmin
      .from('business_config')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (readError) {
      console.error('   ❌ ERROR al leer:', readError.message)
      process.exit(1)
    }

    if (readConfig) {
      console.log(`   ✅ Config recuperado:`)
      console.log(`      - user_id: ${readConfig.user_id}`)
      console.log(`      - business_name: ${readConfig.business_name}`)
      console.log(`      - sector: ${readConfig.sector}\n`)
    }

    // Limpiar: Eliminar usuario de prueba
    console.log(`🧹 Limpieza: Eliminar usuario de prueba`)

    const { error: deleteConfigError } = await supabaseAdmin
      .from('business_config')
      .delete()
      .eq('user_id', authData.user.id)

    if (deleteConfigError) {
      console.warn(`   ⚠️  No se pudo eliminar config:`, deleteConfigError.message)
    } else {
      console.log(`   ✅ Config eliminado\n`)
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

    if (deleteUserError) {
      console.warn(`   ⚠️  No se pudo eliminar usuario:`, deleteUserError.message)
    } else {
      console.log(`   ✅ Usuario eliminado\n`)
    }

    // Resumen
    console.log('=== ✅ TEST COMPLETADO EXITOSAMENTE ===\n')
    console.log('Resumen:')
    console.log('  ✅ supabasePublic cliente funciona (auth.signUp)')
    console.log('  ✅ supabaseAdmin cliente funciona (business_config.insert)')
    console.log('  ✅ Flujo de registro funciona completamente')
    console.log('  ✅ Datos se persisten correctamente')
    console.log('  ✅ Lectura de datos funciona\n')
    console.log('Próximo paso: Habilitar RLS en business_config con SQL')
    console.log('Script: docs/enable-rls-business-config.sql')

  } catch (err) {
    console.error('❌ ERROR FATAL:', err.message)
    process.exit(1)
  }
}

testRegistrationFlow()
