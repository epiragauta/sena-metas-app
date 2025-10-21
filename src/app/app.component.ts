import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Meta, DashboardData, FormacionPorNivel, FiltrosMetas } from './models/meta.model';
import { MetasService } from './services/metas.service';
import { FiltrosComponent } from './components/filtros.component';
import { FilterMetasPipe } from './pipes/filter-metas.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FiltrosComponent, FilterMetasPipe],
  template: `
    <div class="navbar">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <div class="navbar-brand d-flex align-items-center">
          <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
               alt="Logo SENA"
               class="navbar-logo">
          <span>SENA - Seguimiento de Metas</span>
        </div>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" [class.active]="vistaActual === 'dashboard'"
               (click)="cambiarVista('dashboard')">Dashboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="vistaActual === 'metas'"
               (click)="cambiarVista('metas')">Metas FPI</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="vistaActual === 'modalidades'"
               (click)="cambiarVista('modalidades')">Estrategias</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="vistaActual === 'niveles'"
               (click)="cambiarVista('niveles')">Niveles</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="container-fluid">
      <!-- Dashboard Principal -->
      <div *ngIf="vistaActual === 'dashboard' && dashboardData">
        <div class="page-header fade-in">
          <div class="page-title">Dashboard Ejecutivo</div>
          <div class="page-subtitle">Seguimiento de Metas SENA - Septiembre 2025</div>
          <div class="text-muted" *ngIf="dashboardData.fechaElaboracion">
            <small>Fecha de actualización: {{ dashboardData.fechaElaboracion }}</small>
          </div>
        </div>

        <!-- KPIs Principales -->
        <div class="row">
          <div class="col-3" *ngFor="let kpi of dashboardData.kpis">
            <div class="card kpi-card fade-in">
              <div class="kpi-title">{{ kpi.titulo }}</div>
              <div class="kpi-percentage" [ngClass]="getClaseEstado(kpi.estado)">
                {{ kpi.porcentaje }}%
              </div>
              <div class="progress">
                <div class="progress-bar" [ngClass]="kpi.estado"
                     [style.width.%]="kpi.porcentaje"></div>
              </div>
              <div class="kpi-value">{{ kpi.ejecucion | number }}</div>
              <div class="kpi-meta">de {{ kpi.meta | number }}</div>
              <span class="badge" [ngClass]="'badge-' + kpi.estado">
                {{ getTextoEstado(kpi.estado) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Estrategias -->
        <div class="row mt-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header">Cumplimiento por Modalidad</div>
              <div class="card-body">
                <div class="row">
                  <div class="col-4" *ngFor="let mod of dashboardData.modalidades">
                    <div class="text-center p-2">
                      <h3>{{ mod.modalidad }}</h3>
                      <div class="kpi-percentage" [ngClass]="getClasePorcentaje(mod.porcentaje)">
                        {{ mod.porcentaje }}%
                      </div>
                      <div class="progress">
                        <div class="progress-bar" [ngClass]="getClasePorcentaje(mod.porcentaje)"
                             [style.width.%]="mod.porcentaje"></div>
                      </div>
                      <div class="mt-2">
                        <small>{{ mod.ejecucion | number }} / {{ mod.meta | number }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Cumplimiento y Mayor Brecha -->
        <div class="row mt-3">
          <div class="col-6">
            <div class="card">
              <div class="card-header">Top 5 - Mejor Cumplimiento</div>
              <div class="card-body">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th class="text-right">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of dashboardData.topCumplimiento">
                      <td>{{ item.descripcion }}</td>
                      <td class="text-right">
                        <span class="badge badge-success">{{ item.porcentaje }}%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-6">
            <div class="card">
              <div class="card-header">Top 5 - Mayor Brecha</div>
              <div class="card-body">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th class="text-right">Brecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of dashboardData.mayorBrecha">
                      <td>{{ item.descripcion }}</td>
                      <td class="text-right">
                        <span class="badge badge-warning">{{ item.brecha | number }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Fecha de Elaboración -->
        <div class="row mt-3" *ngIf="dashboardData.fechaElaboracion">
          <div class="col-12">
            <div class="text-right text-muted">
              <small><em>Fecha de elaboración: {{ dashboardData.fechaElaboracion }}</em></small>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Metas -->
      <div *ngIf="vistaActual === 'metas' && metas">
        <div class="page-header">
          <div class="page-title">Metas de Formación Profesional Integral</div>
          <div class="page-subtitle">Detalle completo de metas y cumplimiento</div>
        </div>

        <!-- Componente de Filtros -->
        <div class="row">
          <div class="col-3">
            <app-filtros
              [nivelesDisponibles]="[1, 2, 3, 4, 5]"
              [mostrarEstadisticas]="true"
              [estadisticas]="estadisticasFiltros"
              (filtrosChange)="onFiltrosChange($event)"
            ></app-filtros>
          </div>

          <div class="col-9">
            <div class="card">
              <div class="card-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th class="text-right">Meta</th>
                      <th class="text-right">Ejecución</th>
                      <th class="text-right">Cumplimiento</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let meta of metas | filterMetas: filtrosActuales"
                    [style.background-color]="meta.esTotal ? '#fff3e0' : (meta.esSubtotal ? '#fafafa' : 'white')"
                    [style.font-weight]="meta.esTotal ? 'bold' : (meta.esSubtotal ? '600' : 'normal')">
                  <td>{{ meta.descripcion }}</td>
                  <td class="text-right">{{ meta.meta | number }}</td>
                  <td class="text-right">{{ meta.ejecucion | number }}</td>
                  <td class="text-right">
                    <div class="progress" style="min-width: 100px;">
                      <div class="progress-bar" [ngClass]="getClasePorcentaje(meta.porcentaje)"
                           [style.width.%]="meta.porcentaje">
                        {{ meta.porcentaje }}%
                      </div>
                    </div>
                  </td>
                      <td>
                        <span class="badge"
                              [ngClass]="meta.esTotal ? 'badge-sena' : (meta.esSubtotal ? 'badge-info' : 'badge-secondary')">
                          {{ meta.esTotal ? 'TOTAL' : (meta.esSubtotal ? 'SUBTOTAL' : 'DETALLE') }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Estrategias -->
      <div *ngIf="vistaActual === 'modalidades' && formacionPorNivel">
        <div class="page-header">
          <div class="page-title">Formación por estrategia</div>
          <div class="page-subtitle">Comparación de Regular, CampeSENA y Full Popular</div>
        </div>

        <div class="card" *ngFor="let nivel of formacionPorNivel">
          <div class="card-header">{{ nivel.nivelFormacion }}</div>
          <div class="card-body">
            <div class="row">
              <div class="col-4" *ngIf="nivel.regularMeta">
                <h5>Regular</h5>
                <div class="kpi-percentage" [ngClass]="getClasePorcentaje(nivel.regularPorcentaje || 0)">
                  {{ nivel.regularPorcentaje || 0 }}%
                </div>
                <div class="progress">
                  <div class="progress-bar" [ngClass]="getClasePorcentaje(nivel.regularPorcentaje || 0)"
                       [style.width.%]="nivel.regularPorcentaje || 0"></div>
                </div>
                <div class="mt-2">
                  {{ nivel.regularEjecucion | number }} / {{ nivel.regularMeta | number }}
                </div>
              </div>

              <div class="col-4" *ngIf="nivel.campesenaMeta">
                <h5>CampeSENA</h5>
                <div class="kpi-percentage" [ngClass]="getClasePorcentaje(nivel.campesenaPorcentaje || 0)">
                  {{ nivel.campesenaPorcentaje || 0 }}%
                </div>
                <div class="progress">
                  <div class="progress-bar" [ngClass]="getClasePorcentaje(nivel.campesenaPorcentaje || 0)"
                       [style.width.%]="nivel.campesenaPorcentaje || 0"></div>
                </div>
                <div class="mt-2">
                  {{ nivel.campesenaEjecucion | number }} / {{ nivel.campesenaMeta | number }}
                </div>
              </div>

              <div class="col-4" *ngIf="nivel.fullPopularMeta">
                <h5>Full Popular</h5>
                <div class="kpi-percentage" [ngClass]="getClasePorcentaje(nivel.fullPopularPorcentaje || 0)">
                  {{ nivel.fullPopularPorcentaje || 0 }}%
                </div>
                <div class="progress">
                  <div class="progress-bar" [ngClass]="getClasePorcentaje(nivel.fullPopularPorcentaje || 0)"
                       [style.width.%]="nivel.fullPopularPorcentaje || 0"></div>
                </div>
                <div class="mt-2">
                  {{ nivel.fullPopularEjecucion | number }} / {{ nivel.fullPopularMeta | number }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Niveles -->
      <div *ngIf="vistaActual === 'niveles' && formacionPorNivel">
        <div class="page-header">
          <div class="page-title">Formación por Nivel</div>
          <div class="page-subtitle">Detalle de cumplimiento por nivel de formación</div>
        </div>

        <div class="card">
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Nivel de Formación</th>
                  <th class="text-right">Meta Total</th>
                  <th class="text-right">Regular</th>
                  <th class="text-right">CampeSENA</th>
                  <th class="text-right">Full Popular</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let nivel of formacionPorNivel"
                    [style.background-color]="nivel.esTotal ? '#fff3e0' : 'white'"
                    [style.font-weight]="nivel.esTotal ? 'bold' : 'normal'">
                  <td>{{ nivel.nivelFormacion }}</td>
                  <td class="text-right">{{ nivel.totalMeta | number }}</td>
                  <td class="text-right">
                    <span *ngIf="nivel.regularPorcentaje" class="badge"
                          [ngClass]="'badge-' + getClasePorcentaje(nivel.regularPorcentaje)">
                      {{ nivel.regularPorcentaje }}%
                    </span>
                  </td>
                  <td class="text-right">
                    <span *ngIf="nivel.campesenaPorcentaje" class="badge"
                          [ngClass]="'badge-' + getClasePorcentaje(nivel.campesenaPorcentaje)">
                      {{ nivel.campesenaPorcentaje }}%
                    </span>
                  </td>
                  <td class="text-right">
                    <span *ngIf="nivel.fullPopularPorcentaje" class="badge"
                          [ngClass]="'badge-' + getClasePorcentaje(nivel.fullPopularPorcentaje)">
                      {{ nivel.fullPopularPorcentaje }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="text-center mt-3">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    </div>
  `,
  providers: [MetasService]
})
export class AppComponent implements OnInit {
  vistaActual: 'dashboard' | 'metas' | 'modalidades' | 'niveles' = 'dashboard';
  cargando = true;

