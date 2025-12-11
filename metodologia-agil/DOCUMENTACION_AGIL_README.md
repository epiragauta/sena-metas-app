# Documentación Ágil - Índice General

## Sistema de Seguimiento de Metas SENA

**Versión:** 1.0.0
**Fecha:** 2025-12-10
**Estado:** Componentes en Fase de Liberación

---

## Bienvenida

Este directorio contiene la documentación completa del **primer módulo del Sistema Integrado de Información Estadística del SENA (SIIES)**: el **Sistema de Seguimiento de Metas**, utilizando metodología ágil.

Este módulo representa una **victoria temprana** del SIIES, automatizando tareas operativas del Grupo de Gestión de Información y Evaluación de Resultados (GGIER) y estableciendo patrones arquitectónicos y de visualización para el ecosistema completo de soluciones estadísticas del SENA.

La documentación está organizada jerárquicamente desde objetivos estratégicos hasta requisitos técnicos detallados.

---

## Estructura de la Documentación

La documentación sigue una jerarquía de 3 niveles:

```
📋 INICIATIVA (Estrategia y Objetivos de Negocio)
  └── 📦 ÉPICAS (Agrupaciones de Funcionalidades)
       └── 📝 HISTORIAS DE USUARIO (Requisitos Detallados)
```

---

## Documentos Principales

### 0. 🌐 Contexto del SIIES
**Archivo:** [`CONTEXTO_SIIES.md`](./CONTEXTO_SIIES.md)

**Propósito:** Describe el ecosistema del Sistema Integrado de Información Estadística (SIIES) y posiciona este módulo como la primera victoria temprana.

**Contenido:**
- ¿Qué es el SIIES y por qué existe?
- Diagnóstico integral que motivó su creación
- Hallazgos principales sobre fragmentación de datos
- Estrategia de implementación modular 2025-2027
- Rol de este módulo en el ecosistema
- Automatización de tareas del GGIER
- Patrones arquitectónicos establecidos
- Próximos módulos planificados

**¿Cuándo leerlo?** PRIMERO, para entender el contexto institucional completo antes de profundizar en la metodología ágil.

**Audiencia:** Todos los roles - proporciona contexto estratégico esencial

---

### 1. 📘 Metodología Ágil - Estructura
**Archivo:** [`METODOLOGIA_AGIL_ESTRUCTURA.md`](./METODOLOGIA_AGIL_ESTRUCTURA.md)

**Propósito:** Describe la organización general de la documentación ágil, convenciones utilizadas y estructura jerárquica.

**Contenido:**
- Información general del proyecto
- Explicación de la jerarquía Iniciativa → Épicas → Historias
- Componentes documentados
- Fuentes de datos
- Stack tecnológico
- Patrones de arquitectura
- Definición de "Done"

**¿Cuándo leerlo?** Primero, para entender cómo está organizada toda la documentación.

---

### 2. 🎯 Iniciativa del Proyecto
**Archivo:** [`INICIATIVA.md`](./INICIATIVA.md)

**Propósito:** Define el objetivo estratégico del proyecto, problema de negocio, beneficios esperados y visión de alto nivel.

**Contenido:**
- Descripción ejecutiva
- Problema de negocio que se resuelve
- Objetivos estratégicos (general y específicos)
- Alcance (in-scope y out-of-scope)
- KPIs de éxito
- Stakeholders clave
- Beneficios cuantitativos y cualitativos
- Riesgos y mitigación
- Cronograma de alto nivel
- Presupuesto y recursos

**¿Cuándo leerlo?** Para entender el "por qué" del proyecto, el contexto de negocio y los objetivos estratégicos.

**Audiencia:** Directivos, Product Owners, Patrocinadores

---

### 3. 📦 Épicas
**Archivo:** [`EPICAS.md`](./EPICAS.md)

**Propósito:** Describe las 5 épicas principales que agrupan funcionalidades del sistema.

**Contenido:**

#### Épicas Documentadas:

