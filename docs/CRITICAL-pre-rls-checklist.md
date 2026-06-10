# 🔴 CHECKLIST CRÍTICO PRE-RLS

**IMPORTANTE:** Este checklist DEBE estar 100% completado antes de habilitar RLS.  
Si algún ítem falla, NO habilitar RLS.

---

## ✅ VERIFICACIONES LOCALES (completadas)

```
✅ Commit b3f4a3e: Código /api/register modificado
   ├─ Línea 18-21: supabasePublic creado ✅
   ├─ Línea 24-27: supabaseAdmin creado ✅
   ├─ Línea 32: supabasePublic.auth.signUp() ✅
   └─ Línea 67: supabaseAdmin.from('business_config').insert() ✅

✅ Commit e1ade7e: Documentación agregada
   ├─ docs/enable-rls-business-config.sql ✅
   ├─ docs/validation-post-rls.md ✅
   └─ docs/vercel-env-verification.md ✅

✅ Build test: next build completó sin errores ✅

✅ Git push: Commits pusheados a main ✅

✅ Código verificado: Dos clientes en lugar de uno ✅
```

---

## 🔴 VERIFICACIONES EN VERCEL (CRÍTICAS - Hacer ahora)

### PASO 1: Verificar que Vercel tenga SUPABASE_SERVICE_ROLE_KEY

**Ir a:** https://vercel.com → [Proyecto] → Settings → Environment Variables

**Buscar:** `SUPABASE_SERVICE_ROLE_KEY`

**Checklist:**
- [ ] Variable existe
- [ ] Valor no está vacío (comienza con `sk_`)
- [ ] Exposed to Client = **OFF** (CRÍTICO)
- [ ] Disponible en Production, Preview y Development

**Si NO existe:**
1. Click **Add New**
2. Name: `SUPABASE_SERVICE_ROLE_KEY`
3. Value: 
   - Ir a Supabase Dashboard → Settings → API
   - Copiar **Service Role Secret**
   - Pegar aquí
4. Uncheck **Expose to Client**
5. Click **Save**
6. **Esperar a que Vercel termine redeploy** (status = Ready, verde)

**Si existe pero está incorrecta:**
- Eliminar y recrear con valor correcto

---

### PASO 2: Verificar que último deployment está Ready

**Ir a:** https://vercel.com → [Proyecto] → Deployments

**Checklist:**
- [ ] Último deployment tiene status **Ready** (verde)
- [ ] Deployment fue después de los últimos commits
- [ ] Si está en building: esperar a que termine
- [ ] Si está en error: revisar logs y corregir

---

### PASO 3: Test en Producción - Registro de nuevo usuario

**Este test DEBE funcionar 100% antes de habilitar RLS**

1. Abrir app en producción: `https://[tu-app.vercel.app]`
2. Ir a `/register`
3. Crear nuevo usuario:
   ```
   Email: test_final_$(date +%s)@example.com
   Password: TestPass123!
   Empresa: Final Test Company
   Sector: Testing
   ```
4. Click "Registrarse"

**Checklist de resultado:**
- [ ] NO hay errores en página
- [ ] NO hay errores en console (F12)
- [ ] Página redirige a confirmación/dashboard
- [ ] Sin mensaje de error "SERVICE_ROLE_KEY is undefined"
- [ ] Sin mensaje de error sobre "RLS policy"

**Verificar en Supabase Dashboard:**
```
auth.users table:
  [ ] Usuario con email = test_final_*@example.com existe

business_config table:
  [ ] Nuevo registro con user_id = usuario recién creado
  [ ] business_name = "Final Test Company"
  [ ] sector = "Testing"
```

**Si falla:**
- [ ] Check Vercel logs: Settings → Deployments → latest → Function Logs
- [ ] Probable causa 1: SUPABASE_SERVICE_ROLE_KEY no configurado
- [ ] Probable causa 2: SUPABASE_SERVICE_ROLE_KEY valor incorrecto
- [ ] NO proceder a RLS hasta que esto funcione 100%

---

### PASO 4: Test en Producción - Login

**Después que registro funciona, test login**

1. Ir a `/login`
2. Ingresar credenciales del usuario recién creado
3. Click "Entrar"

**Checklist:**
- [ ] Login exitoso sin errores
- [ ] Dashboard carga
- [ ] Empresa visible en UI (debería mostrar "Final Test Company")
- [ ] Sin errores en console

---

### PASO 5: Limpiar usuario de prueba (Opcional pero recomendado)

**En Supabase Dashboard:**

```sql
-- Eliminar usuario de test
DELETE FROM business_config 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email LIKE 'test_final_%@example.com'
);

DELETE FROM auth.users 
WHERE email LIKE 'test_final_%@example.com';
```

---

## 📋 RESUMEN PRE-RLS

| Verificación | Local | Vercel | Estado |
|-------------|-------|--------|--------|
| Código modificado | ✅ | ⏳ Verificar | Pendiente |
| Commits pusheados | ✅ | ⏳ Verificar | Pendiente |
| SUPABASE_SERVICE_ROLE_KEY existe | ✅ .env | ⏳ Variables | **CRÍTICO** |
| Registro funciona sin RLS | ⏳ Test | ✅ En producción | **CRÍTICO** |
| Build sin errores | ✅ | ⏳ Verificar | Pendiente |
| Login funciona | ⏳ Manual | ✅ En producción | **CRÍTICO** |

---

## ⚠️ PUNTO DE DECISIÓN

**SOLO proceder a habilitar RLS si:**

```
✅ TODAS las verificaciones de Vercel están completas
✅ Registro de usuario funciona en producción
✅ Login funciona en producción
✅ Datos se persisten en business_config
✅ SUPABASE_SERVICE_ROLE_KEY está configurado en Vercel
✅ Exposed to Client = OFF para SERVICE_ROLE_KEY
```

**Si algo falla:**

```
❌ NO habilitar RLS
❌ Investigar error específico
❌ Corregir problema
❌ Re-test
❌ Solo entonces habilitar RLS
```

---

## 🚀 PRÓXIMOS PASOS (Cuando todo esté ✅)

1. Ejecutar SQL: `docs/enable-rls-business-config.sql`
2. Ejecutar tests: `docs/validation-post-rls.md`
3. Entregar evidencia final

---

**Estado actual:** ⏳ PENDIENTE VERIFICACIÓN EN VERCEL  
**Próximo paso:** Completar checklist Vercel (PASO 1-5 arriba)  
**No proceder a RLS hasta que TODO esté ✅**

---

**Documento creado:** 2026-06-10  
**Urgencia:** CRÍTICA
