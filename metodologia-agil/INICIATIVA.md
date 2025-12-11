# Iniciativa: Sistema de Seguimiento de Metas SENA

## Información General

- **ID Iniciativa:** INIT-SENA-METAS-001
- **Nombre:** Digitalización y Modernización del Seguimiento de Metas de Formación Profesional Integral
- **Patrocinador:** Dirección de Planeación y Direccionamiento Corporativo
- **Product Owner:** Grupo de Gestión de Información y evaluación de resultados
- **Fecha de Inicio:** 2025
- **Estado Actual:** En Desarrollo - Fase de Liberación
- **Versión:** 1.0.0

---

## Descripción Ejecutiva

Este módulo constituye el **primer componente** del **Sistema Integrado de Información Estadística del SENA (SIIES)**, iniciativa estratégica enmarcada en el Plan Estratégico Institucional 2022-2026 y alineada con las políticas nacionales de gobierno de datos y transformación digital.

El propósito de este módulo es desarrollar e implementar un sistema web integral para el seguimiento, visualización y análisis de las metas de Formación Profesional Integral (FPI) del SENA a nivel nacional, regional y de centros de formación. El sistema permitirá a los diferentes niveles directivos tomar decisiones informadas basadas en datos actualizados y presentados de forma clara y accesible.

Este módulo representa el inicio de un ecosistema de soluciones informáticas que automatizarán tareas repetitivas y operativas del **Grupo de Gestión de Información y Evaluación de Resultados (GGIER)** de la Dirección de Planeación y Direccionamiento Corporativo, generando alternativas modernas de presentación de la información estadística que produce la entidad.

---

## Problema de Negocio

### Contexto del SIIES

El SENA enfrenta desafíos significativos derivados de la fragmentación de sus sistemas de información, inconsistencias en datos estadísticos y limitaciones para la toma de decisiones basada en evidencia. El diagnóstico integral realizado para la implementación del SIIES reveló que:

- **Fragmentación de datos:** El 64% de las disposiciones normativas aplicables son de reciente emisión (2020-2025), evidenciando un entorno regulatorio dinámico que requiere mecanismos de adaptación continua.
- **Calidad de datos:** El análisis de calidad revela problemas de completitud (37%), consistencia (42%) y conformidad (29%) en variables estadísticas clave.
- **Procesos manuales:** El Grupo GGIER dedica recursos significativos a tareas operativas y repetitivas de extracción, transformación y presentación de información.
- **Ausencia de estandarización:** No existen procesos estadísticos estandarizados para la generación de reportes institucionales.

### Situación Actual - Módulo de Seguimiento de Metas

El SENA maneja un volumen significativo de información relacionada con metas de formación profesional integral que incluye:

- Formación Titulada (Tecnólogos, Técnicos, Auxiliares, Operarios)
- Formación Complementaria
- Programas especiales (CampeSENA, Full Popular)
- Competencias Laborales
- Retención y Certificación
- Empleo y Emprendimiento
- Poblaciones Vulnerables
- Contratos de Aprendizaje

### Desafíos Identificados

1. **Tareas Operativas Repetitivas del GGIER**
   - Generación manual mensual de reportes ejecutivos de metas
   - Consolidación manual de información de múltiples fuentes
   - Tiempo significativo dedicado a tareas no analíticas
   - Dependencia de procesos no automatizados

2. **Dispersión de Información**
   - Datos distribuidos en múltiples fuentes (SOFIA Plus, APE, SNFT)
   - Falta de consolidación centralizada
   - Dificultad para obtener una visión integral
   - Arquitecturas heterogéneas de sistemas fuente

3. **Falta de Visualización en Tiempo Real**
   - Reportes manuales y tardíos
   - No hay dashboards ejecutivos dinámicos
   - Limitada capacidad de drill-down
   - Presentación tradicional de información (archivos Excel)

4. **Complejidad en el Análisis**
   - Gran cantidad de indicadores (más de 100 métricas)
   - Jerarquías complejas de datos
   - Necesidad de comparaciones multi-nivel (Nacional → Regional → Centro)
   - Ausencia de herramientas de visualización moderna

5. **Limitaciones en Reportería**
   - Generación manual de reportes Excel (2+ horas por reporte)
   - Proceso lento y propenso a errores humanos
   - Falta de estandarización en formatos
   - No hay trazabilidad de versiones

6. **Accesibilidad Limitada**
   - Sistema no web (archivos compartidos)
   - No accesible desde diferentes dispositivos
   - Sin arquitectura moderna
   - Limitaciones para usuarios regionales

---

## Objetivos Estratégicos

### Objetivo General - Contexto SIIES

Desarrollar e implementar el **primer módulo del Sistema Integrado de Información Estadística (SIIES)** mediante un sistema web moderno que permita el seguimiento integral de metas de formación profesional del SENA, automatizando tareas operativas del Grupo GGIER y facilitando la toma de decisiones basada en datos a nivel nacional, regional y local.

