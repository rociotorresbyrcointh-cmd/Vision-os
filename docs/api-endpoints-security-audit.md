# 🔐 AUDITORÍA DE SEGURIDAD: Endpoints de Prueba y Depuración

**Fecha:** 2026-06-10  
**Objetivo:** Identificar endpoints de test/debug que representan riesgo de seguridad en producción

---

## 📋 RESUMEN EJECUTIVO

| Categoría | Cantidad | Acción |
|-----------|----------|--------|
| **ENDPOINTS CRÍTICOS** | 5 | ✅ Mantener |
| **ENDPOINTS LEGÍTIMOS** | 2 | ✅ Mantener |
| **ENDPOINTS DE TEST** | 7 | 🔴 **ELIMINAR** |
| **ENDPOINTS DE DEBUG** | 2 | 🔴 **ELIMINAR** |
| **ENDPOINTS DE CHECK/AUDIT** | 4 | 🔴 **ELIMINAR** |
| **TOTAL** | 20 | **13 para eliminar** |

---

## 🎯 CLASIFICACIÓN DETALLADA

### ✅ ENDPOINTS CRÍTICOS (MANTENER)

#### 1. `/api/register`
```
Archivo: app/api/register/route.ts
Función: Registro de nuevos usuarios
Método: POST
Requiere: email, password, company, sector
Riesgo: BAJO (solo crea nuevos usuarios)
Estado: ✅ MANTENER
```

#### 2. `/api/send-whatsapp`
```
Archivo: app/api/send-whatsapp/route.ts
Función: Envía mensajes WhatsApp
Método: POST
Requiere: autenticación
Riesgo: BAJO (integración legítima)
Estado: ✅ MANTENER
```

#### 3. `/api/send-invitation-email`
```
Archivo: app/api/send-invitation-email/route.ts
Función: Envía emails de invitación
Método: POST
Requiere: autenticación
Riesgo: BAJO (integración legítima)
Estado: ✅ MANTENER
```

#### 4. `/api/sync-turnos`
```
Archivo: app/api/sync-turnos/route.ts
Función: Sincroniza turnos/appointments
Método: POST
Requiere: autenticación
Riesgo: BAJO (operación legítima)
Estado: ✅ MANTENER
```

#### 5. `/api/generar-anuncio`
```
Archivo: app/api/generar-anuncio/route.ts
Función: Genera anuncios (AI)
Método: POST
Requiere: autenticación
Riesgo: BAJO (feature legítima)
Estado: ✅ MANTENER
```

---

### ⚠️ ENDPOINTS LEGÍTIMOS (REVISAR)

#### 1. `/api/contact-form`
```
Archivo: app/api/contact-form/route.ts
Función: Formulario de contacto público
Método: POST
Requiere: Ninguno (público)
Riesgo: BAJO (formulario público)
Estado: ✅ MANTENER (pero validar CSRF/spam)
```

#### 2. `/api/check-access`
```
Archivo: app/api/check-access/route.ts
Función: Verifica acceso/trial del usuario
Método: GET con userId param
Requiere: userId query param
Riesgo: BAJO-MEDIO (expone info de trial)
Estado: ⚠️ REVISAR (podría exponer datos)
Recomendación: Requiere autenticación
```

---

### 🔴 ENDPOINTS DE TEST (ELIMINAR)

#### 1. `/api/test-insert`
```
Archivo: app/api/test-insert/route.ts
Método: GET
Función: Test INSERT genérico
Riesgo: 🔴 CRÍTICO
- Permite INSERT sin validación
- Crea registros de prueba en BD
- Expone estructura de tabla
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 2. `/api/test-insert-minimal`
```
Archivo: app/api/test-insert-minimal/route.ts
Método: GET
Función: Test INSERT con campos mínimos
Riesgo: 🔴 CRÍTICO
- Mismo riesgo que test-insert
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 3. `/api/test-insert-real`
```
Archivo: app/api/test-insert-real/route.ts
Método: GET
Función: Test INSERT con datos reales
Riesgo: 🔴 CRÍTICO
- Mismo riesgo que test-insert
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 4. `/api/test-basic-insert`
```
Archivo: app/api/test-basic-insert/route.ts
Método: GET
Función: Test INSERT básico
Riesgo: 🔴 CRÍTICO
- Mismo riesgo que test-insert
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 5. `/api/test-minimal`
```
Archivo: app/api/test-minimal/route.ts
Método: GET
Función: Test con ID y user_id solo
Riesgo: 🔴 CRÍTICO
- Mismo riesgo que test-insert
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 6. `/api/test-select`
```
Archivo: app/api/test-select/route.ts
Método: GET
Función: Test SELECT genérico
Riesgo: 🔴 CRÍTICO
- Permite lectura sin autenticación
- Expone datos de BD
- Expone estructura de tabla
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 7. `/api/test-env`
```
Archivo: app/api/test-env/route.ts
Método: GET
Función: Expone variables de entorno
Riesgo: 🔴 CRÍTICO
- Expone SUPABASE_URL
- Expone API KEYS (parcialmente)
- Expone configuración sensible
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

---

### 🔴 ENDPOINTS DE DEBUG (ELIMINAR)

#### 1. `/api/debug-appointments`
```
Archivo: app/api/debug-appointments/route.ts
Método: POST
Función: Debug de appointments
Riesgo: 🔴 ALTO
- Permite crear/modificar appointments sin validación
- Log detallado de datos
- Accesible públicamente
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 2. `/api/debug-services`
```
Archivo: app/api/debug-services/route.ts
Método: POST
Función: Debug de services
Riesgo: 🔴 ALTO
- Mismo riesgo que debug-appointments
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

---

### 🔴 ENDPOINTS DE CHECK/AUDIT (ELIMINAR)

#### 1. `/api/check-rls`
```
Archivo: app/api/check-rls/route.ts
Método: GET
Función: Verifica estado de RLS
Riesgo: 🔴 CRÍTICO
- Expone estado de seguridad
- Devuelve información para atacantes
- Instruye cómo explotar RLS
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 2. `/api/audit-services-table`
```
Archivo: app/api/audit-services-table/route.ts
Método: GET
Función: Audita estructura de tabla
Riesgo: 🔴 ALTO
- Expone estructura de BD
- Información valiosa para atacantes
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 3. `/api/diagnose`
```
Archivo: app/api/diagnose/route.ts
Método: GET
Función: Diagnóstico de Supabase
Riesgo: 🔴 ALTO
- Expone URL de Supabase
- Expone estado de conexión
- Información de debugging
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

