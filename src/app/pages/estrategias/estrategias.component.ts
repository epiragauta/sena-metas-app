import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormacionPorNivel } from '../../models/meta.model';
import { MetasService } from '../../services/metas.service';

@Component({
  selector: 'app-estrategias',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-title">Formación por Estrategia</div>
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
               Meta: {{ nivel.regularMeta | number }} / Ejecucion: {{ nivel.regularEjecucion | number }}
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
              Meta: {{ nivel.campesenaMeta | number }} / Ejecucion: {{ nivel.campesenaEjecucion | number }}
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
              Meta: {{ nivel.fullPopularMeta | number }} / Ejecucion: {{ nivel.fullPopularEjecucion | number }}
            </div>
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
export class EstrategiasComponent implements OnInit {
  formacionPorNivel?: FormacionPorNivel[];
  cargando = true;

  constructor(private metasService: MetasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.metasService.getFormacionPorNivel().subscribe({
      next: (data) => {
        this.formacionPorNivel = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando formación por nivel:', err);
        this.cargando = false;
      }
    });
  }

  getClasePorcentaje(porcentaje: number): string {
    return this.metasService.getClasePorcentaje(porcentaje);
  }
}
