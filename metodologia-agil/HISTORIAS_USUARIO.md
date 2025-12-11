# Historias de Usuario

## Información General

**Proyecto:** Sistema de Seguimiento de Metas SENA
**Versión:** 1.0.0
**Fecha:** 2025-12-10
**Estado:** Documentación de componentes en fase de liberación

---

## Índice de Historias de Usuario

### Épica EP-001: Dashboard Nacional de Seguimiento
- [HU-001](#hu-001-visualizar-metas-de-formación-profesional-integral): Visualizar metas de Formación Profesional Integral
- [HU-002](#hu-002-visualizar-sistema-nacional-de-formación-para-el-trabajo): Visualizar Sistema Nacional de Formación para el Trabajo
- [HU-003](#hu-003-visualizar-campesena-y-full-popular): Visualizar CampeSENA y Full Popular
- [HU-004](#hu-004-visualizar-dirección-de-empleo-y-trabajo): Visualizar Dirección de Empleo y Trabajo
- [HU-005](#hu-005-buscar-indicadores-en-dashboard): Buscar indicadores en dashboard
- [HU-006](#hu-006-ver-información-contextual-de-secciones): Ver información contextual de secciones

### Épica EP-002: Consulta Regional y por Centros
- [HU-007](#hu-007-seleccionar-y-visualizar-datos-de-una-regional): Seleccionar y visualizar datos de una regional
- [HU-008](#hu-008-seleccionar-y-visualizar-datos-de-un-centro): Seleccionar y visualizar datos de un centro
- [HU-009](#hu-009-comparar-métricas-regional-vs-centro): Comparar métricas regional vs centro
- [HU-010](#hu-010-expandir-colapsar-tablas-de-métricas): Expandir/colapsar tablas de métricas
- [HU-011](#hu-011-visualizar-semáforos-de-cumplimiento): Visualizar semáforos de cumplimiento por categoría

### Épica EP-003: Integración con Fuentes de Datos
- [HU-012](#hu-012-cargar-datos-desde-api-rest): Cargar datos desde API REST
- [HU-013](#hu-013-aplicar-fallback-a-json-cuando-api-falla): Aplicar fallback a JSON cuando API falla
- [HU-014](#hu-014-transformar-datos-para-visualización): Transformar datos para visualización
- [HU-015](#hu-015-manejar-errores-de-integración): Manejar errores de integración gracefully

### Épica EP-004: Exportación y Reportería
- [HU-016](#hu-016-exportar-datos-de-regional-a-excel): Exportar datos de regional a Excel
- [HU-017](#hu-017-exportar-datos-de-regional-y-centro-a-excel): Exportar datos de regional y centro a Excel
- [HU-018](#hu-018-aplicar-formato-institucional-a-reportes): Aplicar formato institucional a reportes

### Épica EP-005: Gestión de Información Contextual
- [HU-019](#hu-019-ver-información-contextual-de-una-sección): Ver información contextual de una sección
- [HU-020](#hu-020-cerrar-diálogo-de-información): Cerrar diálogo de información

---

# Historias de Usuario Detalladas

---

## HU-001: Visualizar metas de Formación Profesional Integral

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-001 |
| **Épica** | EP-001 |
| **Prioridad** | Alta |
| **Estimación** | 13 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 2 |

### Historia

**Como** director de formación profesional integral
**Quiero** visualizar todas las metas de FPI organizadas jerárquicamente
**Para** tener una visión completa del cumplimiento a nivel nacional

### Descripción Detallada

El tab de "Formación Profesional Integral" debe mostrar:
- Formación Titulada con drill-down a niveles (Tecnólogos, Técnicos, etc.)
- Formación Complementaria
- Formación por Estrategia (Regular, CampeSENA, Full Popular)
- Programas Relevantes (tabla)
- Retención (tarjetas principales + tabla detalle)
- Certificación (tarjeta principal + tabla detalle)

### Criterios de Aceptación

#### AC1: Visualización de Formación Titulada
```gherkin
Given que estoy en el tab "Formación Profesional Integral"
When la página carga completamente
Then debo ver una tarjeta principal con el árbol jerárquico de Formación Profesional Integral
And debo ver el total general en la raíz del árbol
And debo ver los nodos hijos colapsados por defecto
```

#### AC2: Drill-down en árbol jerárquico
```gherkin
Given que estoy viendo el árbol de Formación Profesional Integral
When hago clic en el ícono de expandir de un nodo
Then el nodo se expande mostrando sus hijos
And puedo ver meta, ejecución y porcentaje de cada hijo
And los semáforos se muestran según el nivel de cumplimiento
```

#### AC3: Visualización de Formación por Estrategia
```gherkin
Given que estoy en el tab "Formación Profesional Integral"
When scrolleo hacia abajo
Then debo ver la sección "Formación por Estrategia"
And debo ver columnas para Regular, CampeSENA y Full Popular
And debo poder expandir el nodo raíz para ver detalles
```

#### AC4: Visualización de Retención
```gherkin
Given que estoy en el tab "Formación Profesional Integral"
When scrolleo a la sección de Retención
Then debo ver tarjetas de nivel padre (Titulada, Complementaria)
And debo poder hacer clic en una tarjeta para ver la tabla de detalles
And la tabla debe mostrar todos los nodos hijos
```

#### AC5: Visualización de Certificación
```gherkin
Given que estoy en el tab "Formación Profesional Integral"
When scrolleo a la sección de Certificación
Then debo ver la tarjeta principal de certificación
And debo poder hacer clic para ver el árbol completo
And el árbol debe mostrar jerarquía completa con niveles
```

### Notas Técnicas

- Componente: `national-dashboard.component.ts`
- Servicios: `MetasService.getMetas()`, `MongoDBService.getArbolFPIConEjecuciones()`
- Construcción de árbol: `buildTree()`, `buildHierarchyTree()`
- Sistema de semáforos: Verde ≥90%, Amarillo 83-89%, Rojo <83%

### Definición de Hecho

- [x] Código implementado y funcional
- [x] Datos cargados desde fuentes correctas
- [x] Árboles jerárquicos funcionan correctamente
- [x] Semáforos muestran colores correctos
- [x] Responsive en todos los dispositivos
- [x] Validado por Product Owner

---

## HU-002: Visualizar Sistema Nacional de Formación para el Trabajo

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-002 |
| **Épica** | EP-001 |
| **Prioridad** | Alta |
| **Estimación** | 8 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 2 |

### Historia

**Como** coordinador del Sistema Nacional de Formación para el Trabajo
**Quiero** visualizar las métricas de competencias laborales
**Para** dar seguimiento a evaluaciones y certificaciones

### Descripción Detallada

El tab debe mostrar:
- Tarjeta principal de Competencias Laborales (Total Certificaciones)
- Detalle expandible con subtotales (CampeSENA, Full Popular, Regular)
- Otras tarjetas de métricas relacionadas
- Sistema de semáforos de cumplimiento

### Criterios de Aceptación

#### AC1: Visualización de tarjeta principal
```gherkin
Given que navego al tab "Sistema Nacional de Formación para el Trabajo"
When la página carga
Then debo ver la tarjeta principal de "Total Certificaciones"
And debo ver meta, ejecución y porcentaje
And debo ver un semáforo de cumplimiento
```

#### AC2: Expandir detalles
```gherkin
Given que veo la tarjeta principal de Competencias Laborales
When hago clic en "Ver Detalles"
Then se despliega una tabla con el desglose
And debo ver certificaciones por estrategia (CampeSENA, Full Popular, Regular)
And debo ver otras métricas (evaluaciones, personas evaluadas, etc.)
```

#### AC3: Visualización de otras tarjetas
```gherkin
Given que estoy en el tab "Sistema Nacional de Formación para el Trabajo"
When scrolleo por la sección
Then debo ver tarjetas adicionales de métricas
And cada tarjeta debe mostrar meta, ejecución y porcentaje
And los semáforos deben ser visibles
```

### Notas Técnicas

- Servicios: `MetasService.getMetasCompetenciasLaborales()`, `getJerarquiasCompetenciasLaborales()`
- Construcción de árbol: `buildCompetenciasLaboralesTree()`
- Tarjeta principal: Nodo con `id === '1'`
- Otras tarjetas: Nodos con `id` en ['2', '3', '4', '5', '6', '7']

### Definición de Hecho

- [x] Tab navegable desde menú principal
- [x] Datos cargados correctamente
- [x] Tarjetas muestran información correcta
- [x] Toggle de detalles funcional
- [x] Semáforos precisos
- [x] Responsive

---

## HU-003: Visualizar CampeSENA y Full Popular

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-003 |
| **Épica** | EP-001 |
| **Prioridad** | Alta |
| **Estimación** | 10 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 2 |

### Historia

**Como** coordinador de programas especiales
**Quiero** visualizar métricas de CampeSENA y Full Popular
**Para** monitorear el impacto de estos programas en poblaciones específicas

### Descripción Detallada

El tab debe mostrar:
- **Productividad CampeSENA:** 4 tarjetas planas (sin jerarquía)
- **Productividad Full Popular:** Tarjeta principal con árbol jerárquico
- **Poblaciones Vulnerables:** Tarjeta principal con tabla expandible

### Criterios de Aceptación

#### AC1: Visualización de Productividad CampeSENA
```gherkin
Given que navego al tab "CampeSENA y Full Popular"
When la página carga
Then debo ver la sección "Productividad CampeSENA"
And debo ver 4 tarjetas con métricas diferentes
And cada tarjeta debe mostrar meta, ejecución y porcentaje
And no debe haber jerarquía (tarjetas planas)
```

#### AC2: Visualización de Productividad Full Popular
```gherkin
Given que estoy en el tab "CampeSENA y Full Popular"
When scrolleo a la sección Full Popular
Then debo ver una tarjeta principal
And debo poder hacer clic para ver el árbol jerárquico completo
And el árbol debe tener estructura 1 → 1.1, 1.2, 1.3, 1.4
```

#### AC3: Visualización de Poblaciones Vulnerables
```gherkin
Given que estoy en el tab "CampeSENA y Full Popular"
When scrolleo a la sección Poblaciones Vulnerables
Then debo ver una tarjeta principal con el total
And debo poder hacer clic para ver tabla de detalles
And la tabla debe mostrar todas las categorías de poblaciones
```

### Notas Técnicas

- Servicios:
  - `getMetasProductividadCampesena()` → 4 nodos planos
  - `getMetasFullPopularCompleto()` → Árbol jerárquico
  - `getMetasPoblacionesVulnerables()` + `getJerarquiasPoblacionesVulnerables()`
- Construcción: `buildProductividadCampesenaNodes()`, `buildProductividadFullPopularNodes()`, `buildPoblacionesVulnerablesTree()`

### Definición de Hecho

- [x] Sección CampeSENA muestra 4 tarjetas
- [x] Sección Full Popular con árbol jerárquico funcional
- [x] Poblaciones Vulnerables con tabla expandible
- [x] Datos correctos y semáforos precisos
- [x] Responsive

---

## HU-004: Visualizar Dirección de Empleo y Trabajo

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-004 |
| **Épica** | EP-001 |
| **Prioridad** | Alta |
| **Estimación** | 9 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 2 |

### Historia

**Como** director de empleo y trabajo
**Quiero** visualizar métricas de agencia de empleo, emprendimiento y aprendizaje
**Para** evaluar el impacto en inserción laboral y emprendimiento

### Descripción Detallada

El tab debe mostrar:
- **Agencia Pública de Empleo:** 5 tarjetas de nivel 1 con tabla expandible
- **Cupos FIC:** Tarjeta principal con árbol jerárquico
- **Fondo Emprender:** 4 métricas planas
- **Contratos de Aprendizaje:** 4 métricas con una principal que tiene hijos

### Criterios de Aceptación

#### AC1: Visualización de Agencia Pública de Empleo
```gherkin
Given que navego al tab "Dirección de Empleo y Trabajo"
When la página carga
Then debo ver 5 tarjetas principales de la Agencia de Empleo
And cada tarjeta debe tener meta, ejecución y porcentaje
And debo poder hacer clic en cualquier tarjeta para ver sus detalles
```

#### AC2: Visualización de Cupos FIC
```gherkin
Given que estoy en el tab "Dirección de Empleo y Trabajo"
When scrolleo a la sección Cupos FIC
Then debo ver una tarjeta principal
And debo poder expandir para ver el árbol completo
And el árbol debe mostrar la jerarquía de cupos
```

#### AC3: Visualización de Fondo Emprender
```gherkin
Given que estoy en el tab "Dirección de Empleo y Trabajo"
When scrolleo a la sección Fondo Emprender
Then debo ver 4 tarjetas planas
And cada tarjeta debe mostrar métrica individual
And no debe haber jerarquía
```

#### AC4: Visualización de Contratos de Aprendizaje
```gherkin
Given que estoy en el tab "Dirección de Empleo y Trabajo"
When scrolleo a la sección Contratos de Aprendizaje
Then debo ver tarjetas de métricas
And la tarjeta "Total Aprendices" debe poder expandirse
And al expandir debo ver hijos (Aprendices SENA, Aprendices NO SENA)
```

### Notas Técnicas

- Servicios:
  - `getMetasAgenciaPublicaEmpleo()` + jerarquías → Nivel 1 para tarjetas
  - `getMetasCuposFIC()` + jerarquías → Árbol completo
  - `getMetasFondoEmprender()` → 4 nodos planos
  - `getMetasContratosAprendizaje()` → ID=3 como principal con hijos
- Construcción: `buildAgenciaPublicaEmpleoTree()`, `buildCuposFICTree()`, `buildFondoEmprenderNodes()`, `buildContratosAprendizajeNodes()`

### Definición de Hecho

- [x] Agencia de Empleo: 5 tarjetas + tablas expandibles
- [x] Cupos FIC: árbol jerárquico funcional
- [x] Fondo Emprender: 4 tarjetas planas
- [x] Contratos: tarjeta principal con hijos
- [x] Responsive y semáforos correctos

---

## HU-005: Buscar indicadores en dashboard

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-005 |
| **Épica** | EP-001 |
| **Prioridad** | Media |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** usuario del dashboard
**Quiero** buscar indicadores por nombre
**Para** encontrar rápidamente información específica sin navegar por todos los árboles

### Descripción Detallada

Implementar un campo de búsqueda que filtre todos los árboles jerárquicos y listas mostrando solo los elementos que coincidan con el término de búsqueda. La búsqueda debe ser case-insensitive y buscar en toda la jerarquía (padres e hijos).

### Criterios de Aceptación

#### AC1: Campo de búsqueda visible
```gherkin
Given que estoy en cualquier tab del dashboard
When observo la parte superior de la página
Then debo ver un campo de búsqueda con placeholder "Buscar indicador..."
And el campo debe ser accesible y fácil de usar
```

#### AC2: Filtrado de resultados
```gherkin
Given que hay datos cargados en el dashboard
When escribo un término en el campo de búsqueda (ej: "tecnólogo")
Then solo se muestran los nodos que contienen ese término en su descripción
And se muestran también los padres de nodos que coinciden
And los nodos que no coinciden son ocultados
```

#### AC3: Búsqueda recursiva en jerarquías
```gherkin
Given que busco un término que existe en un nodo hijo profundo
When ingreso el término de búsqueda
Then el nodo hijo se muestra
And todos sus ancestros (padres, abuelos) también se muestran
And hermanos que no coinciden son ocultados
```

#### AC4: Limpiar búsqueda
```gherkin
Given que tengo un término de búsqueda activo
When borro el texto del campo de búsqueda
Then todos los nodos vuelven a mostrarse
And el dashboard regresa a su estado original
```

#### AC5: Indicador visual de búsqueda activa
```gherkin
Given que tengo un término de búsqueda activo
When observo el campo de búsqueda
Then debo ver un botón "X" para limpiar
And debo ver algún indicador de que hay filtros activos
```

### Notas Técnicas

- Propiedad: `searchTerm: string`
- Métodos: `filterHierarchyNodes()`, `filterFormacionEstrategiaNodes()`, `filterProgramasRelevantes()`, `matchesSearchRecursive()`, `clearSearch()`
- Búsqueda case-insensitive con `.toLowerCase()`
- Filtrado recursivo que preserva ancestros
- Aplicado a todos los tipos de nodos (HierarchyNode, FormacionEstrategiaNode, ProgramaRelevante)

### Definición de Hecho

- [x] Campo de búsqueda visible en todos los tabs
- [x] Filtrado funcional en tiempo real
- [x] Búsqueda recursiva correcta
- [x] Botón limpiar funcional
- [x] Búsqueda case-insensitive
- [x] Performance aceptable (< 200ms)

---

## HU-006: Ver información contextual de secciones

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-006 |
| **Épica** | EP-001 / EP-005 |
| **Prioridad** | Media |
| **Estimación** | 3 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** usuario del dashboard
**Quiero** ver información de ayuda sobre cada sección
**Para** entender qué representa cada métrica y cómo se calcula

### Descripción Detallada

Cada sección del dashboard debe tener un botón de información (ℹ️) que al hacer clic muestra un diálogo con:
- Definición de la sección
- Fórmula de cálculo
- Fuente de datos
- Notas adicionales

### Criterios de Aceptación

#### AC1: Botón de información visible
```gherkin
Given que estoy en cualquier sección del dashboard
When observo el encabezado de la sección
Then debo ver un ícono de información (ℹ️)
And el ícono debe ser claramente visible y clicable
```

#### AC2: Abrir diálogo de información
```gherkin
Given que veo un botón de información en una sección
When hago clic en el botón
Then se abre un diálogo modal
And el diálogo muestra información relevante de esa sección
And el diálogo tiene un botón para cerrarlo
```

#### AC3: Contenido del diálogo
```gherkin
Given que abrí un diálogo de información
When leo el contenido
Then debo ver el título de la sección
And debo ver la definición de qué representa
And debo ver la fórmula de cálculo (si aplica)
And debo ver la fuente de datos
And debo ver notas adicionales (si existen)
```

#### AC4: Cerrar diálogo
```gherkin
Given que tengo un diálogo de información abierto
When hago clic en el botón "X" o fuera del diálogo
Then el diálogo se cierra
And vuelvo a la vista del dashboard
```

### Notas Técnicas

- Componente: `SeccionInfoDialogComponent`
- Servicio: `SeccionesInfoService.getSeccionInfoById(id)`
- Datos: `assets/data/secciones_info.json`
- Diálogo: Angular Material `MatDialog`
- Ancho: 600px, max 95vw, max height 90vh

### Definición de Hecho

- [x] Botones info en todas las secciones
- [x] Diálogos se abren correctamente
- [x] Información correcta por sección
- [x] Diálogo responsive
- [x] Cierre funcional (botón y clic fuera)

---

## HU-007: Seleccionar y visualizar datos de una regional

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-007 |
| **Épica** | EP-002 |
| **Prioridad** | Alta |
| **Estimación** | 8 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 4 |

### Historia

**Como** director regional
**Quiero** seleccionar mi regional y ver sus métricas
**Para** monitorear el cumplimiento de metas de mi región

### Descripción Detallada

La consulta regional debe permitir:
- Selector dropdown con todas las regionales
- Carga automática de datos al seleccionar
- Visualización de todas las tablas de métricas
- Indicadores de cumplimiento con semáforos

### Criterios de Aceptación

#### AC1: Selector de regional visible
```gherkin
Given que accedo a la página de Consulta Regional
When la página carga
Then debo ver un selector desplegable de regionales
And el selector debe mostrar todas las regionales disponibles
And debe haber una regional pre-seleccionada
```

#### AC2: Cargar datos al seleccionar
```gherkin
Given que veo el selector de regionales
When selecciono una regional diferente
Then los datos de esa regional se cargan automáticamente
And se muestran todas las tablas de métricas
And los semáforos se actualizan según los datos
```

#### AC3: Visualización de métricas
```gherkin
Given que he seleccionado una regional
When observo la página
Then debo ver la tabla principal de Formación Profesional Integral
And debo ver tablas adicionales (Retención, Certificación, etc.)
And cada tabla debe mostrar subcategoría, meta, ejecución y porcentaje
And los totales y subtotales deben estar destacados visualmente
```

#### AC4: Orden de subcategorías
```gherkin
Given que estoy viendo la tabla de FPI de una regional
When observo el orden de las filas
Then las subcategorías deben seguir el orden especificado
And los subtotales deben estar correctamente posicionados
And los totales deben estar al final de sus secciones
```

#### AC5: Indicador de carga
```gherkin
Given que cambio de regional
When los datos se están cargando
Then debo ver un indicador de carga
And el indicador debe desaparecer cuando la carga finaliza
```

### Notas Técnicas

- Componente: `ConsultaRegionalComponent`
- Método: `onRegionalChange()`
- Servicio: `XlsbApiService.getMetasRegional()`, `getEjecucionRegional()`
- Fallback: JSON local `seguimiento_metas_por_regional.json`
- Procesamiento: `procesarDatos()` con ordenamiento custom

### Definición de Hecho

- [x] Selector funcional con todas las regionales
- [x] Carga de datos al cambiar selección
- [x] Todas las tablas visibles y con datos correctos
- [x] Orden de subcategorías según especificación
- [x] Semáforos correctos
- [x] Indicador de carga visible durante proceso

---

## HU-008: Seleccionar y visualizar datos de un centro

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-008 |
| **Épica** | EP-002 |
| **Prioridad** | Alta |
| **Estimación** | 8 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 4 |

### Historia

**Como** coordinador de centro de formación
**Quiero** seleccionar mi centro y ver sus métricas
**Para** monitorear el cumplimiento de metas de mi centro

### Descripción Detallada

Después de seleccionar una regional, debe habilitarse un segundo selector para elegir un centro dentro de esa regional. Los datos del centro se muestran junto a los de la regional para comparación.

### Criterios de Aceptación

#### AC1: Selector de centro condicional
```gherkin
Given que he seleccionado una regional
When observo la interfaz
Then debo ver un segundo selector para centros
And el selector solo debe mostrar centros de la regional seleccionada
And debe incluir una opción "Ninguno" o "Seleccionar..."
```

#### AC2: Habilitar/deshabilitar selector
```gherkin
Given que no he seleccionado una regional
When observo el selector de centros
Then el selector debe estar deshabilitado

Given que selecciono una regional
When el selector se habilita
Then puedo seleccionar un centro
```

#### AC3: Cargar datos del centro
```gherkin
Given que he seleccionado una regional y un centro
When los datos se cargan
Then debo ver los datos de la regional en el lado izquierdo
And debo ver los datos del centro en el lado derecho
And ambos deben tener la misma estructura de tablas
```

#### AC4: Limpiar selección de centro
```gherkin
Given que tengo un centro seleccionado
When selecciono "Ninguno" en el selector de centros
Then los datos del centro desaparecen
And solo quedan visibles los datos de la regional
```

### Notas Técnicas

- Propiedad: `centroSeleccionado: number`
- Método: `onCentroChange()`
- Servicio: `XlsbApiService.getMetasCentros()`, `getEjecucionCentros()`
- Filtrado: Centros pertenecen a `centrosDisponibles` de regional actual
- Comparación: Dos columnas side-by-side

### Definición de Hecho

- [x] Selector de centro condicional funcional
- [x] Solo muestra centros de regional seleccionada
- [x] Carga de datos de centro correcta
- [x] Comparación lado a lado funcional
- [x] Limpieza de selección funcional

---

## HU-009: Comparar métricas regional vs centro

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-009 |
| **Épica** | EP-002 |
| **Prioridad** | Media-Alta |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 4 |

### Historia

**Como** director regional
**Quiero** comparar las métricas de la regional con las de un centro específico
**Para** identificar brechas y oportunidades de mejora

### Descripción Detallada

Cuando se seleccionan ambos (regional y centro), la interfaz debe mostrar ambos conjuntos de datos lado a lado, facilitando la comparación visual.

### Criterios de Aceptación

#### AC1: Disposición lado a lado
```gherkin
Given que he seleccionado una regional y un centro
When observo la interfaz
Then debo ver dos columnas de datos
And la columna izquierda muestra datos de la regional
And la columna derecha muestra datos del centro
And ambas columnas tienen el mismo ancho
```

#### AC2: Mismas categorías en ambas columnas
```gherkin
Given que estoy comparando regional vs centro
When observo las tablas
Then ambas columnas deben mostrar las mismas categorías
And en el mismo orden
And con la misma estructura (subtotales, totales)
```

#### AC3: Identificación visual de diferencias
```gherkin
Given que comparo regional vs centro
When observo los porcentajes
Then los semáforos deben reflejar el cumplimiento de cada uno
And puedo identificar rápidamente dónde el centro va mejor/peor que regional
```

#### AC4: Encabezados descriptivos
```gherkin
Given que estoy viendo la comparación
When observo los encabezados de las columnas
Then debo ver claramente el nombre de la regional
And debo ver claramente el nombre del centro
And debo poder diferenciarlos fácilmente
```

### Notas Técnicas

- Layout: Dos columnas con grid CSS
- Variables: `datosRegional` y `datosCentro`
- Mismo método de procesamiento: `procesarDatos()`
- Encabezados dinámicos con nombres de regional/centro

### Definición de Hecho

- [x] Disposición lado a lado funcional
- [x] Datos sincronizados en estructura
- [x] Encabezados descriptivos
- [x] Semáforos independientes
- [x] Responsive (apila en móvil)

---

## HU-010: Expandir colapsar tablas de métricas

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-010 |
| **Épica** | EP-002 |
| **Prioridad** | Media |
| **Estimación** | 3 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 4 |

### Historia

**Como** usuario de la consulta regional
**Quiero** poder expandir y colapsar las tablas de métricas
**Para** enfocarme solo en la información que me interesa en el momento

### Descripción Detallada

Cada sección de tabla (Formación, Retención, Certificación, etc.) debe poder colapsarse para ocultar su contenido, dejando solo el encabezado visible. Esto mejora la navegación cuando hay muchas tablas.

### Criterios de Aceptación

#### AC1: Botón de toggle visible
```gherkin
Given que veo una tabla de métricas
When observo el encabezado
Then debo ver un ícono o botón para expandir/colapsar
And el ícono debe indicar claramente el estado (expandido/colapsado)
```

#### AC2: Colapsar tabla
```gherkin
Given que una tabla está expandida
When hago clic en el botón de colapsar
Then el contenido de la tabla se oculta
And solo queda visible el encabezado
And el ícono cambia para indicar "colapsado"
```

#### AC3: Expandir tabla
```gherkin
Given que una tabla está colapsada
When hago clic en el botón de expandir
Then el contenido de la tabla se muestra
And el ícono cambia para indicar "expandido"
```

#### AC4: Estado inicial
```gherkin
Given que cargo la página de Consulta Regional
When la página termina de cargar
Then todas las tablas deben estar expandidas por defecto
And puedo colapsar las que no me interesan
```

### Notas Técnicas

- Propiedad: `tablasExpandidas: { [key: string]: boolean }`
- Método: `toggleTabla(tabla: string)`
- Directiva: `*ngIf` para mostrar/ocultar contenido
- Estado inicial: todas en `true`

### Definición de Hecho

- [x] Botones toggle en todas las tablas
- [x] Colapsar/expandir funcional
- [x] Ícono cambia según estado
- [x] Estado inicial: todas expandidas
- [x] Animación suave (opcional)

---

## HU-011: Visualizar semáforos de cumplimiento

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-011 |
| **Épica** | EP-002 |
| **Prioridad** | Media-Alta |
| **Estimación** | 3 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 4 |

### Historia

**Como** usuario de la consulta regional
**Quiero** ver semáforos de cumplimiento en las métricas
**Para** identificar rápidamente áreas con buen y mal desempeño

### Descripción Detallada

Cada fila de las tablas debe mostrar un badge de color (verde/amarillo/rojo) según el porcentaje de cumplimiento, facilitando la identificación visual rápida de alertas.

### Criterios de Aceptación

#### AC1: Semáforo verde para buen cumplimiento
```gherkin
Given que una métrica tiene cumplimiento >= 90%
When observo la fila de esa métrica
Then debo ver un badge verde
And el badge debe contener el porcentaje
```

#### AC2: Semáforo amarillo para cumplimiento medio
```gherkin
Given que una métrica tiene cumplimiento entre 70% y 89%
When observo la fila de esa métrica
Then debo ver un badge amarillo
And el badge debe contener el porcentaje
```

#### AC3: Semáforo rojo para bajo cumplimiento
```gherkin
Given que una métrica tiene cumplimiento < 70%
When observo la fila de esa métrica
Then debo ver un badge rojo
And el badge debe contener el porcentaje
```

#### AC4: Visibilidad de semáforos
```gherkin
Given que estoy viendo una tabla de métricas
When escaneo visualmente la tabla
Then puedo identificar rápidamente las filas con problemas (rojas)
And las filas con buen desempeño (verdes)
```

### Notas Técnicas

- Método: `getBadgeClass(porcentaje: number)`
- Clases CSS: `badge-success`, `badge-warning`, `badge-danger`
- Umbrales: Verde ≥90%, Amarillo 70-89%, Rojo <70%
- Colores SENA: Verde `#4CAF50`, Amarillo `#FFC107`, Rojo `#F44336`

### Definición de Hecho

- [x] Badges visibles en todas las filas
- [x] Colores correctos según umbral
- [x] Porcentaje mostrado en badge
- [x] Contraste adecuado (texto legible)
- [x] Responsive

---

## HU-012: Cargar datos desde API REST

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-012 |
| **Épica** | EP-003 |
| **Prioridad** | Crítica |
| **Estimación** | 8 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** sistema
**Quiero** cargar datos desde la API REST MongoDB
**Para** tener información actualizada y centralizada

### Descripción Detallada

Los servicios deben conectarse a la API REST externa para obtener datos de metas y ejecuciones. La carga debe ser eficiente usando peticiones paralelas.

### Criterios de Aceptación

#### AC1: Conexión exitosa a API
```gherkin
Given que la API REST está disponible
When el componente se inicializa
Then se realizan peticiones HTTP a los endpoints correctos
And se reciben respuestas JSON válidas
And los datos se cargan en la aplicación
```

#### AC2: Carga paralela de datos
```gherkin
Given que necesito cargar múltiples conjuntos de datos
When inicio la carga
Then todas las peticiones se realizan en paralelo usando forkJoin
And el tiempo total es menor que la suma de tiempos individuales
```

#### AC3: Logging de origen de datos
```gherkin
Given que los datos se cargan desde la API
When observo la consola del navegador
Then debo ver logs que indican "Cargando desde API"
And debo ver logs de éxito con cantidad de registros
```

### Notas Técnicas

- Servicios: `MongoDBService`, `XlsbApiService`
- RxJS: `forkJoin` para paralelismo
- Endpoints: Ver configuración en `environment.ts` o `service.ts`
- Timeout: 30 segundos por defecto

### Definición de Hecho

- [x] Servicios implementados
- [x] Peticiones HTTP funcionales
- [x] Carga paralela con forkJoin
- [x] Datos mapeados correctamente
- [x] Logs informativos

---

## HU-013: Aplicar fallback a JSON cuando API falla

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-013 |
| **Épica** | EP-003 |
| **Prioridad** | Crítica |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** sistema
**Quiero** aplicar fallback automático a archivos JSON locales cuando la API falla
**Para** garantizar disponibilidad del sistema incluso si la API está caída

### Descripción Detallada

Cuando cualquier petición a la API falla (timeout, error de red, API caída), el sistema debe automáticamente cargar los mismos datos desde archivos JSON locales sin mostrar error al usuario.

### Criterios de Aceptación

#### AC1: Detección de falla de API
```gherkin
Given que la API REST no está disponible
When intento cargar datos
Then el sistema detecta el error
And no se muestra error al usuario
And se activa el fallback automático
```

#### AC2: Carga desde JSON local
```gherkin
Given que el fallback se activó
When el sistema intenta obtener datos
Then carga los datos desde archivos JSON en assets/data/
And los datos se procesan de la misma manera que datos de API
And la interfaz funciona normalmente
```

#### AC3: Logging de fallback
```gherkin
Given que se activó el fallback
When observo la consola del navegador
Then debo ver un warning indicando que la API falló
And debo ver un log indicando "Cargando desde JSON"
And puedo entender que los datos provienen del fallback
```

#### AC4: Transparencia para el usuario
```gherkin
Given que el sistema usa fallback
When uso la aplicación
Then no noto diferencia en funcionalidad
And no veo mensajes de error
And la experiencia es idéntica a usar API
```

### Notas Técnicas

- Operador RxJS: `catchError(err => of([]))`
- Log: `console.warn()` para advertencias
- Fallback en componentes: método `cargarDesdeJSON()`
- Archivos en: `assets/data/*.json`

### Definición de Hecho

- [x] Fallback implementado en todos los servicios
- [x] Carga desde JSON funcional
- [x] Logs de advertencia presentes
- [x] Usuario no ve errores
- [x] Funcionalidad idéntica con ambas fuentes

---

## HU-014: Transformar datos para visualización

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-014 |
| **Épica** | EP-003 |
| **Prioridad** | Alta |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** sistema
**Quiero** transformar datos de diferentes fuentes a un formato común
**Para** que los componentes puedan consumirlos de forma consistente

### Descripción Detallada

Los datos provenientes de API y JSON pueden tener formatos diferentes. El sistema debe normalizarlos, calcular campos derivados (porcentajes, subtotales) y ordenarlos según especificaciones.

### Criterios de Aceptación

#### AC1: Normalización de estructura
```gherkin
Given que recibo datos de una fuente (API o JSON)
When los datos pasan por el transformador
Then se convierten a una estructura común
And tienen los mismos campos independiente del origen
```

#### AC2: Cálculo de campos derivados
```gherkin
Given que tengo datos de meta y ejecución
When se transforman
Then se calcula el porcentaje de cumplimiento
And se calculan subtotales cuando no existen
And se agregan campos de visualización (nivel, indentación)
```

#### AC3: Ordenamiento según especificación
```gherkin
Given que transformo datos de formación por nivel
When se procesan
Then se ordenan según el array de especificación
And los subtotales quedan en posiciones correctas
And los totales al final de sus secciones
```

### Notas Técnicas

- Servicio: `DataTransformerService`
- Métodos: `transformarMetasParaComponente()`, `ordenarSeguimiento()`
- Cálculos: `porcentaje = (ejecucion / meta) * 100`
- Orden: Array `ordenSubcategorias`

### Definición de Hecho

- [x] Transformador implementado
- [x] Normalización funcional
- [x] Cálculos correctos
- [x] Ordenamiento según especificación
- [x] Tests (si aplica)

---

## HU-015: Manejar errores de integración

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-015 |
| **Épica** | EP-003 |
| **Prioridad** | Media |
| **Estimación** | 4 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** sistema
**Quiero** manejar errores de integración de forma robusta
**Para** evitar que la aplicación se rompa ante fallos de red o datos

### Descripción Detallada

Implementar manejo de errores comprehensivo que capture errores de red, timeout, datos malformados, etc., y los maneje sin romper la aplicación.

### Criterios de Aceptación

#### AC1: Captura de errores HTTP
```gherkin
Given que ocurre un error en una petición HTTP
When el error se detecta
Then se captura con try-catch o catchError
And se loguea en consola
And no se propaga al usuario
```

#### AC2: Manejo de datos faltantes
```gherkin
Given que una respuesta de API está vacía o malformada
When se procesan los datos
Then se manejan valores null/undefined
And se asignan valores por defecto cuando es necesario
And no se generan errores de runtime
```

#### AC3: Logs descriptivos
```gherkin
Given que ocurre un error
When se loguea
Then el log contiene descripción del error
And indica en qué servicio/método ocurrió
And ayuda a debugging
```

### Notas Técnicas

- RxJS: `catchError()`, `of()`
- Logging: `console.error()`, `console.warn()`
- Valores default: Arrays vacíos `[]`, objetos vacíos `{}`
- Chequeos: `if (!data || data.length === 0)`

### Definición de Hecho

- [x] Try-catch en operaciones críticas
- [x] catchError en observables
- [x] Logs descriptivos
- [x] No hay errores no capturados
- [x] Aplicación no se rompe ante errores

---

## HU-016: Exportar datos de regional a Excel

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-016 |
| **Épica** | EP-004 |
| **Prioridad** | Alta |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 5 |

### Historia

**Como** director regional
**Quiero** exportar los datos de mi regional a Excel
**Para** incluirlos en reportes y presentaciones

### Descripción Detallada

Generar archivo Excel con los datos de la regional seleccionada, aplicando formato institucional SENA.

### Criterios de Aceptación

#### AC1: Botón de exportación visible
```gherkin
Given que he seleccionado una regional
When observo la interfaz
Then debo ver un botón "Exportar Solo Regional"
And el botón debe estar habilitado
```

#### AC2: Generación de archivo
```gherkin
Given que hago clic en "Exportar Solo Regional"
When el sistema procesa la solicitud
Then se genera un archivo Excel
And el archivo se descarga automáticamente
And el nombre incluye el nombre de la regional y timestamp
```

#### AC3: Contenido del archivo
```gherkin
Given que abro el archivo exportado
When reviso el contenido
Then debo ver una hoja con el nombre de la regional
And debo ver todas las métricas de FPI
And debo ver columnas: Subcategoría, Meta, Ejecución, Porcentaje
And los datos deben coincidir con los mostrados en pantalla
```

#### AC4: Formato aplicado
```gherkin
Given que abro el archivo exportado
When observo el formato
Then debo ver encabezados con fondo naranja SENA
And texto blanco en encabezados
And subtotales destacados con fondo gris
And totales destacados con fondo gris oscuro
```

### Notas Técnicas

- Servicio: `ExportarExcelService.exportarSeguimientoMetas()`
- Librería: ExcelJS
- Parámetro: `soloRegional = true`
- Nombre archivo: `Seguimiento_Metas_[REGIONAL]_[TIMESTAMP].xlsx`

### Definición de Hecho

- [x] Botón funcional
- [x] Archivo se descarga
- [x] Datos correctos
- [x] Formato aplicado
- [x] Compatible con Excel

---

## HU-017: Exportar datos de regional y centro a Excel

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-017 |
| **Épica** | EP-004 |
| **Prioridad** | Alta |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 5 |

### Historia

**Como** coordinador de centro
**Quiero** exportar los datos de mi regional y mi centro juntos
**Para** comparar ambos en un solo archivo

### Descripción Detallada

Generar archivo Excel con dos hojas: una para la regional y otra para el centro seleccionado.

### Criterios de Aceptación

#### AC1: Botón de exportación habilitado
```gherkin
Given que he seleccionado una regional y un centro
When observo la interfaz
Then debo ver un botón "Exportar Regional + Centro"
And el botón debe estar habilitado
```

#### AC2: Generación de archivo con dos hojas
```gherkin
Given que hago clic en "Exportar Regional + Centro"
When se genera el archivo
Then el archivo debe contener 2 hojas
And la primera hoja tiene datos de la regional
And la segunda hoja tiene datos del centro
```

#### AC3: Validación de centro seleccionado
```gherkin
Given que no he seleccionado un centro
When intento exportar regional + centro
Then debo ver un mensaje de advertencia
And el archivo no se genera
And me indica que debo seleccionar un centro
```

### Notas Técnicas

- Parámetro: `soloRegional = false`
- Validación: `if (centroSeleccionado === 0)`
- Nombre archivo: `Seguimiento_Metas_[REGIONAL]_[CENTRO]_[TIMESTAMP].xlsx`
- Hojas: `[NOMBRE_REGIONAL]`, `[NOMBRE_CENTRO]`

### Definición de Hecho

- [x] Botón funcional
- [x] Validación de centro seleccionado
- [x] Archivo con 2 hojas
- [x] Datos correctos en ambas hojas
- [x] Formato aplicado en ambas hojas

---

## HU-018: Aplicar formato institucional a reportes

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-018 |
| **Épica** | EP-004 |
| **Prioridad** | Media |
| **Estimación** | 5 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 5 |

### Historia

**Como** usuario que exporta reportes
**Quiero** que los archivos Excel tengan el formato institucional SENA
**Para** que sean presentables y profesionales

### Descripción Detallada

Los archivos Excel deben tener:
- Colores SENA (naranja y negro)
- Formato numérico apropiado
- Bordes y alineación
- Ancho de columnas ajustado

### Criterios de Aceptación

#### AC1: Encabezados con estilo SENA
```gherkin
Given que abro un archivo exportado
When observo la fila de encabezados
Then debo ver fondo naranja (#FF5722)
And texto blanco
And negrita
And alineación centrada
```

#### AC2: Formato de totales y subtotales
```gherkin
Given que observo las filas de totales y subtotales
When las identifico en el archivo
Then los subtotales tienen fondo gris claro
And los totales tienen fondo gris oscuro
And ambos están en negrita
```

#### AC3: Formato numérico
```gherkin
Given que observo las columnas numéricas
When reviso meta y ejecución
Then tienen separador de miles
And están alineadas a la derecha

When reviso la columna porcentaje
Then tiene formato de porcentaje con 2 decimales
```

### Notas Técnicas

- ExcelJS: `cell.fill`, `cell.font`, `cell.border`, `cell.alignment`
- Colores: Naranja `FF5722`, Negro `212121`, Grises
- Formato: `numFmt: '#,##0'` para números, `'0.00%'` para porcentajes
- Ancho columnas: Ajustado automáticamente

### Definición de Hecho

- [x] Colores institucionales aplicados
- [x] Formato numérico correcto
- [x] Bordes visibles
- [x] Ancho de columnas adecuado
- [x] Archivo presentable

---

## HU-019: Ver información contextual de una sección

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-019 |
| **Épica** | EP-005 |
| **Prioridad** | Media |
| **Estimación** | 3 puntos |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

**Ver detalles en HU-006** (duplicada conceptualmente, documentada en EP-001 y EP-005)

---

## HU-020: Cerrar diálogo de información

### Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | HU-020 |
| **Épica** | EP-005 |
| **Prioridad** | Baja |
| **Estimación** | 1 punto |
| **Estado** | Completado |
| **Sprint** | Sprint 3 |

### Historia

**Como** usuario que abrió un diálogo de información
**Quiero** poder cerrarlo fácilmente
**Para** volver a la vista del dashboard

### Descripción Detallada

El diálogo de información debe poder cerrarse mediante:
- Botón X en la esquina
- Clic fuera del diálogo
- Tecla ESC

### Criterios de Aceptación

#### AC1: Cerrar con botón X
```gherkin
Given que tengo un diálogo de información abierto
When hago clic en el botón X
Then el diálogo se cierra
And vuelvo a ver el dashboard
```

#### AC2: Cerrar con clic fuera
```gherkin
Given que tengo un diálogo abierto
When hago clic fuera del diálogo (en el backdrop)
Then el diálogo se cierra automáticamente
```

#### AC3: Cerrar con tecla ESC
```gherkin
Given que tengo un diálogo abierto
When presiono la tecla ESC
Then el diálogo se cierra
```

### Notas Técnicas

- MatDialog configuración: `restoreFocus: true`, `autoFocus: true`
- Cierre automático con backdrop click (comportamiento default)
- ESC key support (comportamiento default de MatDialog)

### Definición de Hecho

- [x] Botón X funcional
- [x] Clic fuera cierra
- [x] ESC cierra
- [x] Foco restaurado correctamente

---

## Resumen de Historias de Usuario

### Por Épica

| Épica | Cantidad HU | Puntos Totales | Estado |
|-------|-------------|----------------|--------|
| EP-001 | 6 | 48 | Completado |
| EP-002 | 5 | 27 | Completado |
| EP-003 | 4 | 22 | Completado |
| EP-004 | 3 | 15 | Completado |
| EP-005 | 2 | 4 | Completado |
| **TOTAL** | **20** | **116** | |

### Por Prioridad

| Prioridad | Cantidad | Puntos |
|-----------|----------|--------|
| Alta | 9 | 69 |
| Media-Alta | 2 | 8 |
| Media | 6 | 27 |
| Baja | 1 | 1 |
| Crítica | 2 | 13 |

### Por Estado

| Estado | Cantidad |
|--------|----------|
| Completado | 20 |
| En Progreso | 0 |
| Por Hacer | 0 |

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | 2025-12-10 | Equipo SENA | Historias de usuario de componentes en fase de liberación |

---

## Referencias

- Ver `EPICAS.md` para contexto de épicas
- Ver `INICIATIVA.md` para objetivos generales
- Ver `METODOLOGIA_AGIL_ESTRUCTURA.md` para estructura de documentación
- Ver código fuente en `src/app/` para implementación técnica
