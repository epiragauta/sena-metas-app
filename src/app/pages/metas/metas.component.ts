import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, FiltrosMetas } from '../../models/meta.model';
import { MetasService } from '../../services/metas.service';
import { FiltrosComponent } from '../../components/filtros.component';
import { FilterMetasPipe } from '../../pipes/filter-metas.pipe';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, FiltrosComponent, FilterMetasPipe],
  template: `
    <div class="page-header">
      <div class="page-title">Metas de Formación Profesional Integral</div>
      <div class="page-subtitle">Detalle completo de metas y cumplimiento</div>
    </div>

    <!-- Componente de Filtros -->
    <div class="row" *ngIf="metas">
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
                </tr>
              </tbody>
            </table>
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
export class MetasComponent implements OnInit {
  metas?: Meta[];
  cargando = true;

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

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.metasService.getMetas().subscribe({
      next: (data) => {
        this.metas = data;
        this.cargando = false;
        this.actualizarEstadisticas();
      },
      error: (err) => {
        console.error('Error cargando metas:', err);
        this.cargando = false;
      }
    });
  }

  getClasePorcentaje(porcentaje: number): string {
    return this.metasService.getClasePorcentaje(porcentaje);
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
