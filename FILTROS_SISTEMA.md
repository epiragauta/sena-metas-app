# Sistema de Filtros Jerárquicos - SENA Metas

## Descripción General

Sistema completo de filtros basado en jerarquías para la aplicación de seguimiento de metas SENA. Permite filtrar, buscar y analizar metas utilizando múltiples criterios combinados.

---

## Componentes del Sistema

### 1. Modelos de Datos

**Archivo**: `src/app/models/meta.model.ts`

#### Interfaz `FiltrosMetas`

Define los criterios de filtrado disponibles:

```typescript
interface FiltrosMetas {
  niveles?: number[];                    // Niveles jerárquicos (1-5)
  tipo?: 'total' | 'subtotal' | 'detalle' | 'todos';
  porcentajeMin?: number;                // Rango de cumplimiento mínimo
  porcentajeMax?: number;                // Rango de cumplimiento máximo
  estadoSemaforo?: EstadoSemaforo;       // Estado según semáforo
  textoBusqueda?: string;                // Búsqueda en descripción
  padreId?: number;                      // Filtrar por padre específico
  padreNombre?: string;                  // Filtrar por nombre de padre
  estrategia?: 'regular' | 'campesena' | 'fullpopular';
}
```

---

### 2. Servicio de Filtrado

**Archivo**: `src/app/services/metas.service.ts`

#### Métodos Principales

##### Filtros Básicos

```typescript
// Filtrar por múltiples niveles jerárquicos
filtrarPorNiveles(niveles: number[]): Observable<Meta[]>

// Filtrar por rango de porcentaje
filtrarPorRangoPorcentaje(min: number, max: number): Observable<Meta[]>

// Filtrar por estado de semáforo
filtrarPorEstadoSemaforo(estado: EstadoSemaforo, rangos: RangoSemaforo): Observable<Meta[]>

// Filtrar por tipo (total, subtotal, detalle)
filtrarPorTipo(tipo: 'total' | 'subtotal' | 'detalle' | 'todos'): Observable<Meta[]>

// Buscar por texto en descripción
buscarPorTexto(texto: string): Observable<Meta[]>
```

##### Filtros Jerárquicos Avanzados

```typescript
// Obtener todas las metas hijas de un padre específico
filtrarHijosPorPadreId(padreId: number): Observable<Meta[]>

// Obtener todas las metas que son padres (tienen hijos)
obtenerMetasPadres(): Observable<Meta[]>

// Obtener todas las metas que son hojas (sin hijos)
obtenerMetasHojas(): Observable<Meta[]>

// Obtener el camino jerárquico completo desde la raíz
obtenerCaminoJerarquico(metaId: number): Observable<Meta[]>
```

##### Filtros Combinados

```typescript
// Aplicar múltiples filtros simultáneamente
aplicarFiltrosCombinados(filtros: FiltrosMetas): Observable<Meta[]>

// Filtrar Formación por estrategia
filtrarFormacionPorModalidad(estrategia: 'regular' | 'campesena' | 'fullpopular'): Observable<FormacionPorNivel[]>

// Obtener estadísticas de los resultados filtrados
obtenerEstadisticasFiltradas(filtros: FiltrosMetas): Observable<Estadisticas>
```

---

### 3. Pipes de Filtrado

**Archivo**: `src/app/pipes/filter-metas.pipe.ts`

#### Pipes Disponibles

```typescript
// Pipe principal para filtros combinados
{{ metas | filterMetas: filtrosActuales }}

// Filtrar por texto
{{ metas | filterByText: 'campesena' }}

// Filtrar por nivel jerárquico
{{ metas | filterByNivel: 2 }}

// Filtrar por tipo
{{ metas | filterByTipo: 'total' }}

// Filtrar por rango de porcentaje
{{ metas | filterByPorcentaje: 70:90 }}

// Ordenar metas
{{ metas | sortMetas: 'porcentaje':'desc' }}

// Resaltar texto en búsquedas
{{ meta.descripcion | highlight: textoBusqueda }}
```

---

### 4. Componente de Filtros UI

**Archivo**: `src/app/components/filtros.component.ts`

#### Características

- **Búsqueda por texto**: Campo de entrada para buscar en descripciones
- **Selector de tipo**: Dropdown para filtrar totales/subtotales/detalles
- **Niveles jerárquicos**: Checkboxes para seleccionar múltiples niveles
- **Rango de porcentaje**: Inputs para definir rango mínimo y máximo
- **Filtros rápidos**: Botones para filtros predefinidos:
  - Bajo (< 70%)
  - En Progreso (70-90%)
  - Buena (> 90%)
- **Estadísticas en tiempo real**: Muestra resultados del filtrado

#### Uso del Componente

```html
<app-filtros
  [nivelesDisponibles]="[1, 2, 3, 4, 5]"
  [mostrarEstadisticas]="true"
  [estadisticas]="estadisticasFiltros"
  (filtrosChange)="onFiltrosChange($event)"
></app-filtros>
```

---

## Integración en el Componente Principal

**Archivo**: `src/app/app.component.ts`

### Propiedades Agregadas

```typescript
// Filtros actuales
filtrosActuales: FiltrosMetas = {};

// Estadísticas de filtrado
estadisticasFiltros?: {
  total: number;
  totales: number;
  subtotales: number;
  detalles: number;
  promedioEjecucion: number;
  promedioCumplimiento: number;
};
```

### Métodos Agregados