Este módulo representa una **victoria temprana** del SIIES, demostrando capacidades de visualización moderna de información estadística y estableciendo patrones arquitectónicos y de diseño que serán replicados en módulos futuros del ecosistema.

### Objetivos Específicos

1. **Automatización de Tareas Operativas del GGIER**
   - Eliminar procesos manuales repetitivos de generación de reportes de metas
   - Reducir en 90% el tiempo dedicado a consolidación de información
   - Liberar capacidad del equipo GGIER para tareas analíticas de mayor valor
   - Establecer flujos automatizados de extracción, transformación y carga (ETL)

2. **Modernización de Presentación de Información Estadística**
   - Implementar dashboards interactivos con visualizaciones modernas
   - Reemplazar presentación tradicional en Excel por visualización web dinámica
   - Proveer acceso en tiempo real a información de metas e indicadores
   - Establecer patrones de visualización replicables para otros módulos SIIES

3. **Centralización de Información**
   - Consolidar fuentes de datos de metas (SOFIA Plus, APE, SNFT)
   - Integrar datos de diferentes sistemas mediante API REST y fallback JSON
   - Mantener consistencia y trazabilidad de la información
   - Crear repositorio unificado de métricas institucionales

4. **Visualización Ejecutiva**
   - Proveer dashboards interactivos para nivel directivo
   - Mostrar indicadores clave (KPIs) de forma clara y visual
   - Implementar sistema de semáforos para identificación rápida de alertas
   - Facilitar toma de decisiones basada en evidencia

5. **Análisis Multi-Nivel**
   - Permitir consultas a nivel nacional
   - Habilitar drill-down a nivel regional
   - Facilitar análisis detallado por centro de formación
   - Proveer comparaciones regional vs centro

6. **Reportería Automatizada**
   - Generar reportes en formato Excel de forma automática
   - Estandarizar formatos de reportes con imagen institucional SENA
   - Reducir tiempo de generación de reportes de 2+ horas a 2 minutos
   - Garantizar trazabilidad y versionamiento de reportes

7. **Accesibilidad y Usabilidad**
   - Sistema web accesible desde cualquier dispositivo
   - Interfaz intuitiva y responsive
   - Cumplimiento de estándares de accesibilidad
   - Disponible para usuarios regionales y de centros

---

## Contexto del Sistema Integrado de Información Estadística (SIIES)

### ¿Qué es el SIIES?

El **Sistema Integrado de Información Estadística del SENA (SIIES)** es una iniciativa estratégica institucional que busca centralizar, estandarizar y optimizar la producción estadística del SENA, en consonancia con:

- Plan Estratégico Institucional 2022-2026
- Resolución 01-00014 de 2024
- Norma Técnica de Calidad Estadística NTC PE 1000:2020
- Políticas nacionales de gobierno de datos y transformación digital
- Requisitos para certificación ante el DANE

### Propósito del SIIES

El SIIES emerge como respuesta institucional para:

1. **Centralizar** la información estadística dispersa en múltiples sistemas
2. **Estandarizar** procesos de producción estadística
3. **Automatizar** tareas operativas y repetitivas
4. **Modernizar** la presentación de información estadística
5. **Fortalecer** el gobierno de datos institucional
6. **Facilitar** la toma de decisiones basada en evidencia

### Ecosistema de Módulos SIIES

El SIIES se implementará progresivamente durante 2025-2027 mediante módulos especializados:

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Seguimiento de Metas** | ✅ V1.0 Liberación | Visualización de metas e indicadores FPI (ESTE MÓDULO) |
| Estadísticas SOFIA Plus | 📋 Planificado | Análisis académico y cobertura |
| Estadísticas APE | 📋 Planificado | Agencia Pública de Empleo |
| Estadísticas SNFT | 📋 Planificado | Sistema Nacional de Formación para el Trabajo |
| Tablero de Control Directivo | 📋 Planificado | KPIs ejecutivos consolidados |
| Repositorio de Metadatos | 📋 Planificado | Documentación de procesos estadísticos |

### Rol del Módulo de Seguimiento de Metas en el SIIES

Este módulo es la **primera victoria temprana** del SIIES y establece:

- **Patrones arquitectónicos** para módulos futuros (API REST + fallback JSON)
- **Estándares de visualización** (dashboards interactivos, semáforos)
- **Procesos ETL automatizados** replicables
- **Experiencia de usuario** moderna y accesible
- **Capacidades técnicas** del equipo GGIER

---

## Alcance

### Dentro del Alcance (In-Scope) - Módulo de Seguimiento de Metas V1.0

**Componentes a Liberar en Versión 1.0:**

