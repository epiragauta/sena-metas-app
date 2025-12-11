# Normalización de Metas SENA

Normalización y gestión de datos para el seguimiento de metas de formación profesional integral del SENA.

## Contenido

- [Descripción](#descripción)
- [Estructura de Archivos](#estructura-de-archivos)
- [Base de Datos](#base-de-datos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Integración con Angular](#integración-con-angular)

## Descripción

Este proyecto importa datos desde archivos ODS (OpenDocument Spreadsheet) y los normaliza en una base de datos SQLite. Caracteristicas:

- **Consultas eficientes** de datos de seguimiento de metas
- **Gestión de totales y subtotales** mediante relaciones jerárquicas
- **Referencias JSON** para integración con aplicaciones web
- **Clasificación por semáforo** de indicadores según rangos de cumplimiento

## Estructura de Archivos

```
seguimiento_metas/
│
├── seguimiento_metas_2025_09.ods     # Archivo fuente con datos
├── seguimiento_metas.db              # Base de datos SQLite generada
├── referencias_totales.json          # Referencias de totales y agregaciones
│
├── importar_a_sqlite.py              # Script de importación principal
├── generar_referencias_json.py       # Generador de referencias JSON
├── consultas_sql_ejemplo.sql         # Consultas SQL de ejemplo
│
└── README.md                         # Este archivo
```

## Base de Datos

### Esquema de Tablas

#### 1. `rangos_categorizacion`
Almacena los rangos de semáforo para categorización de indicadores.

```sql
CREATE TABLE rangos_categorizacion (
    id INTEGER PRIMARY KEY,
    agrupador VARCHAR(200),
    nombre_indicador VARCHAR(500),
    mes VARCHAR(50),
    min_baja, max_baja DECIMAL(10,4),
    min_vulnerable, max_vulnerable DECIMAL(10,4),
    min_buena, max_buena DECIMAL(10,4),
    sobreejecucion_superior_a DECIMAL(10,4)
);
```

**Uso:** Determinar el estado de cumplimiento de cada indicador (Bajo, Vulnerable, Bueno, Sobreejecución).

#### 2. `meta_formacion_profesional_integral`
Metas principales de formación profesional integral.

```sql
CREATE TABLE meta_formacion_profesional_integral (
    id INTEGER PRIMARY KEY,
    descripcion VARCHAR(500),
    meta INTEGER,
    ejecucion INTEGER,
    porcentaje_ejecucion DECIMAL(10,4),
    es_subtotal BOOLEAN,
    es_total BOOLEAN,
    nivel_jerarquia INTEGER,
    periodo VARCHAR(50)
);
```

**Registros especiales:**
- `es_subtotal = 1`: Subtotales intermedios (ej: SubTotal Tecnólogos)
- `es_total = 1`: Totales generales (ej: TOTAL FORMACIÓN LABORAL)
- `nivel_jerarquia`: 1=detalle, 2=subtotal, 3=total

#### 3. `formacion_por_nivel_programa`
Desagregación por nivel y programa especial.

```sql
CREATE TABLE formacion_por_nivel_programa (
    id INTEGER PRIMARY KEY,
    nivel_formacion VARCHAR(200),
    regular_meta, regular_ejecucion INTEGER,
    campesena_meta, campesena_ejecucion INTEGER,
    full_popular_meta, full_popular_ejecucion INTEGER,
    total_meta INTEGER,
    es_total BOOLEAN
);
```

**Niveles incluidos:**
- AUXILIAR
- OPERARIO
- TÉCNICO
- TECNÓLOGO
- COMPLEMENTARIA

#### 4. `programa_relevante`
Programas especiales de interés estratégico.

```sql
CREATE TABLE programa_relevante (
    id INTEGER PRIMARY KEY,
    descripcion VARCHAR(500),
    meta, ejecucion INTEGER,
    tipo VARCHAR(100)
);
```

**Tipos:**
- `Programa relevante`: CampeSENA, Full Popular, Virtual
- `Primer curso`: Tecnólogos Primer Curso

#### 5. `metrica_adicional`
Métricas complementarias (retención, certificación, emprendimiento, etc.).

```sql
CREATE TABLE metrica_adicional (
    id INTEGER PRIMARY KEY,
    categoria VARCHAR(200),
    nombre_metrica VARCHAR(500),
    meta, ejecucion DECIMAL(12,4),
    tipo_dato VARCHAR(50),
    es_total BOOLEAN
);
```

**Categorías incluidas:**
- RETENCIÓN
- CERTIFICACIÓN FORMACIÓN PROFESIONAL
- POBLACIONES VULNERABLES
- AGENCIA PUBLICA DE EMPLEO
- EMPRENDIMIENTO Y FORTALECIMIENTO
- CONTRATOS DE APRENDIZAJE
- Entre otras

#### 6. `relacion_jerarquica`
Define las relaciones padre-hijo entre indicadores.

```sql
CREATE TABLE relacion_jerarquica (
    id INTEGER PRIMARY KEY,
    tabla_origen VARCHAR(100),
    id_padre, id_hijo INTEGER,
    nombre_padre, nombre_hijo VARCHAR(500),
    operacion VARCHAR(20)
);
```

**Uso:** Reconstruir totales sumando sus componentes.

## Instalación

### Requisitos

```bash
pip install pandas odfpy
```

### Importación de Datos

```bash
python importar_a_sqlite.py
```

### Generación de Referencias JSON

```bash
python generar_referencias_json.py
```

Genera `referencias_totales.json` con:
- Jerarquías de indicadores
- Definiciones de totales
- Fórmulas de cálculo
- Indicadores transversales

## Uso

### Consultas SQL Básicas

#### Obtener el gran total
```sql
SELECT descripcion, meta, ejecucion,
       ROUND((ejecucion * 100.0 / meta), 2) as porcentaje
FROM meta_formacion_profesional_integral
WHERE descripcion LIKE 'TOTAL FORMACION PROFESIONAL INTEGRAL%';
```

#### Ver jerarquía completa
```sql
SELECT
    descripcion,
    meta,
    ejecucion,
    nivel_jerarquia,
    CASE
        WHEN es_total = 1 THEN 'TOTAL'
        WHEN es_subtotal = 1 THEN 'SUBTOTAL'
        ELSE 'DETALLE'
    END as tipo
FROM meta_formacion_profesional_integral
ORDER BY nivel_jerarquia DESC, descripcion;
```

#### Verificar totales
```sql
SELECT
    p.descripcion as padre,
    p.meta as meta_padre,
    SUM(h.meta) as suma_hijos,
    (p.meta - SUM(h.meta)) as diferencia
FROM relacion_jerarquica r
JOIN meta_formacion_profesional_integral p ON p.descripcion = r.nombre_padre
JOIN meta_formacion_profesional_integral h ON h.descripcion = r.nombre_hijo
GROUP BY p.id, p.descripcion, p.meta;
```

### Usar Referencias JSON

El archivo `referencias_totales.json` contiene:

```json
{
  "version": "1.0",
  "periodo": "2025_09",
  "jerarquias": {
    "TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)": {
      "tipo": "suma",
      "componentes": [
        "TOTAL FORMACION TITULADA (F = D+E)",
        "TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)"
      ]
    }
  },
  "totales": { ... },
  "calculos": { ... }
}
```

### Jerarquía Principal

```
TOTAL FORMACIÓN PROFESIONAL INTEGRAL (O)
├── TOTAL FORMACIÓN TITULADA (F)
│   ├── TOTAL FORMACIÓN LABORAL (D)
│   │   ├── SubTotal Auxiliares (A)
│   │   ├── SubTotal Operarios (B)
│   │   ├── SubTotal Técnico Laboral (C)
│   │   └── Profundización Técnica (T)
│   └── EDUCACIÓN SUPERIOR (E)
│       └── SubTotal Tecnólogos
└── TOTAL FORMACIÓN COMPLEMENTARIA (N)
    ├── Formación Complementaria - Virtual (G)
    ├── Formación Complementaria - Presencial (H)
    ├── SubTotal Programa de Bilingüismo (K)
    │   ├── Programa de Bilingüismo - Virtual (I)
    │   └── Programa de Bilingüismo - Presencial (J)
    ├── Formación Complementaria CampeSENA (L)
    └── Formación Complementaria Full Popular (M)
```

### Ejemplos de Cálculo

**Total Tecnólogos:**
```
SubTotal Tecnólogos = Σ(
  Tecnólogos Regular - Presencial,
  Tecnólogos Regular - Virtual,
  Tecnólogos Regular - A Distancia,
  Tecnólogos CampeSENA,
  Tecnólogos Full Popular
)
```

**Total Formación Laboral:**
```
TOTAL FORMACIÓN LABORAL (D) =
  SubTotal Auxiliares (A) +
  SubTotal Operarios (B) +
  SubTotal Técnico Laboral (C) +
  Profundización Técnica (T)
```

