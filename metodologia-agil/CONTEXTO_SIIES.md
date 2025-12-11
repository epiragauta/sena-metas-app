# Contexto del SIIES - Sistema Integrado de Información Estadística

## Información General

**Proyecto:** Sistema Integrado de Información Estadística del SENA (SIIES)
**Período de Implementación:** 2025-2027
**Área Responsable:** Grupo de Gestión de Información y Evaluación de Resultados (GGIER)
**Dirección:** Dirección de Planeación y Direccionamiento Corporativo
**Marco Normativo:** Resolución 01-00014 de 2024
**Documento de Referencia:** DIAGNÓSTICO PARA IMPLEMENTACIÓN DEL SIIES_V4.md

---

## ¿Qué es el SIIES?

El **Sistema Integrado de Información Estadística del SENA (SIIES)** es una iniciativa estratégica institucional que busca transformar la manera en que el SENA produce, gestiona y presenta su información estadística.

### Propósito Estratégico

El SIIES emerge como respuesta institucional a desafíos identificados en el diagnóstico integral realizado por el GGIER:

1. **Fragmentación de sistemas de información** - Datos dispersos en SOFIA Plus, APE, SNFT y otros sistemas
2. **Inconsistencias en datos estadísticos** - Problemas de completitud (37%), consistencia (42%) y conformidad (29%)
3. **Limitaciones para toma de decisiones** - Falta de dashboards ejecutivos y visualización moderna
4. **Procesos manuales y repetitivos** - Tareas operativas que consumen recursos significativos del GGIER
5. **Ausencia de estandarización** - No existen procesos estadísticos estandarizados

### Objetivos del SIIES

1. **Centralizar** la información estadística dispersa en múltiples sistemas
2. **Estandarizar** procesos de producción estadística según NTC PE 1000:2020
3. **Automatizar** tareas operativas y repetitivas del GGIER
4. **Modernizar** la presentación de información estadística
5. **Fortalecer** el gobierno de datos institucional
6. **Facilitar** la toma de decisiones basada en evidencia
7. **Certificar** ante el DANE como productor de estadísticas oficiales

---

## Marco Normativo y Estratégico

### Normatividad Aplicable

- **Plan Estratégico Institucional 2022-2026** - Compromiso institucional
- **Resolución 01-00014 de 2024** - Creación del SIIES
- **Norma Técnica de Calidad Estadística NTC PE 1000:2020** - Estándares de calidad
- **Políticas de Gobierno de Datos** - Transformación digital nacional
- **Modelo Genérico del Proceso Estadístico (GSBPM v5.1)** - Estándares internacionales

### Alineación Estratégica

El SIIES se alinea con:

- **Plan Nacional de Infraestructura de Datos (PNID)**
- **Marco de Interoperabilidad para Gobierno Digital**
- **Política de Transparencia y Datos Abiertos**
- **Arquitectura Empresarial Institucional**
- **Plan Estratégico de Tecnologías de la Información y las Comunicaciones (PETIC)**

---

## Diagnóstico Integral del SIIES

### Hallazgos Principales

El diagnóstico realizado en 2025 reveló:

#### 1. Marco Normativo y de Arquitectura
- **11 dominios regulatorios** aplicables al SIIES
- **64% de disposiciones normativas** son de reciente emisión (2020-2025)
- Brechas significativas en gobernanza estadística y calidad de datos

#### 2. Contexto Estratégico
- **31 grupos de interés** identificados con diversos niveles de influencia
- **Principal fortaleza:** Respaldo directivo para la implementación
- **Principal debilidad:** Ausencia de procesos estadísticos estandarizados

#### 3. Sistemas Fuente Evaluados
- **SOFIA Plus:** Sistema misional con limitaciones de acceso en tiempo real
- **APE (Agencia Pública de Empleo):** Datos de gestión de empleo
- **SNFT (Sistema Nacional de Formación para el Trabajo):** Certificaciones y competencias
- **Otros sistemas:** Múltiples fuentes con arquitecturas heterogéneas

