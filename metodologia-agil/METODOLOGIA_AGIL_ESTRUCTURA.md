# Metodología Ágil - Estructura del Proyecto

## Información General del Proyecto

**Nombre:** Sistema de Seguimiento de Metas SENA - Módulo SIIES
**Código:** SENA-METAS-APP / SIIES-MOD-001
**Versión:** 1.0.0
**Estado:** En Desarrollo - Fase de Liberación
**Fecha de Inicio:** 2025
**Última Actualización:** Diciembre 2025

**Contexto Institucional:**
- **Ecosistema:** Sistema Integrado de Información Estadística del SENA (SIIES)
- **Posición:** Primer módulo del SIIES - Victoria temprana
- **Área Responsable:** Grupo de Gestión de Información y Evaluación de Resultados (GGIER)
- **Dirección:** Dirección de Planeación y Direccionamiento Corporativo

---

## Estructura de la Metodología Ágil

Este documento describe la organización jerárquica de la documentación ágil del proyecto, siguiendo el esquema:

```
INICIATIVA
  └── ÉPICAS
       └── HISTORIAS DE USUARIO
            └── TAREAS TÉCNICAS
```

### 1. Iniciativa

**Documento:** `INICIATIVA.md`

La iniciativa representa el objetivo de negocio de más alto nivel. Define el propósito estratégico del sistema y su valor para el SENA.

**Contenido:**
- Descripción ejecutiva
- Problema de negocio
- Objetivos estratégicos
- Indicadores de éxito (KPIs)
- Stakeholders clave
- Alcance general

### 2. Épicas

**Documento:** `EPICAS.md`

Las épicas son agrupaciones de funcionalidades que representan áreas importantes del sistema. Cada épica contribuye directamente a la iniciativa.

**Contenido por Épica:**
- Identificador único
- Descripción
- Objetivos específicos
- Criterios de aceptación de alto nivel
- Dependencias
- Estimación de esfuerzo
- Prioridad

**Épicas Identificadas:**
1. Dashboard Nacional de Seguimiento
2. Consulta Regional y por Centros
3. Integración con Fuentes de Datos
4. Exportación y Reportería
5. Gestión de Información Contextual

### 3. Historias de Usuario

**Documento:** `HISTORIAS_USUARIO.md`

Las historias de usuario describen funcionalidades específicas desde la perspectiva del usuario. Siguen el formato estándar ágil.

**Formato:**
```
Como [tipo de usuario]
Quiero [acción/funcionalidad]
Para [beneficio/objetivo]
```

**Contenido por Historia:**
- ID único
- Épica asociada
- Descripción (formato estándar)
- Criterios de aceptación (Given-When-Then)
- Prioridad (Alta/Media/Baja)
- Estimación (puntos de historia)
- Estado (Por Hacer/En Progreso/Completado)
- Dependencias
- Notas técnicas

### 4. Tareas Técnicas

Las tareas técnicas son actividades de implementación específicas derivadas de las historias de usuario.

**Contenido por Tarea:**
- ID único
- Historia de usuario asociada
- Descripción técnica
- Componentes afectados
- Estimación (horas)
- Estado
- Responsable

---

## Componentes Principales Documentados

### Componentes en Estado de Liberación

1. **Dashboard Nacional** (`national-dashboard`)
   - Visualización de metas nacionales
   - 4 pestañas temáticas
   - Integración con API MongoDB
   - Visualizaciones jerárquicas

2. **Consulta Regional** (`consulta-regional`)
   - Visualización por regional
   - Drill-down a nivel de centro
   - Exportación a Excel
   - Integración híbrida (API + JSON fallback)

### Componentes en Desarrollo

- Otros componentes en fase de construcción (no incluidos en esta versión de documentación)

---

## Fuentes de Datos Documentadas

### Fuentes de Datos Actuales (Nueva Arquitectura)