#### 4. `/api/validate-dependencies`
```
Archivo: app/api/validate-dependencies/route.ts
Método: GET
Función: Valida dependencias
Riesgo: 🔴 ALTO
- Expone versiones de librerías
- Intenta INSERT de test
- Información de reconocimiento
Accesible en: Producción
Estado: ❌ ELIMINAR INMEDIATAMENTE
```

---

## 📊 ANÁLISIS DE RIESGO

### Endpoints que REQUIEREN ELIMINACIÓN INMEDIATA

```
🔴 CRÍTICA:
├─ /api/test-* (7 endpoints)
│  └─ Permiten INSERT/SELECT sin autenticación
│  └─ Exponen estructura de BD
│  └─ Crean datos de prueba en producción
│
├─ /api/test-env
│  └─ EXPONE VARIABLES DE ENTORNO Y CLAVES
│
├─ /api/check-rls
│  └─ Enseña a atacantes cómo explotar RLS
│
└─ /api/debug-* (2 endpoints)
   └─ Permiten insertar datos sin validación
```

### Endpoints que REQUERIRÍAN CAMBIOS

```
⚠️ REVISAR:
└─ /api/check-access
   └─ Expone información de trial
   └─ Debería requerir autenticación
```

---

## 🗑️ PLAN DE ELIMINACIÓN

### Archivos a ELIMINAR:

```
1. app/api/test-insert/route.ts
2. app/api/test-insert-minimal/route.ts
3. app/api/test-insert-real/route.ts
4. app/api/test-basic-insert/route.ts
5. app/api/test-minimal/route.ts
6. app/api/test-select/route.ts
7. app/api/test-env/route.ts
8. app/api/debug-appointments/route.ts
9. app/api/debug-services/route.ts
10. app/api/check-rls/route.ts
11. app/api/audit-services-table/route.ts
12. app/api/diagnose/route.ts
13. app/api/validate-dependencies/route.ts
```

**Total:** 13 archivos a eliminar

### Directorio a ELIMINAR:

```
app/api/test-insert/
app/api/test-insert-minimal/
app/api/test-insert-real/
app/api/test-basic-insert/
app/api/test-minimal/
app/api/test-select/
app/api/test-env/
app/api/debug-appointments/
app/api/debug-services/
app/api/check-rls/
app/api/audit-services-table/
app/api/diagnose/
app/api/validate-dependencies/
```

---

## ✅ ENDPOINTS A MANTENER

| Endpoint | Descripción | Seguridad |
|----------|-------------|-----------|
| `/api/register` | Registro de usuarios | ✅ Seguro |
| `/api/send-whatsapp` | Envío de mensajes | ✅ Seguro |
| `/api/send-invitation-email` | Envío de emails | ✅ Seguro |
| `/api/sync-turnos` | Sincronización | ✅ Seguro |
| `/api/generar-anuncio` | Generación de anuncios | ✅ Seguro |
| `/api/contact-form` | Formulario de contacto | ✅ Seguro |
| `/auth/confirm` | Confirmación de email | ✅ Seguro (necesario) |

---

## 📋 CHECKLIST PRE-VENTA

Antes de vender la aplicación:

- [ ] Todos los endpoints `/api/test-*` eliminados (7)
- [ ] Todos los endpoints `/api/debug-*` eliminados (2)
- [ ] Endpoint `/api/check-rls` eliminado
- [ ] Endpoint `/api/audit-services-table` eliminado
- [ ] Endpoint `/api/diagnose` eliminado
- [ ] Endpoint `/api/validate-dependencies` eliminado
- [ ] `/api/check-access` requiere autenticación
- [ ] Build y deploy de código limpio
- [ ] Verificar no hay referencias en código
- [ ] Verificar no hay referencias en documentación

---

## 🎯 RECOMENDACIÓN FINAL

**ELIMINAR INMEDIATAMENTE (antes de cualquier venta/despliegue a clientes):**

```
13 archivos de test/debug/audit que exponen:
- Estructura de base de datos
- Variables de entorno
- Métodos para explotar vulnerabilidades
- Información de reconocimiento
```

**IMPACTO:**
- Sin estos endpoints: Sistema es seguro para producción
- Con estos endpoints: Atacante tiene todo lo necesario para explotar

**URGENCIA:** 🔴 CRÍTICA

---

**Auditoría completada:** 2026-06-10  
**Archivos problemáticos:** 13  
**Recomendación:** Eliminar ANTES de cualquier despliegue importante