#### 4. Brechas de Interoperabilidad
- **Político-legal:** Ausencia de acuerdos formales entre sistemas
- **Organizacional:** Procesos no estandarizados
- **Semántica:** Falta de diccionarios unificados de datos
- **Técnica:** Limitaciones en infraestructura de APIs

Solo el **23% de los flujos de información** actuales cumplen con estándares de interoperabilidad.

#### 5. Brechas Críticas Identificadas
- **18 brechas críticas** requieren intervención inmediata
- **5 oportunidades de alto impacto** para modernización
- Necesidad urgente de automatización de procesos ETL

---

## Estrategia de Implementación SIIES

### Enfoque Gradual y Modular

El SIIES se implementará mediante **módulos especializados** durante 2025-2027:

#### Fase 1: Victorias Tempranas (2025)
| Módulo | Prioridad | Estado | Impacto |
|--------|-----------|--------|---------|
| **Seguimiento de Metas** | ALTA | ✅ V1.0 | Automatización GGIER |
| Tablero Ejecutivo FPI | ALTA | 📋 Planificado | Decisiones directivas |

#### Fase 2: Expansión (2026)
| Módulo | Prioridad | Estado | Impacto |
|--------|-----------|--------|---------|
| Estadísticas SOFIA Plus | MEDIA | 📋 Planificado | Análisis académico |
| Estadísticas APE | MEDIA | 📋 Planificado | Gestión de empleo |
| Estadísticas SNFT | MEDIA | 📋 Planificado | Competencias laborales |

#### Fase 3: Consolidación (2027)
| Módulo | Prioridad | Estado | Impacto |
|--------|-----------|--------|---------|
| Repositorio de Metadatos | ALTA | 💭 Ideación | Gobierno de datos |
| Portal de Datos Abiertos | MEDIA | 💭 Ideación | Transparencia |
| Sistema de Calidad Estadística | ALTA | 💭 Ideación | Certificación DANE |

---

## Módulo de Seguimiento de Metas - Primera Victoria Temprana

### ¿Por qué este módulo es el primero?

El módulo de Seguimiento de Metas fue seleccionado como **primera victoria temprana** del SIIES por:

1. **Impacto Inmediato en el GGIER**
   - Automatiza tareas repetitivas mensuales
   - Reduce tiempo de generación de reportes de 2+ horas a 2 minutos
   - Libera capacidad para tareas analíticas de mayor valor

2. **Complejidad Manejable**
   - Alcance bien definido (metas e indicadores FPI)
   - Fuentes de datos identificadas
   - Usuarios claramente definidos

3. **Valor Demostrativo**
   - Muestra capacidades de visualización moderna
   - Establece patrones arquitectónicos replicables
   - Genera confianza en stakeholders

4. **Aprendizaje Organizacional**
   - Desarrolla capacidades técnicas del equipo GGIER
   - Valida enfoque API REST + fallback JSON
   - Identifica lecciones aprendidas para módulos futuros

### Automatización de Tareas del GGIER

#### Tareas Manuales Actuales (ANTES)
- **Extracción de datos:** Descargas manuales de múltiples sistemas
- **Consolidación:** Unificación manual en Excel
- **Cálculos:** Subtotales y porcentajes con fórmulas manuales
- **Validación:** Revisión manual de consistencia
- **Presentación:** Generación de reportes en PowerPoint/Excel
- **Distribución:** Envío manual por correo

**Tiempo total:** 6-8 horas por reporte mensual

#### Proceso Automatizado (DESPUÉS)
- **Extracción:** API REST automática con fallback JSON
- **Transformación:** Procesos ETL automatizados
- **Cálculos:** Generados dinámicamente por la aplicación
- **Visualización:** Dashboards web en tiempo real
- **Acceso:** Disponible 24/7 para usuarios autorizados
- **Reportes:** Generación automática en 2 minutos

**Tiempo total:** < 5 minutos para acceso y exportación

**Reducción:** **90% de tiempo dedicado a tareas operativas**

---

## Beneficios Esperados del SIIES

### Beneficios Cuantitativos

