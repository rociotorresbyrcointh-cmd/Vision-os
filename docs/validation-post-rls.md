# Validación Post-RLS: business_config

**Fecha:** 2026-06-10  
**Cambios:** Habilitado RLS en business_config con 4 policies  
**Código:** Dos clientes Supabase en /api/register (supabasePublic + supabaseAdmin)

---

## ✅ CHECKLIST DE VALIDACIÓN

### TEST 1: Registro de nuevo usuario

**Objetivo:** Confirmar que POST /api/register funciona con RLS habilitado

```bash
# 1. Ir a https://[tu-app]/register
# 2. Completar formulario:
#    - Email: test_user_$(date +%s)@example.com
#    - Password: TestPass123!
#    - Empresa: Test Company Inc
#    - Sector: Consultoría

# 3. Hacer click en "Registrarse"

# 4. Esperado: Sin errores, redirect a confirmación/dashboard
```

**Verificación en Supabase Dashboard:**
```sql
-- Verificar usuario creado en auth.users
SELECT id, email FROM auth.users 
WHERE email LIKE 'test_user_%@example.com' 
ORDER BY created_at DESC LIMIT 1;

-- Verificar config creado en business_config (RLS debe permitir)
SELECT * FROM business_config 
WHERE email LIKE 'test_user_%@example.com';
-- O por user_id si conoces el UUID
```

**Criterios de éxito:**
- [ ] Sin errores en console del navegador
- [ ] Sin errores en logs de servidor
- [ ] Usuario visible en auth.users
- [ ] Config visible en business_config con user_id correcto

---

### TEST 2: Login del usuario registrado

**Objetivo:** Confirmar que login obtiene business_config correctamente

```bash
# 1. Ir a https://[tu-app]/login
# 2. Ingresar email y password del usuario creado en TEST 1
# 3. Hacer click en "Entrar"

# 4. Esperado: 
#    - Redirect a dashboard sin errores
#    - userData muestra: company = "Test Company Inc"
#    - No hay mensajes de error en console
```

**Verificación en console del navegador:**
```javascript
// En navegador, abrir DevTools → Console
const userData = JSON.parse(localStorage.getItem('bos_user'))
console.log('userData:', userData)
// Esperado: 
// {
//   id: "uuid...",
//   email: "test_user_...@example.com",
//   company: "Test Company Inc",
//   sector: "Consultoría"
// }
```

**Criterios de éxito:**
- [ ] Login exitoso sin errores
- [ ] Dashboard cargó completamente
- [ ] localStorage contiene userData con company correcto
- [ ] Información del negocio visible en UI

---

### TEST 3: CheckSession al recargar

**Objetivo:** Confirmar que checkSession() recupera config incluso con RLS

```bash
# 1. Usuario debe estar logged in (de TEST 2)
# 2. Recargar página: F5 o Ctrl+R
# 3. Esperar a que app cargue

# 4. Esperado:
#    - Usuario sigue logged in (no se desloguea)
#    - Dashboard está disponible
#    - userData en localStorage es correcto
#    - Sin errores en console
```

**Verificación:**
```javascript
// En console después de recargar
const auth = document.querySelector('[data-auth]')?.textContent
console.log('User still authenticated:', !!auth)
```

**Criterios de éxito:**
- [ ] Página recargó sin logout
- [ ] userData persiste correctamente
- [ ] Dashboard sigue accesible
- [ ] Sin errores de SELECT en business_config

---

### TEST 4: Aislamiento de datos (verificación manual)

**Objetivo:** Confirmar que RLS efectivamente aísla datos por usuario

**En Supabase Dashboard SQL Editor:**

```sql
-- 1. Como admin: ver todos los registros
SELECT user_id, business_name FROM business_config;
-- Esperado: múltiples registros de diferentes usuarios (admin puede ver todos)

-- 2. Como usuario autenticado: ver solo el propio
-- (Esto simula cuando el cliente auténtico hace SELECT)
-- En navegador console:
const { data } = await window.supabaseClient
  .from('business_config')
  .select('*')
  
console.log('Records visible to authenticated user:', data)
-- Esperado: solo 1 registro (el del usuario autenticado)

-- 3. Intentar acceder como usuario diferente
-- (En navegador, cambiar sesión a otro usuario y repetir select)
-- Esperado: solo ve su propio registro, no el del otro usuario
```