  dashboardData?: DashboardData;
  metas?: Meta[];
  formacionPorNivel?: FormacionPorNivel[];

  // Filtros
  filtrosActuales: FiltrosMetas = {};
  estadisticasFiltros?: {
    total: number;
    totales: number;
    subtotales: number;
    detalles: number;
    promedioEjecucion: number;
    promedioCumplimiento: number;
  };

  constructor(private metasService: MetasService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;

    // Cargar todos los datos
    this.metasService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.cargando = false;
      }
    });

    this.metasService.getMetas().subscribe({
      next: (data) => this.metas = data,
      error: (err) => console.error('Error cargando metas:', err)
    });

    this.metasService.getFormacionPorNivel().subscribe({
      next: (data) => this.formacionPorNivel = data,
      error: (err) => console.error('Error cargando formación por nivel:', err)
    });
  }

  cambiarVista(vista: 'dashboard' | 'metas' | 'modalidades' | 'niveles') {
    this.vistaActual = vista;
  }

  getClasePorcentaje(porcentaje: number): string {
    return this.metasService.getClasePorcentaje(porcentaje);
  }

  getClaseEstado(estado: string): string {
    return `semaforo-${estado}`;
  }

  getTextoEstado(estado: string): string {
    const textos: {[key: string]: string} = {
      'success': 'Excelente',
      'warning': 'En Progreso',
      'danger': 'Requiere Atención'
    };
    return textos[estado] || estado;
  }

  onFiltrosChange(filtros: FiltrosMetas): void {
    this.filtrosActuales = filtros;
    this.actualizarEstadisticas();
  }

  actualizarEstadisticas(): void {
    this.metasService.obtenerEstadisticasFiltradas(this.filtrosActuales).subscribe({
      next: (stats) => {
        this.estadisticasFiltros = stats;
      },
      error: (err) => console.error('Error calculando estadísticas:', err)
    });
  }
}
