# Sistema de Enrutamiento - SENA Seguimiento de Metas

## Descripción

La aplicación Angular ha sido actualizada para usar el sistema de enrutamiento estándar de Angular (`@angular/router`), lo que permite:

- Navegación fluida entre páginas sin recargar toda la aplicación
- URLs amigables para cada sección
- Marcadores de navegación activos automáticos
- Soporte para navegación con el botón atrás del navegador
- Títulos de página dinámicos

## Estructura de Rutas

### Rutas Principales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | DashboardComponent | Redirección automática a `/dashboard` |
| `/dashboard` | DashboardComponent | Dashboard ejecutivo con KPIs principales |
| `/metas` | MetasComponent | Vista detallada de metas FPI con filtros |
| `/estrategias` | EstrategiasComponent | Comparación por estrategias (Regular, CampeSENA, Full Popular) |
| `/niveles` | NivelesComponent | Formación por nivel de formación |
| `/regionales` | MetasRegionalesComponent | Vista de metas por regional |
| `/**` | DashboardComponent | Cualquier ruta no encontrada redirige al dashboard |

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/app/app.routes.ts`**
   - Configuración de todas las rutas de la aplicación
   - Redirecciones y títulos de página

2. **`src/app/pages/dashboard/dashboard.component.ts`**
   - Componente independiente para la vista del dashboard
   - Extrae la lógica del AppComponent original

3. **`src/app/pages/metas/metas.component.ts`**
   - Componente independiente para la vista de metas FPI
   - Incluye filtros y estadísticas

4. **`src/app/pages/estrategias/estrategias.component.ts`**
   - Componente independiente para la vista de estrategias
   - Comparación Regular vs CampeSENA vs Full Popular

5. **`src/app/pages/niveles/niveles.component.ts`**
   - Componente independiente para la vista de niveles
   - Tabla de comparación por nivel de formación

### Archivos Modificados

1. **`src/app/app.component.ts`**
   - Simplificado para usar solo el navbar y `<router-outlet>`
   - Elimina toda la lógica de cambio de vistas manual
   - Usa `routerLink` y `routerLinkActive`

2. **`src/main.ts`**
   - Agregado `provideRouter(routes)` a los providers
   - Configura el enrutamiento en el bootstrap

## Características del Enrutamiento

### 1. Navegación con RouterLink

El navbar usa directivas `routerLink` para la navegación:

```html
<a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
```

### 2. Activación Automática

La clase CSS `active` se aplica automáticamente al enlace de la ruta activa usando `routerLinkActive`:

```css
.nav-link.active {
  background-color: var(--sena-naranja);
  color: white;
}
```

### 3. Componentes Standalone

Todos los componentes de página son standalone, lo que permite:
- Lazy loading futuro si es necesario
- Importaciones explícitas y claras
- Mejor tree-shaking

### 4. Títulos de Página

Cada ruta tiene su propio título configurado:

```typescript
{ path: 'dashboard', component: DashboardComponent, title: 'Dashboard - SENA Metas' }
```

## Cómo Usar

### Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

### Navegación Programática

Si necesitas navegar desde código TypeScript:

```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

navegarADashboard() {
  this.router.navigate(['/dashboard']);
}

navegarConParams() {
  this.router.navigate(['/metas'], { queryParams: { nivel: 3 } });
}
```

### Obtener Parámetros de Ruta

```typescript
import { ActivatedRoute } from '@angular/core';

constructor(private route: ActivatedRoute) {}

ngOnInit() {
  // Parámetros de query (?nivel=3)
  this.route.queryParams.subscribe(params => {
    const nivel = params['nivel'];
  });

  // Parámetros de ruta (/regional/:id)
  this.route.params.subscribe(params => {
    const id = params['id'];
  });
}
```

## Futuras Mejoras

### 1. Lazy Loading

Para mejorar el rendimiento, se pueden cargar módulos bajo demanda:

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  }
];
```

### 2. Guards

Agregar protección de rutas si se necesita autenticación:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminComponent
  }
];
```

### 3. Resolvers

Pre-cargar datos antes de activar una ruta:

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: { data: DashboardResolver }
  }
];
```

### 4. Parámetros de Ruta

Para vistas detalladas por ID:

```typescript
const routes: Routes = [
  { path: 'regional/:id', component: RegionalDetailComponent }
];
```

## Estructura de Carpetas

```
src/app/
├── pages/
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   ├── metas/
│   │   └── metas.component.ts
│   ├── estrategias/
│   │   └── estrategias.component.ts
│   └── niveles/
│       └── niveles.component.ts
├── components/
│   ├── filtros.component.ts
│   └── metas-regionales.component.ts
├── services/
│   └── metas.service.ts
├── models/
│   └── meta.model.ts
├── pipes/
│   └── filter-metas.pipe.ts
├── app.component.ts
└── app.routes.ts
```

## Migración desde el Sistema Anterior

### Antes (Sistema Manual)

```typescript
cambiarVista(vista: 'dashboard' | 'metas') {
  this.vistaActual = vista;
}

<a (click)="cambiarVista('dashboard')">Dashboard</a>
```

### Ahora (Angular Router)

```typescript
// No se necesita método cambiarVista

<a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
```

## Beneficios del Nuevo Sistema

1. **SEO Friendly**: URLs descriptivas que pueden ser indexadas
2. **Historial del Navegador**: Funciona correctamente con botones atrás/adelante
3. **Compartir Enlaces**: Los usuarios pueden copiar y compartir enlaces a secciones específicas
4. **Mejor UX**: Navegación más fluida y predecible
5. **Mantenibilidad**: Código más limpio y organizado
6. **Escalabilidad**: Fácil agregar nuevas rutas y funcionalidades

## Soporte

Para más información sobre Angular Router:
- [Documentación oficial de Angular Router](https://angular.dev/guide/routing)
- [Tutorial de Routing en Angular](https://angular.dev/tutorials/learn-angular/routing)
