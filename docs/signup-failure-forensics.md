# 🔴 AUDITORÍA FORENSE: Signup Failure Diagnosis

**Problema reportado:**
- UI muestra: "Te hemos enviado un email de confirmación"
- Realidad: Usuario NO aparece en Supabase auth.users
- Email provider: Funciona (otros emails se envían)
- Conclusión: auth.signUp() está fallando pero endpoint devuelve éxito

---

## 🎯 HALLAZGOS CRÍTICOS

### HALLAZGO 1: Lógica de validación defectuosa (Línea 57)

**ANTES (problema):**
```typescript
if (authError && !userCreated) {
  // Return error
}
// Pero si authError existe Y userCreated existe, sigue adelante ❌
```

**DESPUÉS (corregido):**
```typescript
if (authError) {
  // Abortar inmediatamente ✅
  return error
}
```

**Impacto:** 
- Si `auth.signUp()` devuelve `error: "something"` pero `user: { id: "uuid" }` simultáneamente
- La lógica anterior dejaba pasar la ejecución
- Endpoint devolvía HTTP 200 con `success: true`
- Usuario NUNCA se creaba en la BD

---

### HALLAZGO 2: Sin logs de diagnóstico (Líneas 41-51)

**ANTES:**
```typescript
const { data: authData, error: authError } = await supabasePublic.auth.signUp({...})
// Sin logs - qué devolvió signUp()?
```

**DESPUÉS:**
```typescript
const { data: authData, error: authError } = await supabasePublic.auth.signUp({...})

// Logs detallados:
console.log('authError exists:', !!authError)
console.log('authError:', authError ? JSON.stringify(authError, null, 2) : 'null')
console.log('authData.user?.id:', authData?.user?.id || 'undefined')
console.log('authData.session:', authData?.session ? 'present' : 'null')
```

**Impacto:** Ahora podemos ver EXACTAMENTE qué devolvió signUp()

---

### HALLAZGO 3: Respuesta exitosa enmascaraba error (Línea 86-92)

**ANTES:**
```typescript
return NextResponse.json({
  success: true,
  user: {
    id: authData.user!.id,
    email: authData.user!.email,
  },
}, { status: 200 })  // ← HTTP 200 incluso si authError existe ❌
```

**Impacto:** Cliente interpreta como éxito y muestra "Email enviado"

---

## 📊 RESPUESTAS HTTP ACTUALES

| Escenario | HTTP Status | Response Body | User creado? |
|-----------|------------|----------------|------------|
| ✅ Éxito completo | 200 | `{ success: true, user: {...} }` | Sí |
| ❌ signUp() error | ~~200~~ **400** | `{ error: "...", code: "..." }` | No |
| ❌ Sin email | 400 | `{ error: "Email... requerido" }` | No |
| ❌ CATCH block | 500 | `{ error: "Error en el servidor" }` | No |

---

## 🔧 LOGS AGREGADOS PARA DIAGNOSIS

### Logs de signUp() Response

```
=== SIGNUP RESPONSE DEBUG ===
authError exists: [true/false]
authError: [null or error object]
authData exists: [true/false]
authData.user exists: [true/false]
authData.user?.id: [uuid or undefined]
authData.user?.email: [email or undefined]
authData.user?.email_confirmed_at: [timestamp or undefined]
authData.session: [present or null]
=== END DEBUG ===
```

**Dónde buscarlo:** Vercel Dashboard → Deployments → Function Logs

---

### Logs de business_config INSERT

```
=== CONFIG INSERT RESPONSE ===
configError exists: [true/false]
❌ Config error: [error object if exists]
✅ Config saved successfully
   Data returned: [inserted record if success]
=== END CONFIG DEBUG ===
```

---

### Logs de FINAL RESPONSE

```
=== FINAL RESPONSE ===
Returning HTTP 200: { success: true, user: {...} }
=== END RESPONSE ===
```

---

### Logs de CATCH Block

