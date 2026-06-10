# 🔐 AUDITORÍA FINAL: RLS en business_config

**Fecha:** 2026-06-10  
**Estado:** Registro y login validados, sistema funcionando  
**Próximo paso:** Habilitar RLS en business_config

---

## 1️⃣ ESTADO ACTUAL DE RLS

### RLS Status: ❌ DESHABILITADO

**Verificado anteriormente:**
```
Supabase Dashboard → business_config table → Row Level Security
Status: OFF (rojo)
Warning: "This table can be accessed by anyone via the Data API as RLS is disabled"
```

**Registros actuales en table:**
```
✅ 2+ registros de diferentes usuarios
✅ Accesibles sin autenticación
✅ Datos de negocio expuestos
```

---

## 2️⃣ POLÍTICAS ACTUALES

### Existentes (pero NO APLICADAS porque RLS está deshabilitado):

```
1. "Users can delete own config" 
   - Type: DELETE
   - Policy: [to public] (ver abajo)
   
2. "Users can insert own config"
   - Type: INSERT
   - Policy: [to public]
   
3. "Users can update own config"
   - Type: UPDATE
   - Policy: [to public]
   
4. "Users can view own config"
   - Type: SELECT
   - Policy: [to public]
```

**IMPORTANTE:** Estas políticas dicen "to public" sin filtro de user_id.  
Esto significa: incluso con RLS habilitado, serían inefectivas.

**Necesitan ser REEMPLAZADAS** con versiones que usen `auth.uid()`.

---

## 3️⃣ SQL EXACTO A EJECUTAR

### PASO 1: Habilitar RLS

```sql
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
```

### PASO 2: Eliminar políticas antiguas

```sql
DROP POLICY IF EXISTS "Users can delete own config" ON business_config;
DROP POLICY IF EXISTS "Users can insert own config" ON business_config;
DROP POLICY IF EXISTS "Users can update own config" ON business_config;
DROP POLICY IF EXISTS "Users can view own config" ON business_config;
```

### PASO 3: Crear nuevas políticas

```sql
-- SELECT: Usuario solo ve su propia config
CREATE POLICY "Users can view own config" ON business_config
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Usuario solo inserta su propia config (durante registro)
CREATE POLICY "Users can insert own config" ON business_config
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuario solo actualiza su propia config
CREATE POLICY "Users can update own config" ON business_config
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuario solo borra su propia config
CREATE POLICY "Users can delete own config" ON business_config
  FOR DELETE
  USING (auth.uid() = user_id);
```

### PASO 4: Verificar estado

```sql
-- Verificar RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'business_config';
-- Esperado: rowsecurity = true

-- Listar políticas
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'business_config' 
ORDER BY policyname;
-- Esperado: 4 filas (view, insert, update, delete)
```

---

## 4️⃣ IMPACTO SOBRE OPERACIONES

### A. LOGIN

**Flujo actual:**
```
lib/auth.tsx línea 52:
const { data: config } = await supabase
  .from('business_config')
  .select('*')
  .eq('user_id', data.user.id)
  .single()
```

**Con RLS:**
- ✅ Usuario autenticado en sesión
- ✅ `auth.uid()` = `data.user.id`
- ✅ Policy SELECT: `auth.uid() = user_id` → PERMITE
- ✅ Usuario ve su propio config
- ✅ **IMPACTO: NINGUNO - Funciona igual**

**Test:**
```
1. Ir a /login
2. Ingresar email y password
3. Esperado: ✅ Dashboard carga, empresa visible
```

---

### B. REGISTRO

**Flujo actual:**
```
app/api/register/route.ts línea 87:
const { error: configError } = await supabaseAdmin
  .from('business_config')
  .insert({
    user_id: authData.user!.id,
    business_name: company,
    sector: sector || 'Otro',
  })
```

**Con RLS:**
- ✅ Usa `supabaseAdmin` (SERVICE_ROLE_KEY)
- ✅ SERVICE_ROLE_KEY **bypasa RLS completamente**
- ✅ INSERT permitido aunque auth.uid() sea diferente
- ✅ **IMPACTO: NINGUNO - No se ve afectado**

**Test:**
```
1. Ir a /register
2. Crear usuario nuevo
3. Esperado: ✅ Usuario aparece en auth.users
4. Verificar: ✅ business_config tiene su fila
```

---