1. **API REST MongoDB**
   - Ubicación: `C:\ws\sena\data\seguimiento_metas\sena-metas-procesador`
   - Endpoints principales:
     - `/api/arbol-fpi-con-ejecuciones`
     - `/api/arbol-retencion-con-ejecuciones`
     - `/api/arbol-certificacion-con-ejecuciones`
     - `/api/metas-regional`
     - `/api/metas-centros`
     - `/api/ejecucion-regional`
     - `/api/ejecucion-centros`

2. **Archivos JSON Locales (Fallback)**
   - Ubicación: `src/assets/data/`
   - Múltiples archivos especializados por tipo de dato
   - Usados cuando API no está disponible

### Fuentes de Datos Antiguas (Deprecadas)

- Archivos JSON únicos con toda la información
- Sin separación por fuente de datos
- Mantenidos para compatibilidad pero no recomendados

---

## Tecnologías y Arquitectura

### Stack Tecnológico

**Frontend:**
- Angular 17 (Standalone Components)
- TypeScript 5.4+
- RxJS 7.8
- Angular Material 17

**Gestión de Datos:**
- HttpClient para consumo de APIs
- Servicios especializados por dominio
- Estrategia de fallback automático

**Visualización:**
- Componentes personalizados
- Angular Material para UI
- OpenLayers para mapas (componentes futuros)

**Exportación:**
- ExcelJS 4.4
- Generación dinámica de reportes

**Backend/API:**
- Node.js + Express (sena-metas-procesador)
- MongoDB para almacenamiento
- API REST

### Patrones de Arquitectura

1. **Separación de Responsabilidades**
   - Componentes de presentación
   - Servicios de datos
   - Modelos de dominio
   - Transformadores de datos

2. **Estrategia de Resiliencia**
   - Fallback automático a JSON local
   - Manejo de errores robusto
   - Carga paralela con `forkJoin`

3. **Componentes Standalone**
   - Sin módulos NgModule
   - Importación directa de dependencias
   - Mayor modularidad

---

## Estructura de Archivos de Documentación

```
sena-metas-app/
├── METODOLOGIA_AGIL_ESTRUCTURA.md    # Este archivo - Visión general
├── INICIATIVA.md                     # Iniciativa del proyecto
├── EPICAS.md                         # Épicas identificadas
├── HISTORIAS_USUARIO.md              # Historias de usuario detalladas
├── ARQUITECTURA_TECNICA.md           # Arquitectura y decisiones técnicas
└── DICCIONARIO_DATOS.md              # Diccionario de fuentes de datos
```

---

## Proceso de Desarrollo

### Workflow Ágil

1. **Planning**
   - Revisión de épicas
   - Priorización de historias
   - Estimación en puntos

2. **Desarrollo**
   - Implementación por historia
   - Commits atómicos
   - Code review

3. **Testing**
   - Validación de criterios de aceptación
   - Pruebas de integración

4. **Liberación**
   - Documentación completada
   - Demo a stakeholders
   - Deploy a producción

### Definición de Listo (Definition of Done)

Una historia se considera **COMPLETADA** cuando:

- [ ] Código implementado y funcional
- [ ] Criterios de aceptación validados
- [ ] Código revisado (code review)
- [ ] Pruebas unitarias (si aplica)
- [ ] Pruebas de integración pasadas
- [ ] Documentación técnica actualizada
- [ ] Demo exitosa al Product Owner
- [ ] Deploy a ambiente de pruebas

---

## Referencias Cruzadas

- Ver `INICIATIVA.md` para objetivos estratégicos
- Ver `EPICAS.md` para agrupaciones de funcionalidades
- Ver `HISTORIAS_USUARIO.md` para requisitos detallados
- Ver `README.md` para instrucciones de instalación y uso
- Ver `ARQUITECTURA_TECNICA.md` para detalles de implementación

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | 2025-12-10 | Equipo SENA | Versión inicial - Documentación de componentes en estado de liberación |

---

## Notas

- Esta documentación cubre únicamente los componentes **dashboard-nacional** y **consulta-regional**
- Otros componentes serán documentados en futuras iteraciones
- La documentación se actualiza continuamente según avanza el desarrollo