**Criterios de éxito:**
- [ ] Admin ve todos los registros
- [ ] Usuario autenticado ve solo su propio registro
- [ ] Cambiar de usuario = cambiar registros visibles
- [ ] SELECT sin autenticación retorna vacío

---

### TEST 5: CRUD en calendarios (smoke test)

**Objetivo:** Confirmar que cambios en RLS no rompieron módulos existentes

```bash
# 1. Dashboard → Turnos
# 2. Crear un profesional:
#    - Nombre: Dr. Test
#    - Especialidad: Medicina
#    - Horario: 09:00-18:00

# 3. Crear un servicio:
#    - Nombre: Consulta
#    - Duración: 30 min
#    - Precio: $500

# 4. Crear un turno:
#    - Profesional: Dr. Test
#    - Servicio: Consulta
#    - Fecha: próximo día laboral, 10:00

# 5. Esperado:
#    - Todos los CRUDs funcionan sin errores
#    - Datos persisten en Supabase
#    - Sin errores relacionados a business_config
#    - Sin errores en console
```

**Criterios de éxito:**
- [ ] Profesional creado ✅
- [ ] Servicio creado ✅
- [ ] Turno creado ✅
- [ ] Dashboard cargó datos correctamente
- [ ] Sin errores en network tab (ver problemas de query)

---

## 🔍 TROUBLESHOOTING

### Error: "new row violates row level security policy"

**Causa:** Una operación intenta insertar sin autenticación válida

**Solución:**
1. Verificar que el cliente utilizado tiene sesión autenticada
2. En /api/register: Asegurarse que `supabaseAdmin` se usa para INSERT (admin bypasa RLS)
3. Verificar que SUPABASE_SERVICE_ROLE_KEY está definido en .env.local

### Error: "SELECT returned no rows"

**Causa:** Probable que RLS esté bloqueando la query

**Solución:**
1. Verificar que auth.uid() coincide con user_id
2. Verificar que el usuario tiene sesión válida
3. Consultar logs de Supabase para ver qué sucede

### Usuario no puede registrarse

**Causa:** INSERT en business_config falla aunque usa admin client

**Solución:**
1. Verificar que SUPABASE_SERVICE_ROLE_KEY es válido (ir a Supabase Dashboard → Settings → API → Service Role Secret)
2. Verificar que la variable está en .env.local y en Vercel Environment Variables
3. Revisar logs del servidor para ver error exacto de INSERT

---

## ✅ VALIDACIÓN COMPLETADA

Una vez que todos los tests pasen:

- [ ] TEST 1: Registro de nuevo usuario ✅
- [ ] TEST 2: Login obtiene config ✅
- [ ] TEST 3: CheckSession funciona ✅
- [ ] TEST 4: Aislamiento confirmado ✅
- [ ] TEST 5: Módulos existentes OK ✅

**Conclusión:** RLS habilitado en business_config, sistema operacional, datos aislados por usuario.

---

## 📊 RESUMEN DE CAMBIOS

| Aspecto | Antes | Después |
|--------|-------|---------|
| RLS en business_config | ❌ Deshabilitado | ✅ Habilitado |
| Acceso sin auth | ✅ Cualquiera puede leer | ❌ Bloqueado |
| Lectura de config | Via ANON_KEY (filtro en cliente) | Via ANON_KEY (filtro en BD) |
| Creación de config | Via ANON_KEY (sin RLS) | Via ADMIN_KEY (admin client bypasa) |
| Seguridad | ⚠️ Media (confía en cliente) | ✅ Alta (BD enforce) |

---

## 🔗 REFERENCIAS

- Código: `/app/api/register/route.ts` (líneas 17-27, 32, 67)
- SQL: `/docs/enable-rls-business-config.sql`
- Documento: Este archivo

**Última actualización:** 2026-06-10