1. **EP-001: Dashboard Nacional de Seguimiento** (40 puntos)
   - Visualización de 4 áreas temáticas
   - Búsqueda de indicadores
   - Información contextual

2. **EP-002: Consulta Regional y por Centros** (30 puntos)
   - Selección de regional y centro
   - Comparación de métricas
   - Tablas expandibles/colapsables

3. **EP-003: Integración con Fuentes de Datos** (25 puntos)
   - API REST MongoDB
   - Fallback a JSON local
   - Transformación de datos

4. **EP-004: Exportación y Reportería** (15 puntos)
   - Exportación a Excel
   - Formato institucional
   - Múltiples opciones

5. **EP-005: Gestión de Información Contextual** (10 puntos)
   - Diálogos de ayuda
   - Información por sección

**¿Cuándo leerlo?** Para entender las grandes áreas funcionales del sistema y su organización.

**Audiencia:** Product Owners, Líderes Técnicos, Desarrolladores

---

### 4. 📝 Historias de Usuario
**Archivo:** [`HISTORIAS_USUARIO.md`](./HISTORIAS_USUARIO.md)

**Propósito:** Detalla las 20 historias de usuario con criterios de aceptación en formato Given-When-Then.

**Contenido:**

#### Historias por Épica:

**EP-001 - Dashboard Nacional (6 HU):**
- HU-001: Visualizar metas de Formación Profesional Integral
- HU-002: Visualizar Sistema Nacional de Formación para el Trabajo
- HU-003: Visualizar CampeSENA y Full Popular
- HU-004: Visualizar Dirección de Empleo y Trabajo
- HU-005: Buscar indicadores en dashboard
- HU-006: Ver información contextual de secciones

**EP-002 - Consulta Regional (5 HU):**
- HU-007: Seleccionar y visualizar datos de una regional
- HU-008: Seleccionar y visualizar datos de un centro
- HU-009: Comparar métricas regional vs centro
- HU-010: Expandir/colapsar tablas de métricas
- HU-011: Visualizar semáforos de cumplimiento

**EP-003 - Integración de Datos (4 HU):**
- HU-012: Cargar datos desde API REST
- HU-013: Aplicar fallback a JSON cuando API falla
- HU-014: Transformar datos para visualización
- HU-015: Manejar errores de integración

**EP-004 - Exportación (3 HU):**
- HU-016: Exportar datos de regional a Excel
- HU-017: Exportar datos de regional y centro a Excel
- HU-018: Aplicar formato institucional a reportes

**EP-005 - Información Contextual (2 HU):**
- HU-019: Ver información contextual de una sección
- HU-020: Cerrar diálogo de información

**Cada historia incluye:**
- ID único
- Prioridad y estimación
- Historia en formato "Como... Quiero... Para..."
- Criterios de aceptación en formato Given-When-Then
- Notas técnicas (componentes, servicios involucrados)
- Definición de "Hecho"

**¿Cuándo leerlo?** Para entender requisitos específicos, criterios de aceptación y detalles de implementación.

**Audiencia:** Desarrolladores, QA, Product Owners

---

## Componentes Documentados

Esta versión de la documentación cubre únicamente los componentes en **estado de liberación**:

### ✅ Dashboard Nacional
- **Componente:** `national-dashboard.component.ts`
- **Ruta:** `/dashboard-nacional`
- **Descripción:** Visualización ejecutiva de todas las metas a nivel nacional
- **Épica:** EP-001
- **Historias:** HU-001, HU-002, HU-003, HU-004, HU-005, HU-006

### ✅ Consulta Regional
- **Componente:** `consulta-regional.component.ts`
- **Ruta:** `/consulta-regional`
- **Descripción:** Consulta de métricas por regional y centro de formación
- **Épica:** EP-002
- **Historias:** HU-007, HU-008, HU-009, HU-010, HU-011

---

## Fuentes de Datos Documentadas

### API REST MongoDB
**Ubicación:** `C:\ws\sena\data\seguimiento_metas\sena-metas-procesador`

