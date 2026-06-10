# 🔴 AUDITORÍA: SUPABASE_SERVICE_ROLE_KEY Missing

**Error reportado en Vercel logs:**
```
❌ Register API error: Error: supabaseKey is required
```

**Causa raíz:** `process.env.SUPABASE_SERVICE_ROLE_KEY` es `undefined`

---

## 📍 DÓNDE SE USA

### Ubicación: `app/api/register/route.ts`

**Línea 24-27:**
```typescript
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Línea 26: UNDEFINED ❌
)
```

**Qué sucede cuando es undefined:**
1. `process.env.SUPABASE_SERVICE_ROLE_KEY` = `undefined`
2. Se pasa `undefined` a `createClient(url, undefined)`
3. createClient() valida: `if (!key) throw new Error("supabaseKey is required")`
4. Error en tiempo de ejecución (runtime)

---

## 🔍 ANÁLISIS DE VARIABLES DE ENTORNO

| Variable | Línea | Tipo | Local | Vercel | Estado |
|----------|-------|------|-------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | 4 | Pública | ✅ | ✅ | Funciona |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 20 | Pública | ✅ | ✅ | Funciona |
| `SUPABASE_SERVICE_ROLE_KEY` | **26** | **Privada** | ❌ | ❌ | **FALTA** |

---

## ❌ ESTADO ACTUAL

### .env.local (local development)

```
NEXT_PUBLIC_SUPABASE_URL=https://sinjhkjlsgyajjiixpcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_CQd7iPZQGvBc6vC...
[MISSING] SUPABASE_SERVICE_ROLE_KEY
```

### Vercel Environment Variables (production)

```
Probablemente también falta, porque el error ocurre en producción
```

---

## ✅ SOLUCIÓN REQUERIDA

### PASO 1: Obtener SUPABASE_SERVICE_ROLE_KEY

**Ir a:** Supabase Dashboard → Project Settings → API

**Copiar:** "Service Role Secret" (comienza con `sk_`)

Ejemplo de valor:
```
sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### PASO 2: Agregar a Vercel Environment Variables

**Ir a:** https://vercel.com → [Proyecto] → Settings → Environment Variables

**Crear nueva variable:**
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: [Pega el Service Role Secret aquí]
```

**IMPORTANTE:**
- [ ] **Uncheck** "Expose to Client" (debe estar OFF)
- [ ] Variable debe estar disponible en: Production, Preview, Development

### PASO 3: Guardar y Esperar Redeploy

**Lo que sucede automáticamente:**
1. Click "Save"
2. Vercel detecta nuevo env var
3. Automáticamente inicia nuevo deployment
4. Esperar a que status sea "Ready" (verde)

**Tiempo típico:** 2-5 minutos

---

## 🔧 CÓMO VERIFICAR QUE SE CONFIGURÓ CORRECTAMENTE

### Verificación 1: En Vercel Dashboard

**Paso A:** Ir a Settings → Environment Variables

**Paso B:** Buscar `SUPABASE_SERVICE_ROLE_KEY`

```
✅ Variable existe
✅ Valor no está vacío (mostrado como ****)
✅ Exposed to Client = OFF (no debe estar chequeado)
✅ Production = ON
✅ Preview = ON
✅ Development = ON
```

### Verificación 2: En Logs de Build

**Paso A:** Ir a Deployments → Latest Deploy

**Paso B:** Click en "Build Logs"

**Paso C:** Buscar cualquier mención de "SERVICE_ROLE"

```
Debería NO aparecer mensaje de "undefined"
Debería compilar sin errores
```

### Verificación 3: En Function Logs (Runtime)

**Paso A:** Luego de nuevo deployment, reproducir registro

**Paso B:** Ir a Deployments → Latest → Function Logs

**Paso C:** Buscar salida de logs:

```
✅ SI VES ESTO:
=== SIGNUP RESPONSE DEBUG ===
authError exists: [true/false]
authError: [error object or null]
authData.user?.id: [uuid or undefined]

❌ SI VES ESTO:
❌ Register API error: Error: supabaseKey is required
```

---

## ⚠️ REDEPLOY MANUAL (si es necesario)

**Situación:** Agregaste SUPABASE_SERVICE_ROLE_KEY pero el endpoint aún falla

**Pasos para forzar redeploy:**

1. Vercel Dashboard → Deployments
2. Click en "..." (tres puntos) del último deployment
3. Click "Redeploy"
4. Confirmar "Redeploy latest commit"
5. Esperar a que status sea "Ready"

**Nota:** Usualmente Vercel redeploya automáticamente al agregar env vars.  
Solo hacer manual si persiste el problema.

---

## 📋 CHECKLIST: Resolver el problema

- [ ] PASO 1: Copiar Service Role Secret de Supabase Dashboard
- [ ] PASO 2: Agregar SUPABASE_SERVICE_ROLE_KEY en Vercel
- [ ] Uncheck "Expose to Client"
- [ ] PASO 3: Click "Save"
- [ ] Esperar a que nuevo deployment complete (status = Ready)

### Después de esperar:

- [ ] Verificación 1: Variable existe en Vercel Settings
- [ ] Verificación 2: Build logs no tienen errores
- [ ] Verificación 3: Reproducir registro test
- [ ] Verificación 4: Revisar Function Logs
- [ ] Búsqueda en logs: `=== SIGNUP RESPONSE DEBUG ===` debe aparecer
- [ ] Usuario debe aparecer en Supabase auth.users

---

## 🔗 REFERENCIA DE CÓDIGO

**Archivo:** `app/api/register/route.ts`

**Línea 24-27 (PROBLEMA):**
```typescript
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Lee esta variable
)
```

**Error que ocurre cuando es undefined:**
```
❌ Register API error: Error: supabaseKey is required
```

**Solución:**
Asegurar que `process.env.SUPABASE_SERVICE_ROLE_KEY` tenga un valor válido en Vercel.

---

## 📊 FLUJO CORRECTO vs INCORRECTO

### INCORRECTO (actual):
```
Vercel Environment Variables:
  ✅ NEXT_PUBLIC_SUPABASE_URL
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ❌ SUPABASE_SERVICE_ROLE_KEY [MISSING]
  
Código intenta:
  createClient(url, undefined)  ← ERROR
  
Resultado:
  "supabaseKey is required"
```

### CORRECTO (después de fix):
```
Vercel Environment Variables:
  ✅ NEXT_PUBLIC_SUPABASE_URL
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✅ SUPABASE_SERVICE_ROLE_KEY [PRESENT]
  
Código ejecuta:
  createClient(url, "sk_...")  ← SUCCESS
  
Resultado:
  supabaseAdmin cliente creado
  Continúa ejecución
  Usuario se crea en auth.users
```

---

## 🎯 PRÓXIMOS PASOS

**Usuario debe:**
1. Seguir PASO 1-3 del "SOLUCIÓN REQUERIDA"
2. Esperar deployment (2-5 min)
3. Reproducir test de registro
4. Revisar Function Logs

**Yo estaré listo para:**
5. Analizar logs nuevos
6. Confirmar si problema se resolvió
7. Diagnosticar cualquier otro error

---

**Auditoría completada:** 2026-06-10  
**Severidad:** 🔴 CRÍTICA  
**Bloqueador:** Sí, sin esta variable el endpoint no funciona