1. **Dashboard Nacional**
   - Visualización de metas de Formación Profesional Integral
   - Sistema Nacional de Formación para el Trabajo
   - CampeSENA y Full Popular
   - Dirección de Empleo y Trabajo
   - Búsqueda y filtrado de indicadores
   - Información contextual de secciones

2. **Consulta Regional**
   - Selección de regional
   - Drill-down a centros de formación
   - Visualización de todas las métricas por nivel
   - Exportación a Excel (regional y/o centro)
   - Tablas expandibles/colapsables

3. **Integración de Datos**
   - Consumo de API REST MongoDB
   - Fallback a archivos JSON locales
   - Servicios especializados por dominio
   - Transformación de datos para visualización

4. **Exportación**
   - Generación dinámica de archivos Excel
   - Formato estandarizado SENA
   - Múltiples opciones de exportación (solo regional, regional + centro)

### Fuera del Alcance (Out-of-Scope) - Versión 1.0

- Módulo de administración de usuarios
- Carga de datos por interfaz web
- Alertas y notificaciones automáticas
- Análisis predictivo o inteligencia artificial
- Visualizaciones de mapas geográficos (en desarrollo)
- Otros componentes no mencionados en el alcance

### Componentes Futuros (Backlog)

- Consulta por departamento y municipio
- Visualización geográfica con mapas
- Módulo de configuración de metas
- Sistema de permisos granular
- Integración con otros sistemas SENA

---

## Indicadores de Éxito (KPIs)

### KPIs de Adopción

1. **Tasa de Adopción del Sistema**
   - Meta: 80% de usuarios objetivo usando el sistema en 3 meses
   - Medición: Usuarios únicos activos / Total usuarios objetivo

2. **Frecuencia de Uso**
   - Meta: Al menos 2 accesos por semana por usuario activo
   - Medición: Sesiones promedio por usuario por semana

### KPIs de Eficiencia

3. **Reducción de Tiempo en Generación de Reportes**
   - Meta: Reducir 90% el tiempo de generación de reportes
   - Línea base: 2 horas manual vs 2 minutos automático

4. **Disponibilidad del Sistema**
   - Meta: 99% uptime durante horario laboral
   - Medición: Tiempo activo / Tiempo total

### KPIs de Calidad

5. **Tasa de Errores**
   - Meta: < 1% de reportes con inconsistencias
   - Medición: Reportes con errores / Total reportes generados

6. **Satisfacción de Usuario**
   - Meta: > 4.0/5.0 en encuestas de satisfacción
   - Medición: Encuesta trimestral a usuarios

### KPIs de Impacto

7. **Tiempo de Respuesta a Consultas Directivas**
   - Meta: Reducir 75% el tiempo de respuesta
   - Línea base: 1 día vs 2 horas

8. **Toma de Decisiones Basada en Datos**
   - Meta: > 80% de decisiones soportadas con datos del sistema
   - Medición: Encuesta a directivos

---

## Stakeholders

### Stakeholders Clave

| Rol | Descripción | Nivel de Involucramiento |
|-----|-------------|-------------------------|
| **Dirección General SENA** | Patrocinador ejecutivo | Alto - Aprobación final |
| **Dirección de Formación Profesional Integral** | Product Owner | Alto - Decisiones de producto |
| **Directores Regionales** | Usuarios principales - Nivel regional | Alto - Usuarios activos |
| **Coordinadores de Centros** | Usuarios principales - Nivel centro | Alto - Usuarios activos |
| **Área de Planeación** | Usuario de reportes y análisis | Medio - Consulta de datos |
| **Área de TI SENA** | Soporte técnico e infraestructura | Alto - Implementación y soporte |
| **Equipo de Desarrollo** | Implementación del sistema | Alto - Construcción |

### Matriz de Comunicación

| Stakeholder | Frecuencia | Canal | Tipo de Información |
|-------------|------------|-------|---------------------|
| Dirección General | Mensual | Presentación ejecutiva | KPIs, avances, roadmap |
| Directores Regionales | Quincenal | Email + Demo | Nuevas funcionalidades, actualizaciones |
| Coordinadores Centros | Mensual | Webinar | Capacitación, mejores prácticas |
| Área de TI | Semanal | Reunión técnica | Incidencias, mejoras técnicas |

---

## Beneficios Esperados

### Beneficios Cuantitativos

1. **Ahorro de Tiempo**
   - 90% reducción en tiempo de generación de reportes
   - 75% reducción en tiempo de consolidación de información
   - Estimado: 100 horas/mes ahorradas en trabajo manual

2. **Reducción de Costos**
   - Eliminación de procesos manuales
   - Reducción de errores y reprocesos
   - Estimado: $50M COP/año en eficiencias

3. **Mejora en Productividad**
   - Acceso inmediato a información
   - Reducción de solicitudes de información
   - Mayor tiempo para análisis estratégico

