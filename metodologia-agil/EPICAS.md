# Épicas del Proyecto

## Información General

**Iniciativa:** Sistema de Seguimiento de Metas SENA - Primer Módulo del SIIES
**Ecosistema:** Sistema Integrado de Información Estadística del SENA (SIIES)
**Versión:** 1.0.0
**Fecha:** 2025-12-10
**Estado:** Documentación de componentes en fase de liberación

### Contexto del SIIES

Este documento describe las épicas del **primer módulo del SIIES**, que tiene como propósito:

- **Automatizar** tareas repetitivas y operativas del Grupo GGIER
- **Modernizar** la presentación de información estadística institucional
- **Establecer** patrones arquitectónicos para módulos futuros
- **Demostrar** capacidades de visualización web moderna de datos estadísticos

Las épicas documentadas representan funcionalidades que serán **reutilizadas y replicadas** en módulos futuros del ecosistema SIIES.

---

## Índice de Épicas

1. [EP-001: Dashboard Nacional de Seguimiento](#ep-001-dashboard-nacional-de-seguimiento)
2. [EP-002: Consulta Regional y por Centros](#ep-002-consulta-regional-y-por-centros)
3. [EP-003: Integración con Fuentes de Datos](#ep-003-integración-con-fuentes-de-datos)
4. [EP-004: Exportación y Reportería](#ep-004-exportación-y-reportería)
5. [EP-005: Gestión de Información Contextual](#ep-005-gestión-de-información-contextual)

---

## EP-001: Dashboard Nacional de Seguimiento

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | EP-001 |
| **Nombre** | Dashboard Nacional de Seguimiento |
| **Iniciativa** | INIT-SENA-METAS-001 |
| **Estado** | ✅ Completado |
| **Prioridad** | Alta |
| **Componente** | national-dashboard |
| **Estimación** | 40 puntos de historia |

### Descripción

Implementar un dashboard ejecutivo a nivel nacional que permita visualizar de forma integral todas las metas de formación profesional del SENA, organizadas en cuatro áreas temáticas principales. El dashboard debe proporcionar visualizaciones jerárquicas, búsqueda de indicadores, y acceso a información contextual de cada sección.

### Objetivos Específicos

1. Proveer una vista consolidada de todas las metas nacionales
2. Organizar información en tabs temáticos para facilitar navegación
3. Implementar visualizaciones jerárquicas con drill-down
4. Permitir búsqueda y filtrado de indicadores
5. Mostrar semáforos de cumplimiento (verde/amarillo/rojo)
6. Proporcionar información contextual de cada sección

### Áreas Temáticas (Tabs)

1. **Formación Profesional Integral**
   - Formación Titulada (Tecnólogos, Técnicos, Operarios, Auxiliares)
   - Formación Complementaria
   - Programas Relevantes
   - Retención y Certificación

2. **Sistema Nacional de Formación para el Trabajo**
   - Competencias Laborales
   - Evaluaciones y Certificaciones
   - Personas Evaluadas y Certificadas
   - Instrumentos de Evaluación

3. **CampeSENA y Full Popular**
   - Productividad CampeSENA
   - Productividad Full Popular
   - Poblaciones Vulnerables
   - Unidades Productivas

4. **Dirección de Empleo y Trabajo**
   - Agencia Pública de Empleo
   - Cupos FIC
   - Fondo Emprender
   - Contratos de Aprendizaje

### Criterios de Aceptación de Alto Nivel

- [ ] Dashboard accesible desde navegación principal
- [ ] 4 tabs temáticos funcionales con navegación fluida
- [ ] Todas las métricas cargadas desde fuentes de datos
- [ ] Visualizaciones jerárquicas expandibles/colapsables
- [ ] Sistema de semáforos implementado (≥90% verde, 83-89% amarillo, <83% rojo)
- [ ] Búsqueda funcional en todos los tabs
- [ ] Información contextual accesible mediante botones de info
- [ ] Responsive en desktop, tablet y móvil
- [ ] Tiempo de carga inicial < 3 segundos

### Componentes Técnicos Involucrados

- `national-dashboard.component.ts/html/scss`
- `metas.service.ts`
- `mongodb.service.ts`
- `secciones-info.service.ts`
- `seccion-info-dialog.component.ts`
- Modelos: `meta.model.ts`

### Dependencias

- **Depende de:** EP-003 (Integración con Fuentes de Datos)
- **Depende de:** EP-005 (Gestión de Información Contextual)
- **Bloqueantes:** Ninguno

### Historias de Usuario Asociadas

- HU-001: Visualizar metas de Formación Profesional Integral
- HU-002: Visualizar Sistema Nacional de Formación para el Trabajo
- HU-003: Visualizar CampeSENA y Full Popular
- HU-004: Visualizar Dirección de Empleo y Trabajo
- HU-005: Buscar indicadores en dashboard
- HU-006: Ver información contextual de secciones

### Notas Técnicas

- Usa `forkJoin` de RxJS para carga paralela de datos
- Implementa estrategia de fallback para fuentes de datos
- Árboles jerárquicos construidos dinámicamente desde datos
- Sistema de semáforos configurable por tipo de métrica

---

## EP-002: Consulta Regional y por Centros

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | EP-002 |
| **Nombre** | Consulta Regional y por Centros |
| **Iniciativa** | INIT-SENA-METAS-001 |
| **Estado** | ✅ Completado |
| **Prioridad** | Alta |
| **Componente** | consulta-regional |
| **Estimación** | 30 puntos de historia |

### Descripción

Desarrollar un módulo de consulta que permita seleccionar una regional y opcionalmente un centro de formación, mostrando todas las métricas de seguimiento de metas con posibilidad de drill-down jerárquico. El módulo debe permitir comparación lado a lado de regional vs centro.

### Objetivos Específicos

1. Permitir selección de regional desde lista desplegable
2. Habilitar selección opcional de centro dentro de la regional
3. Mostrar todas las tablas de métricas organizadas y colapsables
4. Implementar comparación visual regional vs centro
5. Calcular subtotales dinámicos cuando no existan en datos fuente
6. Aplicar códigos de color para identificación rápida de cumplimiento

### Áreas de Información Mostradas

1. **Formación Profesional Integral**
   - Todos los niveles de formación
   - Desagregación por estrategia (Regular, CampeSENA, Full Popular)
   - Subtotales calculados dinámicamente

2. **Programas Relevantes**
   - CampeSENA
   - Full Popular
   - Virtual

3. **Retención**
   - Por nivel de formación
   - Por modalidad (Presencial/Virtual)

4. **Certificación**
   - Por nivel de formación
   - Por estrategia

5. **Otras Métricas**
   - Competencias Laborales
   - Poblaciones Vulnerables
   - Agencia de Empleo
   - Emprendimiento
   - Contratos de Aprendizaje
   - Primer Curso

### Criterios de Aceptación de Alto Nivel

- [ ] Selector de regional funcional con todas las regionales
- [ ] Selector de centro condicional (solo muestra centros de regional seleccionada)
- [ ] Datos de regional se muestran correctamente
- [ ] Datos de centro se muestran al seleccionar uno
- [ ] Comparación lado a lado funcional
- [ ] Tablas expandibles/colapsables implementadas
- [ ] Semáforos de cumplimiento visibles
- [ ] Subtotales calculados correctamente cuando no existen en fuente
- [ ] Orden de subcategorías respeta especificación técnica
- [ ] Responsive en diferentes dispositivos

### Componentes Técnicos Involucrados

- `consulta-regional.component.ts/html/scss`
- `xlsb-api.service.ts`
- `data-transformer.service.ts`
- Modelos e interfaces locales del componente

### Dependencias

- **Depende de:** EP-003 (Integración con Fuentes de Datos)
- **Depende de:** EP-004 (Exportación - para botón de descarga)
- **Bloqueantes:** Ninguno

### Historias de Usuario Asociadas

- HU-007: Seleccionar y visualizar datos de una regional
- HU-008: Seleccionar y visualizar datos de un centro
- HU-009: Comparar métricas regional vs centro
- HU-010: Expandir/colapsar tablas de métricas
- HU-011: Visualizar semáforos de cumplimiento por categoría

### Notas Técnicas

- Implementa estrategia híbrida: API REST con fallback a JSON
- Transformador de datos especializado (`DataTransformerService`)
- Cálculo dinámico de subtotales (ej: SubTotal Tecnólogos)
- Orden de subcategorías configurable mediante array de especificación
- Manejo de variantes de nombres de subcategorías

---

## EP-003: Integración con Fuentes de Datos

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | EP-003 |
| **Nombre** | Integración con Fuentes de Datos |
| **Iniciativa** | INIT-SENA-METAS-001 |
| **Estado** | ✅ Completado |
| **Prioridad** | Crítica |
| **Componente** | Servicios (services/) |
| **Estimación** | 25 puntos de historia |

### Descripción

Implementar la capa de servicios que integre todas las fuentes de datos (API REST MongoDB y archivos JSON locales) con una estrategia de resiliencia mediante fallback automático. Los servicios deben transformar y normalizar datos para su consumo por componentes de visualización.

### Objetivos Específicos

1. Crear servicios especializados por dominio de datos
2. Implementar cliente para API REST MongoDB
3. Configurar fallback automático a JSON local ante fallas
4. Normalizar estructuras de datos de diferentes fuentes
5. Implementar transformadores de datos
6. Gestionar errores de red y datos faltantes
7. Optimizar carga de datos con estrategias paralelas

### Fuentes de Datos Integradas

**API REST MongoDB** (`sena-metas-procesador`):
- `/api/arbol-fpi-con-ejecuciones`
- `/api/arbol-retencion-con-ejecuciones`
- `/api/arbol-certificacion-con-ejecuciones`
- `/api/metas-regional`
- `/api/metas-centros`
- `/api/ejecucion-regional`
- `/api/ejecucion-centros`

**Archivos JSON Locales** (Fallback):
- `metas_fpi.json`
- `formacion_por_nivel.json`
- `metas_jerarquia.json`
- `formacion_por_estrategia.json`
- `metas_retencion.json`, `jerarquias_retencion.json`
- `metas_certificacion.json`, `jerarquias_certificacion.json`
- `metas_competencias_laborales.json`, `jerarquias_competencias_laborales.json`
- `metas_poblaciones_vulnerables.json`, `jerarquias_poblaciones_vulnerables.json`
- `metas_agencia_publica_empleo.json`, `jerarquias_agencia_publica_empleo.json`
- `metas_cupos_fic.json`, `jerarquias_cupos_fic.json`
- `metas_fondo_emprender.json`
- `metas_contratos_aprendizaje.json`
- `metas_productividad_campesena.json`
- `metas_full_popular_completo.json`
- `programas_relevantes.json`
- `seguimiento_metas_por_regional.json`

### Criterios de Aceptación de Alto Nivel

- [ ] Servicios implementados para todos los dominios de datos
- [ ] API REST funcional y accesible
- [ ] Fallback a JSON activado automáticamente ante falla de API
- [ ] Logs informativos de origen de datos (API vs JSON)
- [ ] Manejo de errores robusto con mensajes descriptivos
- [ ] Datos transformados correctamente para componentes
- [ ] Carga paralela implementada con `forkJoin`
- [ ] Tiempo de respuesta < 2 segundos para API
- [ ] Fallback transparente para usuario (sin error visible)

### Componentes Técnicos Involucrados

- `mongodb.service.ts` - Cliente API MongoDB
- `xlsb-api.service.ts` - Cliente API metas regionales y centros
- `metas.service.ts` - Servicio metas nacionales
- `data-transformer.service.ts` - Transformador de datos
- Configuración de endpoints en `environment.ts`

### Dependencias

- **Depende de:** API REST externa (`sena-metas-procesador`)
- **Depende de:** Archivos JSON en `assets/data/`
- **Bloqueantes:** Ninguno (fallback garantiza funcionamiento)

### Historias de Usuario Asociadas

- HU-012: Cargar datos desde API REST
- HU-013: Aplicar fallback a JSON cuando API falla
- HU-014: Transformar datos para visualización
- HU-015: Manejar errores de integración gracefully

### Notas Técnicas

- Usa `HttpClient` de Angular
- Implementa operadores RxJS: `catchError`, `of`, `forkJoin`, `map`
- Strategy pattern para selección de fuente de datos
- Logging con `console.log` para debugging
- Headers CORS configurados en API

---

## EP-004: Exportación y Reportería

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | EP-004 |
| **Nombre** | Exportación y Reportería |
| **Iniciativa** | INIT-SENA-METAS-001 |
| **Estado** | ✅ Completado |
| **Prioridad** | Media-Alta |
| **Componente** | Servicios (exportar-excel.service.ts) |
| **Estimación** | 15 puntos de historia |

### Descripción

Implementar funcionalidad de exportación de datos a formato Excel con formato estandarizado SENA, permitiendo exportar datos de regional solo o combinado con datos de centro. El sistema debe generar archivos con formato profesional incluyendo estilos, colores institucionales y estructura clara.

### Objetivos Específicos

1. Generar archivos Excel dinámicamente desde datos en memoria
2. Aplicar formato institucional SENA (colores naranja/negro)
3. Incluir estilos profesionales (bordes, alineación, formato numérico)
4. Permitir múltiples opciones de exportación (solo regional, regional + centro)
5. Generar nombre de archivo descriptivo con timestamp
6. Optimizar tamaño de archivo
7. Garantizar compatibilidad con Excel y LibreOffice

### Opciones de Exportación

1. **Exportación Completa (Regional + Centro)**
   - Hoja 1: Datos de la regional
   - Hoja 2: Datos del centro seleccionado
   - Encabezados con nombre de regional y centro

2. **Exportación Solo Regional**
   - Una sola hoja con datos de regional
   - Encabezado con nombre de regional
   - Más rápida y ligera

### Formato del Archivo

- **Nombre:** `Seguimiento_Metas_[REGIONAL]_[CENTRO?]_[TIMESTAMP].xlsx`
- **Hojas:** 1 o 2 según opción
- **Encabezados:** Fila combinada con título de regional/centro
- **Columnas:** Subcategoría, Meta, Ejecución, Porcentaje
- **Estilos:**
  - Encabezados: Fondo naranja SENA, texto blanco, negrita
  - Subtotales: Fondo gris claro, negrita
  - Totales: Fondo gris oscuro, texto blanco, negrita
  - Datos: Bordes, alineación correcta
  - Porcentajes: Formato `0.00%`
  - Números: Separador de miles

### Criterios de Aceptación de Alto Nivel

- [ ] Botón "Exportar" funcional en interfaz
- [ ] Opción "Solo Regional" funcional
- [ ] Opción "Regional + Centro" funcional
- [ ] Archivo descarga automáticamente al hacer clic
- [ ] Nombre de archivo descriptivo y único
- [ ] Formato aplicado correctamente (estilos SENA)
- [ ] Datos exportados coinciden con datos en pantalla
- [ ] Subtotales y totales destacados visualmente
- [ ] Archivo abre correctamente en Excel y LibreOffice
- [ ] Tamaño de archivo optimizado (< 500KB típicamente)

### Componentes Técnicos Involucrados

- `exportar-excel.service.ts` - Servicio principal de exportación
- Librería `exceljs` - Generación de archivos Excel
- `consulta-regional.component.ts` - Invocar exportación

### Dependencias

- **Depende de:** EP-002 (Consulta Regional - fuente de datos)
- **Bloqueantes:** Ninguno
- **Librerías:** ExcelJS 4.4+

### Historias de Usuario Asociadas

- HU-016: Exportar datos de regional a Excel
- HU-017: Exportar datos de regional y centro a Excel
- HU-018: Aplicar formato institucional a reportes

### Notas Técnicas

- Usa ExcelJS para generación
- Formato de colores: Naranja `#FF5722`, Negro `#212121`
- Descarga mediante `Blob` y `URL.createObjectURL`
- Timestamp formato: `YYYYMMDD_HHmmss`
- Ancho de columnas ajustado automáticamente

---

## EP-005: Gestión de Información Contextual

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | EP-005 |
| **Nombre** | Gestión de Información Contextual |
| **Iniciativa** | INIT-SENA-METAS-001 |
| **Estado** | ✅ Completado |
| **Prioridad** | Media |
| **Componente** | Servicios + Componente de diálogo |
| **Estimación** | 10 puntos de historia |

### Descripción

Implementar sistema de ayuda contextual que permita a los usuarios acceder a información adicional sobre cada sección del dashboard mediante botones de información. La información se muestra en un diálogo modal con formato estructurado.

### Objetivos Específicos

1. Crear repositorio de información contextual por sección
2. Implementar servicio para obtener información por ID de sección
3. Crear componente de diálogo para mostrar información
4. Integrar botones de info en secciones del dashboard
5. Estructurar información de forma clara (definición, fórmula, fuente, notas)
6. Garantizar accesibilidad del diálogo

### Estructura de Información Contextual

Cada sección contiene:
- **ID:** Identificador único de sección
- **Título:** Nombre descriptivo de la sección
- **Definición:** Explicación de qué representa
- **Fórmula:** Cómo se calcula (si aplica)
- **Fuente de Datos:** De dónde provienen los datos
- **Notas Adicionales:** Aclaraciones o detalles importantes
- **Última Actualización:** Fecha de última modificación de datos

### Secciones Documentadas

1. Formación Profesional Integral
2. Formación por Estrategia
3. Retención
4. Certificación
5. Competencias Laborales
6. Productividad CampeSENA
7. Productividad Full Popular
8. Poblaciones Vulnerables
9. Agencia Pública de Empleo
10. Cupos FIC
11. Fondo Emprender
12. Contratos de Aprendizaje

### Criterios de Aceptación de Alto Nivel

- [ ] Botones de información visibles en todas las secciones
- [ ] Diálogo modal se abre al hacer clic en botón
- [ ] Información mostrada es correcta para cada sección
- [ ] Diálogo responsive y accesible
- [ ] Cierre de diálogo mediante botón X o clic fuera
- [ ] Información estructurada y legible
- [ ] Navegación con teclado funcional
- [ ] Diseño coherente con guía de estilos SENA

### Componentes Técnicos Involucrados

- `secciones-info.service.ts` - Servicio de información
- `seccion-info-dialog.component.ts` - Componente de diálogo
- `secciones_info.json` - Repositorio de información
- `MatDialog` de Angular Material

### Dependencias

- **Depende de:** Angular Material (MatDialog)
- **Bloqueantes:** Ninguno

### Historias de Usuario Asociadas

- HU-019: Ver información contextual de una sección
- HU-020: Cerrar diálogo de información

### Notas Técnicas

- Usa `MatDialog` de Angular Material
- Datos en JSON para fácil mantenimiento
- Servicio con método `getSeccionInfoById(id: string)`
- Diálogo con ancho `600px`, max `95vw`
- Observable pattern con RxJS

---

## Resumen de Estado de Épicas

| ID | Nombre | Prioridad | Estado | Puntos |
|----|--------|-----------|--------|--------|
| EP-001 | Dashboard Nacional de Seguimiento | Alta | ✅ Completado | 40 |
| EP-002 | Consulta Regional y por Centros | Alta | ✅ Completado | 30 |
| EP-003 | Integración con Fuentes de Datos | Crítica | ✅ Completado | 25 |
| EP-004 | Exportación y Reportería | Media-Alta | ✅ Completado | 15 |
| EP-005 | Gestión de Información Contextual | Media | ✅ Completado | 10 |
| **TOTAL** | | | | **120 puntos** |

---

## Roadmap de Épicas

```
Fase 1: Infraestructura
└── EP-003: Integración con Fuentes de Datos

Fase 2: Visualización Nacional
├── EP-001: Dashboard Nacional de Seguimiento
└── EP-005: Gestión de Información Contextual

Fase 3: Visualización Regional
├── EP-002: Consulta Regional y por Centros
└── EP-004: Exportación y Reportería
```

---

## Épicas Futuras (Backlog)

| ID | Nombre | Prioridad | Estado |
|----|--------|-----------|--------|
| EP-006 | Visualización Geográfica con Mapas | Media | 📋 Planificado |
| EP-007 | Gestión de Usuarios y Permisos | Baja | 📋 Planificado |
| EP-008 | Alertas y Notificaciones | Media | 💭 Ideación |
| EP-009 | Análisis Predictivo | Baja | 💭 Ideación |
| EP-010 | Módulo de Configuración de Metas | Media | 📋 Planificado |

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | 2025-12-10 | Equipo SENA | Épicas de componentes en fase de liberación |

---

## Referencias

- Ver `INICIATIVA.md` para contexto general del proyecto
- Ver `HISTORIAS_USUARIO.md` para desglose detallado de requisitos
- Ver `METODOLOGIA_AGIL_ESTRUCTURA.md` para estructura de documentación
