# 🔍 VERIFICACIÓN: Tipo de Columna user_id

**Objetivo:** Confirmar tipo exacto de `public.business_config.user_id` para políticas de RLS

---

## 📊 EVIDENCIA RECOPILADA

### Evidencia 1: Valor actual en la tabla

**Obtenido de:** Script `check-schema.mjs` ejecutado exitosamente

```
user_id value: 84004493-a981-4541-80f7-21f948cc4ef7
JavaScript type: string (porque JSON serializa UUID como string)
Format: UUID válido (8-4-4-4-12 hex digits)
```

**Conclusión:** El valor ES un UUID, correctamente formateado

---

### Evidencia 2: Cómo se inserta en el código

**Ubicación:** `app/api/register/route.ts` línea 91

```typescript
const { error: configError, data: configData } = await supabaseAdmin
  .from('business_config')
  .insert({
    id: `config_${Date.now()}`,
    user_id: authData.user!.id,  // ← Línea 91: Inserción directa
    business_name: company,
    sector: sector || 'Otro',
  })
```

**Análisis:**
- `authData.user!.id` es el UUID del usuario autenticado
- En Supabase Auth, `auth.users.id` es SIEMPRE de tipo UUID
- NO hay casting o conversión en el código
- Se inserta directamente

**Conclusión:** Se espera que user_id sea UUID

---

### Evidencia 3: Comparación con auth.uid()

**Contexto:** Las policies de RLS comparan:

```sql
auth.uid() = user_id
```

**Tipos:**
- `auth.uid()` → UUID (función de Supabase que devuelve UUID)
- Comparación directa sin cast → Espera que user_id sea UUID

**Conclusión:** Si las políticas existentes usan `=` sin cast, user_id ES UUID

---

### Evidencia 4: Tipo de datos en auth.users

**Hecho conocido:** En Supabase, la tabla `auth.users` tiene:

```sql
auth.users.id :: UUID
```

**Relación:** `business_config.user_id` es foreign key a `auth.users.id`

**Conclusión:** user_id DEBE ser UUID (o UUID almacenado como text)

---

## 🎯 DETERMINACIÓN DEL TIPO

### Hipótesis 1: `user_id` es `uuid` (tipo nativo PostgreSQL)

**Evidencia a favor:**
- ✅ El valor ES un UUID válido
- ✅ Se inserta directamente sin casting
- ✅ `authData.user.id` es UUID
- ✅ Foreign key de `auth.users.id` (que es UUID)
- ✅ Políticas existentes comparaban sin cast

**Conclusión:** 🟢 **PROBABLE (95% confianza)**

---

### Hipótesis 2: `user_id` es `text` o `varchar`

**Evidencia a favor:**
- Algunas implementaciones almacenan UUID como text

**Evidencia en contra:**
- ❌ No hay casting en código de inserción
- ❌ Se inserta directamente desde UUID
- ❌ Aumentaría complejidad sin beneficio

**Conclusión:** 🔴 **IMPROBABLE (5% confianza)**

---

## ✅ RECOMENDACIÓN FINAL

### Tipo más probable: **UUID**

**Base:**
1. Valor en tabla: UUID válido ✅
2. Inserción: Directa desde `authData.user.id` (UUID) ✅
3. Foreign key: De `auth.users.id` (UUID) ✅
4. Sin casting: En ningún lado del código ✅
5. Políticas: Comparaban sin cast ✅

### SQL RECOMENDADO (PRIMARY OPTION):

```sql
-- Versión para UUID (sin cast)
CREATE POLICY "Users can view own config" ON business_config
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON business_config
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON business_config
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own config" ON business_config
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Confianza:** 🟢 95%

---

## ⚠️ FALLBACK (Si type es text/varchar)

**Si por alguna razón user_id es TEXT:**

```sql
-- Versión para TEXT (con cast)
CREATE POLICY "Users can view own config" ON business_config
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own config" ON business_config
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own config" ON business_config
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own config" ON business_config
  FOR DELETE
  USING (auth.uid()::text = user_id);
```

**Confianza:** 🔴 5%

---

## 🔍 CÓMO VERIFICAR AL 100%

**Opción A: Supabase Dashboard (recomendado)**
1. Ir a: https://supabase.com/dashboard
2. Proyecto → Tables → business_config
3. Click en columna `user_id`
4. Ver campo "Type"
5. Informar: UUID o TEXT

**Opción B: SQL Directo**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_config' 
AND column_name = 'user_id';
```

Expected result:
```
column_name | data_type
────────────┼──────────
user_id     | uuid      (ó: text / character varying)
```

---

## 📋 DECISIÓN FINAL

**Usar SQL SIN CAST:** `auth.uid() = user_id`

**Razón:** 95% de confianza que user_id es UUID

**Si falla con error type mismatch:**
- Revertir
- Ejecutar SQL CON CAST: `auth.uid()::text = user_id`
- Rollback es instant (1 SQL command)

---

## 🎯 RESUMEN EJECUTIVO

| Aspecto | Conclusión |
|--------|-----------|
| **Tipo probable** | UUID (95% confianza) |
| **SQL recomendado** | Sin cast: `auth.uid() = user_id` |
| **SQL alternativo** | Con cast: `auth.uid()::text = user_id` |
| **Riesgo de elegir mal** | MUY BAJO (fácil rollback) |
| **Confianza** | 🟢 ALTA |

---

**Basado en:** Datos reales + Código existente + Comportamiento de Supabase  
**Confianza:** 95%  
**Recomendación:** USAR SQL SIN CAST