### C. DASHBOARD

**Flujo actual:**
```
app/dashboard/turnos/page.tsx línea 143:
const [professionals, services, appointments, businessConfig] = await Promise.all([
  getProfessionals(user.id),      ← appointments table (RLS ENABLED)
  getServices(user.id),            ← services table (RLS ENABLED)
  getAppointments(user.id),        ← professionals table (RLS ENABLED)
  getBusinessConfig(user.id),      ← business_config table (RLS será ENABLED)
])
```

**Con RLS en business_config:**
- ✅ Todas las queries filtran por `user.id` en cliente
- ✅ RLS validará en servidor: `auth.uid() = user_id`
- ✅ Usuario solo ve sus propios datos
- ✅ **IMPACTO: NINGUNO - Funciona igual, pero SEGURO**

**Test:**
```
1. Login en dashboard
2. Ir a Turnos
3. Esperado: ✅ Carga calendarios, profesionales, servicios
4. Crear turno
5. Esperado: ✅ Funciona normalmente
```

---

### D. CALENDARIOS

**Flujo actual:**
```
lib/supabase-operations.ts:
- getProfessionals(userId) → filtra por user_id
- getServices(userId) → filtra por user_id
- getAppointments(userId) → filtra por user_id
```

**Con RLS en business_config:**
- ✅ business_config tiene RLS
- ✅ Pero calendarios no dependen de business_config directamente
- ✅ Calendarios solo leen: professionals, services, appointments
- ✅ Esas tablas ya tienen RLS habilitado (verificado)
- ✅ **IMPACTO: NINGUNO - No cambia nada**

**Test:**
```
1. Dashboard → Turnos
2. Todas las operaciones deben funcionar igual
3. Crear/editar/borrar turnos
4. Esperado: ✅ Sin cambios en comportamiento
```

---

## 5️⃣ CHECKLIST DE VALIDACIÓN POST-RLS

### ANTES de habilitar RLS

- [ ] Backup de business_config table
- [ ] Contar registros actuales: `SELECT COUNT(*) FROM business_config;`
- [ ] Documentar current user_ids: `SELECT DISTINCT user_id FROM business_config;`

### Ejecutar SQL

- [ ] PASO 1: `ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;`
- [ ] PASO 2: DROP todas las políticas antiguas
- [ ] PASO 3: CREATE todas las 4 nuevas políticas
- [ ] PASO 4: Ejecutar queries de verificación

### TEST 1: Login (30 segundos)

- [ ] Ir a /login
- [ ] Ingresar credenciales de usuario existente
- [ ] Dashboard carga sin errores
- [ ] Empresa visible en UI
- [ ] Revisar console: Sin errores de RLS

**Esperado:**
```
✅ HTTP 200 en SELECT business_config
✅ userData tiene company y sector
✅ No hay "row level security policy" errors
```

### TEST 2: Registro (30 segundos)

- [ ] Ir a /register
- [ ] Crear usuario nuevo
- [ ] Email enviado (asumir éxito)
- [ ] Usuario aparece en Supabase auth.users
- [ ] business_config tiene nueva fila
- [ ] Verificar que el INSERT funcionó

**Esperado:**
```
✅ HTTP 200 en response
✅ Usuario en auth.users
✅ business_config tiene su fila
✅ No hay "row level security policy" errors en logs
```

### TEST 3: Dashboard (1 minuto)

- [ ] Login con usuario existente
- [ ] Dashboard carga
- [ ] Ir a Turnos
- [ ] Ver profesionales: ✅
- [ ] Ver servicios: ✅
- [ ] Ver turnos: ✅
- [ ] Crear nuevo turno: ✅
- [ ] Editar turno: ✅
- [ ] Borrar turno: ✅
- [ ] Revisar console: Sin errores

**Esperado:**
```
✅ Todas las operaciones funcionan
✅ Sin cambios en comportamiento vs antes
✅ Sin errores en network tab
```

### TEST 4: Aislamiento de datos (2 minutos)

**En Supabase Dashboard SQL Editor:**

```sql
-- Como admin: ver todos los registros
SELECT count(*) FROM business_config;
-- Esperado: n registros

-- Buscar config de usuario específico
SELECT * FROM business_config 
WHERE user_id = '[uuid de test usuario]';
-- Esperado: solo su config, no otros

-- Intentar acceso como anon (sin auth)
-- (En navegador console como usuario normal, no admin):
const { data } = await supabaseClient
  .from('business_config')
  .select('*')

console.log('Records visible:', data?.length)
-- Esperado: 1 (solo su propio registro)
```