```typescript
// Manejar cambios en filtros
onFiltrosChange(filtros: FiltrosMetas): void {
  this.filtrosActuales = filtros;
  this.actualizarEstadisticas();
}

// Actualizar estadísticas
actualizarEstadisticas(): void {
  this.metasService.obtenerEstadisticasFiltradas(this.filtrosActuales)
    .subscribe(stats => this.estadisticasFiltros = stats);
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Filtrar por Nivel Jerárquico

```typescript
// En el servicio
this.metasService.filtrarPorNiveles([1, 2]).subscribe(metas => {
  console.log('Metas de nivel 1 y 2:', metas);
});

// Con pipe en template
<tr *ngFor="let meta of metas | filterByNivel: 1">
```

### Ejemplo 2: Filtrar por Rango de Porcentaje

```typescript
// En el servicio
this.metasService.filtrarPorRangoPorcentaje(70, 90).subscribe(metas => {
  console.log('Metas con cumplimiento entre 70-90%:', metas);
});

// Con pipe en template
<tr *ngFor="let meta of metas | filterByPorcentaje: 70:90">
```

### Ejemplo 3: Filtros Combinados

```typescript
const filtros: FiltrosMetas = {
  niveles: [2, 3],
  tipo: 'detalle',
  porcentajeMin: 80,
  textoBusqueda: 'tecnólogo'
};

this.metasService.aplicarFiltrosCombinados(filtros).subscribe(metas => {
  console.log('Metas filtradas:', metas);
});

// Con pipe en template
<tr *ngFor="let meta of metas | filterMetas: filtrosActuales">
```

### Ejemplo 4: Obtener Jerarquía Completa

```typescript
// Obtener camino jerárquico de una meta
this.metasService.obtenerCaminoJerarquico(15).subscribe(camino => {
  console.log('Camino desde raíz:', camino);
  // Resultado: [TOTAL FPI, FORMACIÓN TITULADA, FORMACIÓN LABORAL, SubTotal Auxiliares]
});
```

### Ejemplo 5: Filtrar por Modalidad

```typescript
this.metasService.filtrarFormacionPorModalidad('campesena').subscribe(niveles => {
  console.log('Niveles con CampeSENA:', niveles);
});
```

---

## Estructura de Jerarquías

El sistema reconoce la siguiente estructura jerárquica:

```
NIVEL 1: TOTAL FORMACIÓN PROFESIONAL INTEGRAL
  └── NIVEL 2: FORMACIÓN TITULADA + FORMACIÓN COMPLEMENTARIA
      └── NIVEL 3: FORMACIÓN LABORAL + EDUCACIÓN SUPERIOR
          └── NIVEL 4: SubTotal (Auxiliares, Operarios, Técnico Laboral)
              └── NIVEL 5: Items específicos (Regular, CampeSENA, Full Popular)
```

---

## Características Avanzadas

### 1. Filtrado en Tiempo Real

El componente de filtros emite eventos en cada cambio, permitiendo actualización instantánea de resultados.

### 2. Estadísticas Dinámicas

Las estadísticas se recalculan automáticamente con cada filtro aplicado:
- Total de registros filtrados
- Cantidad de totales/subtotales/detalles
- Promedio de ejecución
- Promedio de cumplimiento

### 3. Filtros Rápidos

Botones predefinidos para escenarios comunes:
- **Bajo**: Metas con cumplimiento < 70%
- **En Progreso**: Metas entre 70-90%
- **Buena**: Metas > 90%

### 4. Búsqueda con Resaltado

El pipe `highlight` permite resaltar términos de búsqueda en los resultados.

### 5. Navegación Jerárquica

Métodos para navegar por la estructura de jerarquías:
- Obtener padres
- Obtener hijos
- Obtener hojas (sin hijos)
- Obtener camino completo

---

## Archivos Creados/Modificados

### Nuevos Archivos

1. `src/app/pipes/filter-metas.pipe.ts` - Pipes de filtrado
2. `src/app/components/filtros.component.ts` - Componente UI de filtros
3. `FILTROS_SISTEMA.md` - Esta documentación

### Archivos Modificados

1. `src/app/models/meta.model.ts` - Interfaz `FiltrosMetas`
2. `src/app/services/metas.service.ts` - Métodos de filtrado avanzados
3. `src/app/app.component.ts` - Integración del sistema de filtros

---

## Referencias de Datos

El sistema utiliza los siguientes archivos JSON:

- `src/assets/data/jerarquias.json` - Relaciones padre-hijo
- `src/assets/data/metas_fpi.json` - Metas principales
- `src/assets/data/formacion_por_nivel.json` - Formación por estrategia
- `src/assets/data/rangos_semaforo.json` - Rangos de clasificación

---

## Mejores Prácticas

1. **Usar filtros combinados**: Aprovechar `aplicarFiltrosCombinados()` para múltiples criterios
2. **Limpiar filtros**: Usar el botón "Limpiar Filtros" para resetear
3. **Estadísticas**: Mostrar siempre estadísticas para dar contexto al usuario
4. **Performance**: Los pipes son puros para mejor rendimiento
5. **Cache**: El servicio usa `shareReplay()` para optimizar peticiones HTTP

---

## Soporte

Para consultas o mejoras, revisar:
- Modelos en `src/app/models/meta.model.ts`
- Servicio en `src/app/services/metas.service.ts`
- Documentación de jerarquías en `src/assets/data/referencias_totales.json`
