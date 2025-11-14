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
        <div class="col-3" *ngFor="let kpi of dashboardData.kpis; let i = index">
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

            <!-- Bot\u00f3n para expandir informaci\u00f3n -->
            <div class="info-toggle" (click)="togglePanel('kpi-' + i)">
              <span class="info-icon">{{ isPanelExpandido('kpi-' + i) ? '\u25bc' : '?' }}</span>
              <span class="info-text">{{ isPanelExpandido('kpi-' + i) ? 'Ocultar' : 'M\u00e1s informaci\u00f3n' }}</span>
            </div>

            <!-- Panel informativo colapsable -->
            <div class="info-panel" [class.expanded]="isPanelExpandido('kpi-' + i)">
              <div class="info-panel-content">
                <h4>Informaci\u00f3n del Indicador</h4>
                <div class="info-item">
                  <strong>Descripci\u00f3n:</strong>
                  <p>{{ kpi.titulo }} representa el seguimiento de la ejecuci\u00f3n frente a la meta establecida.</p>
                </div>
                <div class="info-item">
                  <strong>Estado actual:</strong>
                  <p>El indicador se encuentra en estado <strong>{{ getTextoEstado(kpi.estado) }}</strong> con un cumplimiento del {{ kpi.porcentaje }}%.</p>
                </div>
                <div class="info-item">
                  <strong>Diferencia:</strong>
                  <p>{{ kpi.ejecucion - kpi.meta > 0 ? 'Sobreejecuci\u00f3n de' : 'Brecha de' }} {{ (kpi.ejecucion - kpi.meta) | number }} unidades.</p>
                </div>
                <div class="info-item">
                  <strong>Interpretaci\u00f3n:</strong>
                  <ul>
                    <li *ngIf="kpi.estado === 'success'">El indicador muestra un desempe\u00f1o satisfactorio.</li>
                    <li *ngIf="kpi.estado === 'warning'">Se requiere atenci\u00f3n para alcanzar la meta establecida.</li>
                    <li *ngIf="kpi.estado === 'danger'">Es necesario implementar acciones correctivas urgentes.</li>
                  </ul>
                </div>
              </div>
            </div>
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
                <div class="col-4" *ngFor="let mod of dashboardData.estrategias; let j = index">
                  <div class="estrategia-card">
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

                      <!-- Bot\u00f3n para expandir informaci\u00f3n -->
                      <div class="info-toggle" (click)="togglePanel('estrategia-' + j)">
                        <span class="info-icon">{{ isPanelExpandido('estrategia-' + j) ? '\u25bc' : '?' }}</span>
                        <span class="info-text">{{ isPanelExpandido('estrategia-' + j) ? 'Ocultar' : 'M\u00e1s informaci\u00f3n' }}</span>
                      </div>

                      <!-- Panel informativo colapsable -->
                      <div class="info-panel" [class.expanded]="isPanelExpandido('estrategia-' + j)">
                        <div class="info-panel-content">
                          <h4>Informaci\u00f3n de la Estrategia</h4>
                          <div class="info-item">
                            <strong>Estrategia:</strong>
                            <p>{{ mod.estrategia }}</p>
                          </div>
                          <div class="info-item">
                            <strong>Cumplimiento:</strong>
                            <p>Se ha alcanzado un {{ mod.porcentaje }}% de la meta establecida.</p>
                          </div>
                          <div class="info-item">
                            <strong>Diferencia:</strong>
                            <p>{{ mod.ejecucion - mod.meta > 0 ? 'Sobreejecuci\u00f3n de' : 'Brecha de' }} {{ (mod.ejecucion - mod.meta) | number }} unidades.</p>
                          </div>
                          <div class="info-item">
                            <strong>Observaci\u00f3n:</strong>
                            <p *ngIf="mod.porcentaje >= 90">La estrategia muestra un excelente desempe\u00f1o.</p>
                            <p *ngIf="mod.porcentaje >= 70 && mod.porcentaje < 90">La estrategia tiene un buen avance, pero puede mejorar.</p>
                            <p *ngIf="mod.porcentaje < 70">Se recomienda reforzar las acciones de esta estrategia.</p>
                          </div>
                        </div>
                      </div>
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
  panelExpandido: {[key: string]: boolean} = {};

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

  togglePanel(id: string): void {
    this.panelExpandido[id] = !this.panelExpandido[id];
  }

  isPanelExpandido(id: string): boolean {
    return this.panelExpandido[id] || false;
  }
}