### Beneficios Cualitativos

1. **Mejora en Toma de Decisiones**
   - Decisiones basadas en datos actualizados
   - Visibilidad completa de indicadores
   - Identificación temprana de desviaciones

2. **Transparencia y Trazabilidad**
   - Información centralizada y auditable
   - Histórico de datos accesible
   - Estandarización de métricas

3. **Mejora en la Experiencia del Usuario**
   - Interfaz moderna e intuitiva
   - Acceso desde cualquier dispositivo
   - Reducción de fricción en obtención de datos

4. **Alineación Estratégica**
   - Seguimiento continuo de metas institucionales
   - Visibilidad de cumplimiento por región/centro
   - Facilita la gestión del cambio

---

## Riesgos y Mitigación

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Baja adopción por resistencia al cambio | Media | Alto | Plan de capacitación, champions regionales |
| Problemas de calidad de datos | Media | Alto | Validaciones automáticas, proceso de limpieza |
| Caída de API externa | Baja | Medio | Estrategia de fallback a JSON local |
| Falta de disponibilidad de stakeholders | Alta | Medio | Comunicación asíncrona, documentación detallada |
| Cambios en prioridades institucionales | Baja | Alto | Alineación continua con dirección |
| Problemas de desempeño con grandes volúmenes | Media | Medio | Optimización de queries, caching |

---

## Cronograma de Alto Nivel

### Fases del Proyecto

| Fase | Duración | Estado | Entregables |
|------|----------|--------|-------------|
| **Fase 0: Análisis y Diseño** | 2 meses | Completado | Requisitos, diseño de arquitectura |
| **Fase 1: Infraestructura Base** | 1 mes | Completado | Setup Angular, servicios base |
| **Fase 2: Dashboard Nacional** | 2 meses | Completado | Componente nacional con 4 tabs |
| **Fase 3: Consulta Regional** | 2 meses | Completado | Componente regional con drill-down |
| **Fase 4: Integración API** | 1 mes | Completado | Servicios API, fallback |
| **Fase 5: Testing y Refinamiento** | 1 mes | En Progreso | Pruebas, ajustes, documentación |
| **Fase 6: Liberación v1.0** | 2 semanas | Pendiente | Deploy producción, capacitación |

### Hitos Clave

- ✅ **H1:** Aprobación de diseño (Completado)
- ✅ **H2:** Dashboard Nacional funcional (Completado)
- ✅ **H3:** Consulta Regional funcional (Completado)
- ✅ **H4:** Integración con API completada (Completado)
- 🔄 **H5:** Testing completo (En Progreso)
- ⏳ **H6:** Go-Live Producción (Pendiente)

---

## Presupuesto y Recursos

### Equipo del Proyecto

- **1 Product Owner** (tiempo parcial)
- **1 Tech Lead / Arquitecto** (tiempo completo)
- **2-3 Desarrolladores Frontend Angular** (tiempo completo)
- **1 Desarrollador Backend** (tiempo parcial)
- **1 Analista de Datos** (tiempo parcial)
- **1 QA Tester** (tiempo parcial)

### Infraestructura

- Servidor de aplicaciones (Angular)
- Servidor API (Node.js + MongoDB)
- Almacenamiento de datos
- Herramientas de desarrollo y versionamiento

---

## Métricas de Seguimiento

### Métricas de Desarrollo

- **Velocidad del Equipo:** Puntos de historia completados por sprint
- **Burndown:** Trabajo pendiente vs tiempo
- **Defectos:** Bugs abiertos vs cerrados
- **Cobertura de Pruebas:** % código con tests

### Métricas de Producto

- **Usuarios Activos:** Usuarios únicos por semana/mes
- **Tiempo de Carga:** Performance de dashboards
- **Uso de Funcionalidades:** Features más/menos usadas
- **Reportes Generados:** Cantidad de exportaciones por período

---

## Dependencias Externas

1. **API MongoDB**
   - Disponibilidad y estabilidad del servicio
   - Tiempo de respuesta de endpoints
   - Calidad de datos

2. **Infraestructura SENA**
   - Servidores y hosting
   - Conectividad de red
   - Políticas de seguridad

3. **Datos de Origen**
   - Actualización oportuna de metas
   - Calidad y completitud de ejecuciones
   - Consistencia de formatos

---

## Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Patrocinador Ejecutivo | | | |
| Product Owner | | | |
| Director de TI | | | |
| Líder Técnico | | | |

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | 2025-12-10 | Equipo SENA | Versión inicial de la iniciativa |

---

## Referencias

- Ver `METODOLOGIA_AGIL_ESTRUCTURA.md` para estructura de documentación
- Ver `EPICAS.md` para desglose de épicas
- Ver `HISTORIAS_USUARIO.md` para requisitos detallados
- Ver `README.md` para información técnica del proyecto
