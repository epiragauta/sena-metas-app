import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../models/meta.model';
import { MetasService } from '../../services/metas.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="dashboardData">
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
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--sena-verde); margin-bottom: 5px;">
              <strong>Meta:</strong> {{ kpi.meta | number }}
            </div>
            <div style="font-size: 1.1rem; font-weight: bold; color: var(--sena-gris); margin-bottom: 15px;">
              <strong>Ejecutado:</strong> {{ kpi.ejecucion | number }}
            </div>
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
            <div class="card-header">Cumplimiento por Estrategia</div>
            <div class="card-body">
              <div class="row">
                <div class="col-4" *ngFor="let mod of dashboardData.estrategias">
                  <div class="text-center p-2">
                    <h3>{{ mod.estrategia }}</h3>
                    <div class="kpi-percentage" [ngClass]="getClasePorcentaje(mod.porcentaje)">
                      {{ mod.porcentaje }}%
                    </div>
                    <div class="progress">
                      <div class="progress-bar" [ngClass]="getClasePorcentaje(mod.porcentaje)"
                           [style.width.%]="mod.porcentaje"></div>
                    </div>
                    <div class="mt-2">
                      <small>Ejecucion: {{ mod.ejecucion | number }} / Meta: {{ mod.meta | number }}</small>
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

    <!-- Loading -->
    <div *ngIf="cargando" class="text-center mt-3">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboardData?: DashboardData;
  cargando = true;

  constructor(private metasService: MetasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
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
  }

  getClasePorcentaje(porcentaje: number): string {
    return this.metasService.getClasePorcentaje(porcentaje);
  }

  getClaseEstado(estado: string): string {
    return `semaforo-${estado}`;
  }

  getTextoEstado(estado: string): string {
    const textos: {[key: string]: string} = {
      'success': 'Buena',
      'warning': 'Vulnerable',
      'danger': 'Baja'
    };
    return textos[estado] || estado;
  }
}