### TEST 5: Cambiar usuario (2 minutos)

- [ ] Login como Usuario A
- [ ] Ver business_config de Usuario A
- [ ] Logout
- [ ] Login como Usuario B
- [ ] Ver business_config de Usuario B
- [ ] Verificar: Usuario B NO ve config de Usuario A

**Verificación en browser console:**
```javascript
// Después de login como Usuario B:
const { data } = await supabaseClient
  .from('business_config')
  .select('*')

console.log('Mi config:', data)
// Esperado: 1 registro, con business_name de Usuario B
```

---

## 6️⃣ PLAN DE ROLLBACK

**Si algo falla después de habilitar RLS:**

### Opción A: Deshabilitar RLS (más rápido)

```sql
ALTER TABLE business_config DISABLE ROW LEVEL SECURITY;
```

**Tiempo:** <1 segundo  
**Efecto:** Todas las operaciones vuelven a funcionamiento anterior  
**Riesgo:** Bajo - vuelve a estado anterior

### Opción B: Revertir a políticas antiguas

```sql
-- Si quieres mantener RLS pero con políticas menos restrictivas
DROP POLICY "Users can view own config" ON business_config;
DROP POLICY "Users can insert own config" ON business_config;
DROP POLICY "Users can update own config" ON business_config;
DROP POLICY "Users can delete own config" ON business_config;

-- Crear políticas permisivas (temporal):
CREATE POLICY "Temporary permissive SELECT" ON business_config
  FOR SELECT
  USING (true);  -- Permitir a todos temporalmente
```

### Opción C: Restaurar de backup (si hay corrupción de datos)

```
1. Ir a Supabase Dashboard → Backups
2. Restaurar a versión anterior a cambios de RLS
3. Esperar restauración (5-30 minutos)
4. Investigar problema específico
```

### Decision tree:

```
¿Qué falló?

Si: Login no funciona
  └─ Ejecutar: ALTER TABLE business_config DISABLE ROW LEVEL SECURITY;
  └─ Revisar: ¿Policy SELECT correcta?

Si: Registro no funciona
  └─ Revisar: ¿SERVICE_ROLE_KEY disponible?
  └─ Ejecutar: ALTER TABLE business_config DISABLE ROW LEVEL SECURITY;

Si: Dashboard no carga
  └─ Ejecutar: ALTER TABLE business_config DISABLE ROW LEVEL SECURITY;
  └─ Revisar: ¿business_config es realmente crítico?

Si: Usuario ve datos de otros
  └─ Problema: Policy no está correcta
  └─ Revisar: ¿auth.uid() = user_id está en SELECT USING?
```

---

## 📋 CHECKLIST FINAL ANTES DE EJECUTAR

- [ ] Todos los tests previos pasan (login, registro, dashboard)
- [ ] SERVICE_ROLE_KEY disponible en Vercel
- [ ] He entendido el impacto (sin cambios de comportamiento)
- [ ] Tengo SQL listo en archivo
- [ ] Tengo checklist de validación por hacer
- [ ] Tengo plan de rollback si falla
- [ ] Punto de restauración (backup mental): RLS deshabilitado
- [ ] He comunicado al equipo (si aplica): SE VA A HABILITAR RLS

---

## 🎯 RESUMEN

| Aspecto | Estado | Impacto |
|--------|--------|--------|
| **RLS actual** | ❌ Deshabilitado | Datos expuestos |
| **Login** | ✅ Funciona | ✅ Seguirá igual |
| **Registro** | ✅ Funciona | ✅ Seguirá igual (usa admin) |
| **Dashboard** | ✅ Funciona | ✅ Seguirá igual (RLS oculta solo) |
| **Calendarios** | ✅ Funciona | ✅ No se ven afectados |
| **Seguridad** | ⚠️ Baja | ✅ Mejorará significativamente |
| **Riesgo** | 🟢 Bajo | Si falla: disable RLS (1 SQL) |

---

**Auditoría completada:** 2026-06-10  
**Recomendación:** ✅ SEGURO PROCEDER A HABILITAR RLS  
**Próximo paso:** Usuario confirma y ejecuta SQL
