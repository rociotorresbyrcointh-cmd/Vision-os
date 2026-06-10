# 🔍 DIAGNÓSTICO PRECISO: Error "supabaseKey is required"

## Ubicación exacta del problema

```
Archivo:    app/api/register/route.ts
Línea:      26
Comando:    process.env.SUPABASE_SERVICE_ROLE_KEY!
Status:     ❌ UNDEFINED en Vercel
```

---

## Error Trace

```
POST /api/register
  ↓
Línea 24: const supabaseAdmin = createClient(...)
  ↓
Línea 26: process.env.SUPABASE_SERVICE_ROLE_KEY  ← undefined
  ↓
createClient(url, undefined)
  ↓
createClient() validates: if (!key) throw Error
  ↓
❌ "supabaseKey is required"
  ↓
CATCH block (línea 123)
  ↓
Return: { error: 'Error en el servidor' }
```

---

## Verificación de Variables de Entorno

### En local (.env.local):
```
✅ NEXT_PUBLIC_SUPABASE_URL           → presente
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY      → presente
❌ SUPABASE_SERVICE_ROLE_KEY          → FALTA
```

### En Vercel Environment Variables:
```
✅ NEXT_PUBLIC_SUPABASE_URL           → probablemente presente
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY      → probablemente presente
❌ SUPABASE_SERVICE_ROLE_KEY          → DEFINITIVAMENTE FALTA
   └─ Causa: Nunca se agregó
```

---

## Qué se necesita hacer

### 1. Obtener el valor

**Ir a:** https://supabase.com → [Tu proyecto] → Settings → API

**Encontrar:** "Service Role Secret"

**Copiar:** El valor que comienza con `sk_`

```
Ejemplo (ficticio):
sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJl...
```

### 2. Configurar en Vercel

**Ir a:** https://vercel.com/[tu-proyecto]/settings/environment-variables

**Crear:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `[Pega el valor de Supabase aquí]`
- Uncheck: "Expose to Client" (DEBE estar OFF)

**Click:** "Save"

### 3. Esperar deployment automático

Vercel automáticamente:
1. Detecta nueva variable
2. Inicia nuevo build
3. Realiza nuevo deployment
4. **Tiempo:** 2-5 minutos

---

## Cómo verificar que se configuró

### Check 1: Variable existe en Vercel
```
Vercel Settings → Environment Variables
Buscar: SUPABASE_SERVICE_ROLE_KEY
Estado: ✅ Debe existir con valor
```

### Check 2: Build completó sin errores
```
Vercel Deployments → Latest deployment
Build Logs: ✅ Debe decir "Build successful"
```

### Check 3: Test endpoint en producción
```
1. Ir a https://[tu-app]/register
2. Llenar formulario y enviar
3. Esperar respuesta
```

### Check 4: Revisar logs
```
Vercel → Deployments → Latest → Function Logs
Buscar: === SIGNUP RESPONSE DEBUG ===

Si ves esto: ✅ Variable está disponible
Si no ves esto: ❌ Algo sigue mal
```

---

## Diferencia entre tipos de variables

| Variable | Tipo | Visible en cliente | Necesaria en servidor |
|----------|------|-------|-------|
| `NEXT_PUBLIC_*` | Pública | SÍ (seguro) | SÍ |
| `*` (sin NEXT_PUBLIC_) | Privada | NO | SÍ (solo servidor) |
| `SUPABASE_SERVICE_ROLE_KEY` | Privada | ❌ NUNCA | ✅ Sí (/api/register) |

**Por qué SUPABASE_SERVICE_ROLE_KEY es privada:**
- Contiene credenciales de admin
- Si se expone al cliente, cualquiera puede usar como admin
- DEBE estar SOLO en servidor (Vercel backend)

---

## Timeline de lo que sucede

### Antes de agregar SUPABASE_SERVICE_ROLE_KEY:
```
User POST /api/register
  ↓
Server intenta: createClient(url, undefined)
  ↓
❌ "supabaseKey is required"
  ↓
User ve: "Error en el servidor"
  ↓
Usuario NO se crea en Supabase
```

### Después de agregar SUPABASE_SERVICE_ROLE_KEY:
```
User POST /api/register
  ↓
Server intenta: createClient(url, "sk_...")
  ↓
✅ supabaseAdmin cliente creado correctamente
  ↓
supabasePublic.auth.signUp() ejecuta
  ↓
Si signUp éxito: user creado en auth.users
Si signUp fallo: error específico en logs
```

---

## Sin cambios de código necesarios

**Importante:** El código está correcto. Solo falta la variable de entorno.

```
❌ No necesita: Cambiar línea 26
❌ No necesita: Renombrar variable
❌ No necesita: Nuevo commit
✅ Solo necesita: Agregar variable en Vercel
```

---

## Resumen

| Aspecto | Hallazgo |
|--------|----------|
| **Código** | ✅ Correcto (lee SUPABASE_SERVICE_ROLE_KEY en línea 26) |
| **Nombre variable** | ✅ Correcto (SUPABASE_SERVICE_ROLE_KEY) |
| **Tipo variable** | ✅ Correcto (privada, no pública) |
| **En Vercel** | ❌ FALTA configurar |
| **En local** | ❌ FALTA en .env.local (normal para dev) |
| **Acción requerida** | Agregar en Vercel Environment Variables |
| **Redeploy manual** | ❌ No, Vercel lo hace automáticamente |

---

**Diagnóstico completado:** Identificada causa exacta del error  
**Acción necesaria:** Agregar SUPABASE_SERVICE_ROLE_KEY en Vercel  
**Complejidad:** Muy simple (agregar 1 variable)