**Endpoints principales:**
- `/api/arbol-fpi-con-ejecuciones` - Árbol FPI con ejecuciones
- `/api/arbol-retencion-con-ejecuciones` - Árbol retención
- `/api/arbol-certificacion-con-ejecuciones` - Árbol certificación
- `/api/metas-regional` - Metas por regional
- `/api/metas-centros` - Metas por centro
- `/api/ejecucion-regional` - Ejecuciones regionales
- `/api/ejecucion-centros` - Ejecuciones por centro

### Archivos JSON Locales (Fallback)
**Ubicación:** `src/assets/data/`

**Principales archivos:**
- `metas_fpi.json`, `jerarquias.json`
- `formacion_por_nivel.json`
- `formacion_por_estrategia.json`
- `metas_*` (múltiples archivos por dominio)
- `jerarquias_*` (archivos de relaciones jerárquicas)
- `seguimiento_metas_por_regional.json`

---

## Métricas del Proyecto

### Épicas
- **Total:** 5 épicas
- **Completadas:** 5 (100%)
- **Puntos totales:** 120

### Historias de Usuario
- **Total:** 20 historias
- **Completadas:** 20 (100%)
- **Puntos totales:** 116

### Distribución por Prioridad
| Prioridad | Cantidad | Puntos |
|-----------|----------|--------|
| Crítica | 2 | 13 |
| Alta | 9 | 69 |
| Media-Alta | 2 | 8 |
| Media | 6 | 27 |
| Baja | 1 | 1 |

---

## Guía de Navegación

### Para Directivos y Product Owners
**Lectura recomendada:**
1. [`CONTEXTO_SIIES.md`](./CONTEXTO_SIIES.md) - **EMPEZAR AQUÍ** - Ecosistema SIIES completo
2. [`INICIATIVA.md`](./INICIATIVA.md) - Visión estratégica del módulo
3. [`EPICAS.md`](./EPICAS.md) - Resumen de funcionalidades principales
4. Resumen de estado (este archivo)

### Para Líderes Técnicos y Arquitectos
**Lectura recomendada:**
1. [`CONTEXTO_SIIES.md`](./CONTEXTO_SIIES.md) - **EMPEZAR AQUÍ** - Patrones arquitectónicos del SIIES
2. [`METODOLOGIA_AGIL_ESTRUCTURA.md`](./METODOLOGIA_AGIL_ESTRUCTURA.md) - Arquitectura y tecnologías del módulo
3. [`EPICAS.md`](./EPICAS.md) - Componentes técnicos por épica
4. [`INICIATIVA.md`](./INICIATIVA.md) - Alcance y dependencias

### Para Desarrolladores
**Lectura recomendada:**
1. [`CONTEXTO_SIIES.md`](./CONTEXTO_SIIES.md) - **EMPEZAR AQUÍ** - Patrones a replicar
2. [`HISTORIAS_USUARIO.md`](./HISTORIAS_USUARIO.md) - Requisitos detallados
3. [`EPICAS.md`](./EPICAS.md) - Contexto de funcionalidades
4. [`METODOLOGIA_AGIL_ESTRUCTURA.md`](./METODOLOGIA_AGIL_ESTRUCTURA.md) - Patrones y convenciones

### Para QA / Testers
**Lectura recomendada:**
1. [`HISTORIAS_USUARIO.md`](./HISTORIAS_USUARIO.md) - Criterios de aceptación
2. [`EPICAS.md`](./EPICAS.md) - Criterios de aceptación de alto nivel
3. [`CONTEXTO_SIIES.md`](./CONTEXTO_SIIES.md) - Objetivos de automatización
4. Definición de "Done" en [`METODOLOGIA_AGIL_ESTRUCTURA.md`](./METODOLOGIA_AGIL_ESTRUCTURA.md)

---

## Tecnologías y Herramientas

### Frontend
- **Framework:** Angular 17 (Standalone Components)
- **UI:** Angular Material 17
- **Lenguaje:** TypeScript 5.4+
- **Manejo de Estado:** RxJS 7.8