1. **Eficiencia Operativa**
   - Reducción del 90% en tiempo de generación de reportes
   - Ahorro estimado: 100+ horas/mes del equipo GGIER
   - Liberación de capacidad para análisis estratégico

2. **Calidad de Datos**
   - Mejora del 50% en problemas de completitud
   - Reducción del 40% en inconsistencias
   - Estandarización de 100% de métricas institucionales

3. **Toma de Decisiones**
   - Acceso a información en tiempo real (vs. reportes mensuales)
   - Reducción del 75% en tiempo de respuesta a consultas directivas
   - Incremento del 80% en decisiones basadas en datos

### Beneficios Cualitativos

1. **Transformación Digital**
   - Modernización de presentación de información estadística
   - Cultura de datos en la organización
   - Posicionamiento como entidad modelo en gestión estadística

2. **Transparencia y Gobernanza**
   - Mayor trazabilidad de datos y procesos
   - Cumplimiento de normativas de datos abiertos
   - Fortalecimiento del gobierno de datos institucional

3. **Capacidades Institucionales**
   - Desarrollo de competencias técnicas en el GGIER
   - Transferencia de conocimiento entre módulos
   - Autonomía en gestión de información estadística

---

## Patrones Arquitectónicos Establecidos

El módulo de Seguimiento de Metas establece patrones que se replicarán en todo el SIIES:

### 1. Arquitectura de Integración
```
API REST (Principal)
    ↓
[Validación y Transformación]
    ↓
Aplicación Web
    ↓
Fallback JSON (Resiliencia)
```

### 2. Stack Tecnológico Estándar
- **Frontend:** Angular 17+ (Standalone Components)
- **Backend API:** Node.js + Express + MongoDB
- **Visualización:** Componentes personalizados + Angular Material
- **Exportación:** ExcelJS para reportes

### 3. Patrones de Diseño
- **Servicios especializados** por dominio de datos
- **Transformadores de datos** para normalización
- **Estrategia de fallback** para resiliencia
- **Componentes standalone** para modularidad

### 4. Estándares de Visualización
- **Dashboards interactivos** con tabs temáticos
- **Sistema de semáforos** (verde/amarillo/rojo)
- **Búsqueda y filtrado** en todos los componentes
- **Drill-down** Nacional → Regional → Centro
- **Exportación estandarizada** con formato institucional

---

## Lecciones Aprendidas y Próximos Pasos

### Lecciones del Primer Módulo

1. **Importancia del fallback:** La estrategia de resiliencia API + JSON garantiza disponibilidad
2. **Valor de la visualización:** Dashboards modernos generan mayor adopción que reportes Excel
3. **Automatización gradual:** No es necesario automatizar todo de una vez
4. **Involucramiento de usuarios:** Retroalimentación temprana mejora el producto

### Próximos Módulos SIIES

Con base en la experiencia del módulo de Seguimiento de Metas, los próximos módulos:

1. **Reutilizarán** patrones arquitectónicos probados
2. **Extenderán** capacidades de visualización
3. **Integrarán** con sistemas adicionales (SOFIA Plus, APE, SNFT)
4. **Fortalecerán** el repositorio de metadatos
5. **Avanzarán** hacia certificación DANE

---

## Referencias

### Documentación Técnica
- **DIAGNÓSTICO PARA IMPLEMENTACIÓN DEL SIIES_V4.md** - Diagnóstico integral (ubicación: `C:\ws\sena\docs\diagnostico\`)
- **INICIATIVA.md** - Iniciativa del módulo de Seguimiento de Metas
- **EPICAS.md** - Épicas del módulo
- **HISTORIAS_USUARIO.md** - Historias de usuario detalladas

### Marco Normativo
- Resolución 01-00014 de 2024
- Norma Técnica de Calidad Estadística NTC PE 1000:2020
- Modelo Genérico del Proceso Estadístico (GSBPM v5.1)

### Contacto
- **Equipo GGIER** - Grupo de Gestión de Información y Evaluación de Resultados
- **Dirección de Planeación y Direccionamiento Corporativo** - SENA

---

**Versión:** 1.0.0
**Fecha:** 2025-12-10
**Autor:** Equipo GGIER - SIIES
