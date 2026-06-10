# Verificación de Variables de Entorno en Vercel

**Objetivo:** Confirmar que SUPABASE_SERVICE_ROLE_KEY está configurado en Vercel antes de habilitar RLS.

---

## ✅ CHECKLIST: Verificar SUPABASE_SERVICE_ROLE_KEY en Vercel

### Paso 1: Acceder a Vercel Dashboard

1. Ir a: https://vercel.com
2. Seleccionar proyecto: `Vision-os` (o el nombre en tu Vercel)
3. Click en **Settings** (engranaje en la esquina superior)

### Paso 2: Verificar Environment Variables

1. En Settings, click en **Environment Variables** (izquierda)
2. Buscar en la lista: `SUPABASE_SERVICE_ROLE_KEY`

### Paso 3: Confirmaciones

**Esperado:**

```
SUPABASE_SERVICE_ROLE_KEY
├─ Value: sk_....[valor oculto]
├─ Exposed to Client: ❌ NO (debe estar desactivado)
├─ Available on: 
│  ├─ Production ✅ 
│  ├─ Preview ✅
│  └─ Development ✅
```

### Paso 4: Si NO está configurado

1. Click en **Add New**
2. Nombre: `SUPABASE_SERVICE_ROLE_KEY`
3. Value: 
   - Ir a Supabase Dashboard → Settings → API
   - Copiar "Service Role Secret" (la llave que comienza con `sk_`)
   - Pegar en Vercel
4. Uncheck "Expose to Client" (debe estar UNCHECKED)
5. Click **Save** (debe mostrar "Added" con checkmark)
6. **CRÍTICO:** Vercel redeploya automáticamente. Esperar a que termine.

### Paso 5: Confirmar redeploy

1. En Vercel Dashboard, ir a **Deployments**
2. Ver el último deployment
3. Esperar a que status sea "Ready" (verde)
4. Si dice "Failed": revisar logs, probable cause es variable mal formada

---

## 🔒 Seguridad: Validar que NO está expuesto

**En Vercel Dashboard:**

```
SUPABASE_SERVICE_ROLE_KEY
├─ Exposed to Client: ❌ DEBE ESTAR OFF
├─ (si está ON: DESACTIVAR INMEDIATAMENTE)
```

**Por qué:**
- Si "Expose to Client" = ON, la key se envía al navegador (VULNERABILIDAD CRÍTICA)
- Si "Expose to Client" = OFF, la key solo está disponible en servidor (SEGURO)

---

## ✅ Estado Final Esperado

```
✅ SUPABASE_SERVICE_ROLE_KEY existe en Vercel
✅ Valor es válido (comienza con sk_)
✅ Exposed to Client = OFF
✅ Available en Production
✅ Último deployment = Ready (verde)
```

---

## 🧪 Test: Verificar que la variable se carga en producción

### Opción 1: Via logs de Vercel

1. En Vercel Dashboard → Deployments → últimas builds
2. Click en el deployment
3. Click en **Function Logs**
4. Buscar en logs:
   ```
   ✅ Usuario creado en Auth: [uuid]
   ✅ Config guardada exitosamente
   ```
   - Si ves estos logs: variable está disponible ✅
   - Si ves error "SUPABASE_SERVICE_ROLE_KEY undefined": variable NO está configurada ❌

### Opción 2: Via test directo de registro

1. Abrir app en producción: https://[tu-app]
2. Ir a /register
3. Crear usuario nuevo
4. Si registro funciona → variable está disponible ✅
5. Si falla con error "undefined" → variable no configurada ❌

---

## 📋 Confirmación Final

- [ ] SUPABASE_SERVICE_ROLE_KEY existe en Vercel
- [ ] Exposed to Client = OFF
- [ ] Último deployment está Ready
- [ ] TEST: Registro de usuario funciona en producción

**Cuando todos los checkboxes estén ✅, proceder a: Ejecutar SQL de RLS**

---

**Documento actualizado:** 2026-06-10  
**Próximo paso:** Ver `enable-rls-business-config.sql`