### Backend/API
- **Runtime:** Node.js + Express
- **Base de Datos:** MongoDB
- **Protocolo:** REST API

### Librerías Especiales
- **ExcelJS 4.4** - Generación de archivos Excel
- **OpenLayers 10.6** - Mapas (componentes futuros)

### Herramientas de Desarrollo
- **Angular CLI 17**
- **Git** para versionamiento
- **npm** para gestión de dependencias

---

## Definición de "Listo" (Definition of Done)

Una historia de usuario se considera **COMPLETADA** cuando:

- ✅ Código implementado y funcional
- ✅ Criterios de aceptación validados
- ✅ Code review completado
- ✅ Pruebas unitarias ejecutadas (si aplica)
- ✅ Pruebas de integración pasadas
- ✅ Documentación técnica actualizada
- ✅ Demo exitosa al Product Owner
- ✅ Deploy a ambiente de pruebas

---

## Próximos Pasos

### Componentes Futuros (No documentados aún)

Los siguientes componentes están en desarrollo pero no están incluidos en esta versión de documentación:

- Otros componentes de páginas
- Visualización geográfica con mapas
- Módulo de administración

Estos se documentarán en futuras iteraciones del proyecto.

### Épicas Futuras (Backlog)

| ID | Nombre | Prioridad | Estado |
|----|--------|-----------|--------|
| EP-006 | Visualización Geográfica con Mapas | Media | 📋 Planificado |
| EP-007 | Gestión de Usuarios y Permisos | Baja | 📋 Planificado |
| EP-008 | Alertas y Notificaciones | Media | 💭 Ideación |
| EP-009 | Análisis Predictivo | Baja | 💭 Ideación |
| EP-010 | Módulo de Configuración de Metas | Media | 📋 Planificado |

---

## Glosario

**Términos importantes:**

- **FPI:** Formación Profesional Integral
- **CampeSENA:** Programa especial del SENA para formación en áreas rurales
- **Full Popular:** Programa de formación popular del SENA
- **Regional:** División administrativa del SENA (33 regionales en Colombia)
- **Centro:** Centro de Formación del SENA (múltiples por regional)
- **Semáforo:** Sistema de colores para indicar nivel de cumplimiento (verde/amarillo/rojo)
- **Drill-down:** Navegación jerárquica desde datos agregados hacia datos detallados
- **Fallback:** Mecanismo de respaldo cuando falla fuente principal

---

## Contacto y Soporte

Para dudas sobre esta documentación o el proyecto:

- **Product Owner:** Dirección de Formación Profesional Integral SENA
- **Equipo de Desarrollo:** [Contacto del equipo técnico]
- **Repositorio:** [URL del repositorio de código]
- **Wiki Técnica:** [URL de wiki si existe]

---

## Control de Versiones de Documentación

| Versión | Fecha | Cambios Principales |
|---------|-------|---------------------|
| 1.0.0 | 2025-12-10 | Versión inicial - Documentación de Dashboard Nacional y Consulta Regional |

---

## Archivos de Referencia Adicional

Además de los 4 documentos principales de metodología ágil, el proyecto incluye:

- **README.md** - Instrucciones de instalación y ejecución
- **README_FULL.md** - Documentación técnica extendida (si existe)
- **ROUTING.md** - Configuración de rutas de la aplicación
- **ACTIVIDADES_*.md** - Bitácoras de desarrollo
- **FASE_*_COMPLETADA.md** - Documentación de fases completadas
- **TABLAS_*.md** - Especificación de tablas y datos

---

## Notas Finales

Esta documentación representa el estado del proyecto al **2025-12-10**.

Los componentes **Dashboard Nacional** y **Consulta Regional** están en **estado de liberación** y listos para producción.

Para información sobre otros componentes del sistema, consultar documentación futura o contactar al equipo de desarrollo.

---

**Última actualización:** 2025-12-10
**Mantenido por:** Equipo de Desarrollo SENA
