# 🎓 SENA - Aplicación de Seguimiento de Metas

Aplicación web desarrollada en Angular para el seguimiento y visualización de metas de formación profesional integral del SENA.

## Características

- **Dashboard ejecutivo** con KPIs principales
- **Visualización por modalidades** (Regular, CampeSENA, Full Popular)
- **Detalle por niveles** de formación
- **Tablas interactivas** con todas las metas
- **Colores institucionales** SENA (naranja y negro)
- **Diseño responsive** adaptable a dispositivos móviles
- **Sin backend requerido** - Datos en JSON estáticos

## 📋 Requisitos Previos

- Node.js 18+ ([Descargar aquí](https://nodejs.org/))
- Angular CLI 17+ (se instalará con las dependencias)

##  Instalación

### 1. Navegar al directorio del proyecto

```bash
cd C:\ws\sena\data\seguimiento_metas\sena-metas-app
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará:
- Angular 17
- Chart.js para gráficas
- RxJS para manejo de datos
- Y todas las dependencias necesarias

## Ejecutar la Aplicación

### Modo desarrollo

```bash
npm start
```

O también:

```bash
ng serve
```

La aplicación estará disponible en: **http://localhost:4200**

### Modo desarrollo con puerto personalizado

```bash
ng serve --port 4300
```

## Compilar para Producción

```bash
npm run build
```

Los archivos compilados se generarán en `dist/sena-metas-app/`

Para servir la versión de producción localmente:

```bash
# Instalar servidor HTTP simple (solo primera vez)
npm install -g http-server

# Servir la aplicación
cd dist/sena-metas-app
http-server -p 8080
```

## Estructura del Proyecto

```
sena-metas-app/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── meta.model.ts           # Modelos de datos
│   │   ├── services/
│   │   │   └── metas.service.ts        # Servicio de datos
│   │   └── app.component.ts            # Componente principal
│   │
│   ├── assets/
│   │   └── data/                       # Datos JSON
│   │       ├── dashboard.json
│   │       ├── metas_fpi.json
│   │       ├── formacion_por_nivel.json
│   │       ├── programas_relevantes.json
│   │       ├── rangos_semaforo.json
│   │       ├── metricas_adicionales.json
│   │       ├── jerarquias.json
│   │       └── referencias_totales.json
│   │
│   ├── styles.css                      # Estilos globales
│   ├── index.html                      # HTML principal
│   └── main.ts                         # Punto de entrada
│
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

## Vistas de la Aplicación

### 1. Dashboard Ejecutivo

Muestra:
- **4 KPIs principales:**
  - Total Formación Profesional Integral
  - Total Formación Titulada
  - Total Formación Complementaria
  - Educación Superior

- **Cumplimiento por modalidad:**
  - Regular
  - CampeSENA
  - Full Popular

- **Top 5 mejor cumplimiento**
- **Top 5 mayor brecha**

### 2. Metas FPI

Tabla completa con:
- Todas las metas de formación profesional integral
- Diferenciación visual de TOTALES, SUBTOTALES y DETALLES
- Barras de progreso por indicador
- Ordenación por jerarquía

### 3. Modalidades

Comparación detallada de:
- Regular vs CampeSENA vs Full Popular
- Por cada nivel de formación
- Porcentajes de cumplimiento
- Valores absolutos de meta y ejecución

### 4. Niveles

Tabla resumen por nivel de formación mostrando:
- Meta total
- Porcentaje por cada modalidad
- Diferenciación de totales

## Colores Institucionales SENA

La aplicación utiliza la paleta de colores institucionales:

- **Naranja SENA:** `#FF5722` (principal)
- **Naranja Oscuro:** `#E64A19`
- **Negro SENA:** `#212121`
- **Gris:** `#757575`

### Colores de Estado

- **Éxito (≥90%):** Verde `#4CAF50`
- **Advertencia (70-89%):** Amarillo `#FFC107`
- **Peligro (<70%):** Rojo `#F44336`
- **Info:** Azul `#2196F3`

## Personalización

### Modificar Datos

Los datos se encuentran en `src/assets/data/*.json`. Para actualizar:

1. Modificar los archivos JSON directamente, o
2. Volver a exportar desde la base de datos SQLite:

```bash
cd C:\ws\sena\data\seguimiento_metas
python exportar_a_json.py
```

Luego copiar los archivos generados a `sena-metas-app/src/assets/data/`

### Agregar Nuevas Vistas

1. Editar `src/app/app.component.ts`
2. Agregar la nueva vista en el switch de navegación
3. Crear el template HTML correspondiente
4. Actualizar el menú de navegación

### Modificar Estilos

Los estilos globales están en `src/styles.css`. Las variables CSS están definidas en `:root`:

```css
:root {
  --sena-naranja: #FF5722;
  --sena-negro: #212121;
  /* ... más variables */
}
```

## Responsive Design

La aplicación es completamente responsive:

- **Desktop:** Vista completa con todas las columnas
- **Tablet:** Adaptación a 2 columnas
- **Mobile:** Vista de 1 columna con elementos apilados

##  Solución de Problemas

### Error: "Cannot find module '@angular/core'"

```bash
rm -rf node_modules
npm install
```

### Error: Puerto 4200 ya en uso

```bash
ng serve --port 4300
```

### Datos no se cargan

1. Verificar que los archivos JSON existen en `src/assets/data/`
2. Abrir la consola del navegador (F12) para ver errores
3. Verificar que el servidor de desarrollo está corriendo

### Errores de compilación TypeScript

```bash
# Limpiar cache
npm run build -- --delete-output-path
```

## Datos y Métricas

### Período de Datos

**Septiembre 2025**

### Fuente de Datos

Base de datos SQLite: `seguimiento_metas.db`

### Actualización de Datos

Para actualizar con datos de un nuevo período:

1. Importar nuevo archivo ODS:
```bash
python importar_a_sqlite.py
```

2. Exportar a JSON:
```bash
python exportar_a_json.py
```

3. Copiar archivos JSON a la aplicación Angular

## Deployment

### GitHub Pages

1. Compilar con base href:
```bash
ng build --base-href=/sena-metas-app/
```

2. Copiar contenido de `dist/sena-metas-app/` a rama gh-pages

### Netlify

1. Compilar:
```bash
npm run build
```

2. Subir carpeta `dist/sena-metas-app/` a Netlify

### Azure Static Web Apps

1. Conectar repositorio GitHub
2. Configurar build:
   - Build command: `npm run build`
   - Output directory: `dist/sena-metas-app`

## Notas Técnicas

- **Framework:** Angular 17 (Standalone Components)
- **Arquitectura:** Sin backend (JSON estático)
- **Gestión de Estado:** RxJS + HttpClient
- **Estilos:** CSS puro (sin framework CSS)
- **Gráficas:** Chart.js + ng2-charts
- **TypeScript:** 5.2+

