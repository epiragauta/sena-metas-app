import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormacionPorNivel } from '../../models/meta.model';
import { MetasService } from '../../services/metas.service';

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule],
  template: `
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

    <!-- Loading -->
    <div *ngIf="cargando" class="text-center mt-3">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>
  `
})
export class NivelesComponent implements OnInit {
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
