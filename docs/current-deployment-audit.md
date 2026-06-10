# 🔍 AUDITORÍA DE DEPLOYMENT: Código vs Vercel

**Problema:** Variable `SUPABASE_SERVICE_ROLE_KEY` existe en Vercel pero endpoint sigue fallando con "supabaseKey is required"

**Hipótesis:** El deployment de Vercel podría no tener el código que lee esa variable

---

## 1️⃣ VARIABLE QUE EL CÓDIGO LEE ACTUALMENTE

**Archivo:** `app/api/register/route.ts`

**Línea 26 (exacta):**
```typescript
process.env.SUPABASE_SERVICE_ROLE_KEY!
```

**Nombre exacto esperado por el código:** `SUPABASE_SERVICE_ROLE_KEY`

---

## 2️⃣ UBICACIÓN EXACTA EN EL CÓDIGO

**Líneas 24-27 de app/api/register/route.ts:**
```typescript
// Cliente 2: Supabase admin para business_config (RLS bypassed)
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Línea exacta donde se crea supabaseAdmin:** Línea 24

**Línea donde se lee la variable:** Línea 26

---

## 3️⃣ COMMITS QUE CONTIENEN ESTE CÓDIGO

### Commit que introduce supabaseAdmin:

```
b3f4a3e - feat: use separate Supabase clients in /api/register for RLS security
├─ Introduce: supabasePublic (ANON_KEY)
├─ Introduce: supabaseAdmin (SERVICE_ROLE_KEY)
└─ Lee exactamente: process.env.SUPABASE_SERVICE_ROLE_KEY
```

### Commits posteriores que modifican el código:

```
12dfa2f - debug: add comprehensive logging to /api/register
├─ Agrega: DEBUG logs para authError y authData
├─ IMPORTANTE: Cambia validación en línea 57
├─ IMPORTANTE: Agrega logs entre líneas 41-51
└─ Sigue leyendo: process.env.SUPABASE_SERVICE_ROLE_KEY (sin cambios)
```

### Commits de documentación (no afectan código):

```
e1ade7e - docs: add RLS enablement script
ac8eb59 - docs: add comprehensive pre-RLS verification checklists
3123c3e - docs: signup failure forensics and diagnosis guide
1a62dae - docs: add SUPABASE_SERVICE_ROLE_KEY configuration
```

---

## 4️⃣ HISTORIAL DE COMMITS EN MAIN

```
1a62dae (2026-06-10) docs: add SUPABASE_SERVICE_ROLE_KEY configuration
3123c3e (2026-06-10) docs: signup failure forensics
12dfa2f (2026-06-10) debug: add comprehensive logging ← MODIFICA CÓDIGO
ac8eb59 (2026-06-10) docs: add comprehensive pre-RLS verification
e1ade7e (2026-06-10) docs: add RLS enablement script
b3f4a3e (fecha) feat: use separate Supabase clients ← INTRODUCE CÓDIGO
236b946 (anterior) Implement: Recurrence display block
```

---

## 5️⃣ ESTADO DE PUSH

**Local main branch:** ✅ Up to date with 'origin/main'

**Commits pusheados:** ✅ Todos los commits están en origin/main

**Último push:** Commit `1a62dae` está en remote

---

## 6️⃣ POSIBLE CAUSA DEL PROBLEMA

### Hipótesis 1: Vercel no ha redeployado con los cambios

**Explicación:**
- El código que lee `SUPABASE_SERVICE_ROLE_KEY` está en `b3f4a3e`
- `b3f4a3e` fue pusheado a GitHub
- Pero Vercel podría estar sirviendo una versión ANTERIOR

**Síntoma:**
- Variable `SUPABASE_SERVICE_ROLE_KEY` existe en Vercel settings
- Pero endpoint sigue recibiendo "supabaseKey is required"
- Significa: El código en producción NO está leyendo esa variable

**Solución:** Forzar redeploy en Vercel

---

## 📋 CHECKLIST: Código vs Deployment

### ✅ Código en GitHub

- [x] Línea 24: `const supabaseAdmin = createClient(`
- [x] Línea 26: `process.env.SUPABASE_SERVICE_ROLE_KEY!`
- [x] Commits pusheados a origin/main
- [x] Git status: "Your branch is up to date with 'origin/main'"

### ❓ Código en Vercel Deployment

**Necesita verificación:**
- [ ] ¿Vercel tiene el código con supabaseAdmin?
- [ ] ¿Cuál es la fecha del último deployment?
- [ ] ¿Es anterior o posterior a commit `b3f4a3e`?

---

## 🔧 CÓMO VERIFICAR QUÉ ESTÁ DESPLEGADO EN VERCEL

### Método 1: Revisar Deployment Source

**Ir a:** https://vercel.com/[tu-proyecto]/deployments

**Buscar:** Último deployment

**Click en:** Deployment details

**Buscar:** "Commit" (debería mostrar commit hash)

**Esperado:**
```
✅ Si commit >= 1a62dae: Tiene el código
✅ Si commit = b3f4a3e o posterior: Tiene el código
❌ Si commit anterior a b3f4a3e: NO tiene el código
```

### Método 2: Revisar Files en Deployment

**Ir a:** https://vercel.com/[tu-proyecto]/deployments

**Click en:** Último deployment

**Click en:** "Files" tab (si disponible)

**Buscar:** `app/api/register/route.ts`

**Ver:** ¿Tiene línea 26 con `SUPABASE_SERVICE_ROLE_KEY`?

### Método 3: Test directo (ya realizado)

```
Endpoint falló con: "supabaseKey is required"
└─ Esto significa: Código en Vercel está leyendo undefined
└─ Conclusión: O variable no está en Vercel settings
              O código no es la versión que lee la variable
```

---

## 📌 ESTADO ACTUAL

| Verificación | Resultado | Conclusión |
|-------------|-----------|-----------|
| Código local | ✅ Correcto | app/api/register/route.ts línea 26 lee SUPABASE_SERVICE_ROLE_KEY |
| GitHub | ✅ Pusheado | Commits b3f4a3e+ están en origin/main |
| Variable Vercel | ✅ Existe | SUPABASE_SERVICE_ROLE_KEY está configurada en Vercel |
| Deployment Vercel | ❓ Desconocido | Podría no tener el código que lee la variable |
| Test endpoint | ❌ Falla | "supabaseKey is required" |

---

## 🎯 DIAGNÓSTICO PROBABLE

**El código que lee `SUPABASE_SERVICE_ROLE_KEY` probablemente NO está desplegado en Vercel.**

**Razones:**
1. El código existe en GitHub (commit b3f4a3e)
2. Los commits están pusheados
3. La variable existe en Vercel
4. Pero el endpoint sigue fallando

**Conclusión:** Vercel podría estar sirviendo un deployment anterior a b3f4a3e

---

## ✅ PRÓXIMOS PASOS

**Usuario debe:**

1. Ir a: https://vercel.com/[tu-proyecto]/deployments
2. Click en últmo deployment
3. Ver detalles del deployment (qué commit contiene)
4. Si commit anterior a `b3f4a3e`: Forzar redeploy
5. Si commit >= `b3f4a3e`: El código debería estar, revisar logs

---

## 📊 RESUMEN TÉCNICO

**Variable que el código LEE:** `SUPABASE_SERVICE_ROLE_KEY` (línea 26)

**Dónde se LEE:** `app/api/register/route.ts`

**Cuándo se introdujo:** Commit `b3f4a3e`

**Estado en GitHub:** ✅ Presente y pusheado

**Estado en Vercel:** ❓ Desconocido (necesita verificación)

**Acción requerida:** Verificar qué commit está desplegado en Vercel