```
❌ CATCH: Unhandled error in /api/register
   Error type: [constructor name]
   Error message: [descriptive message]
   Full error: [JSON error object]
   Stack: [full stack trace]
```

---

## 📋 CÓMO DIAGNOSTICAR AHORA

### PASO 1: Replicar el problema

1. Ir a https://[tu-app]/register
2. Llenar formulario con:
   - Email: `test_forensic_$(date +%s)@example.com`
   - Password: `TestPass123!`
   - Empresa: `Test Corp`
3. Click "Registrarse"
4. Observar si UI muestra "Email enviado"

### PASO 2: Revisar Logs en Vercel

1. Ir a https://vercel.com → [Proyecto] → Deployments
2. Click en último deployment
3. Click en **Function Logs** (o **Runtime Logs**)
4. Buscar la salida de logs:

**Esperado si falla signUp():**
```
=== SIGNUP RESPONSE DEBUG ===
authError exists: true
authError: {
  "message": "[REAL ERROR MESSAGE]",
  "code": "[ERROR CODE]",
  "status": [HTTP STATUS]
}
authData.user exists: false
authData.user?.id: undefined
=== END DEBUG ===

❌ Auth error (aborting): [ERROR MESSAGE]
   Code: [ERROR CODE]
   Status: [HTTP STATUS]
```

### PASO 3: Verificar respuesta HTTP

En navegador (DevTools → Network):

**Si endpoint funciona pero signup falla:**
```
POST /api/register
Status: 400
Response: { 
  "error": "[Exact error from signUp()]",
  "code": "[Error code]",
  "status": [Status number]
}
```

---

## 🎯 PROBLEMAS COMUNES Y SOLUCIONES

### Error 1: "Confirmation email link was invalid"

```
Causa: signUp() devolvió error de tipo confirmación
Síntoma en logs: authError.code = "invalid_confirmation_link"
Solución: Revisar NEXT_PUBLIC_APP_URL en Vercel env vars
```

### Error 2: "User already registered"

```
Causa: Email ya existe en Supabase
Síntoma en logs: authError.code = "user_already_exists"
Solución: Usar email diferente para test
```

### Error 3: "Authentication error"

```
Causa: Problema con Supabase auth service
Síntoma en logs: authError.message contiene "Authentication"
Solución: Verificar estado de Supabase (status page)
```

### Error 4: "SUPABASE_SERVICE_ROLE_KEY is undefined"

```
Causa: Variable no configurada en Vercel
Síntoma en logs: error en línea 26 al crear supabaseAdmin
Solución: Agregar SUPABASE_SERVICE_ROLE_KEY en Vercel Environment Variables
```

---

## ✅ VERIFICACIÓN DE CORRECCIÓN

**Antes de considerar resuelto:**

- [ ] Auth.signUp() devuelve éxito (error = null)
- [ ] authData.user?.id existe
- [ ] Usuario aparece en Supabase auth.users
- [ ] Email de confirmación se recibe
- [ ] Endpoint devuelve HTTP 200
- [ ] Response tiene `success: true`

---

## 📌 ARCHIVO MODIFICADO

**Commit:** `12dfa2f`  
**Archivo:** `app/api/register/route.ts`  
**Cambios:** 61 líneas agregadas, 22 eliminadas

**Líneas clave modificadas:**
- 41-51: DEBUG logs
- 57: Cambio de condición `(authError && !userCreated)` → `(authError)`
- 87-95: CONFIG logs
- 123-137: CATCH logs

---

## 🔗 REFERENCIAS

- [Supabase Auth Error Reference](https://supabase.com/docs/reference/javascript/auth-signup)
- Commit: `12dfa2f` (debug: add comprehensive logging)
- Archivo: `app/api/register/route.ts`

---

**Documento creado:** 2026-06-10  
**Urgencia:** CRÍTICA - Usuario no puede registrarse  
**Próximo paso:** Ejecutar registro test y revisar logs en Vercel
