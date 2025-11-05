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
              <th class="text-right">Meta</th>
              <th class="text-right">Ejecucion</th>
              <th class="text-right">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let nivel of formacionPorNivel"
                [style.background-color]="nivel.esTotal ? '#fff3e0' : 'white'"
                [style.font-weight]="nivel.esTotal ? 'bold' : 'normal'">
              <td>{{ nivel.nivelFormacion }}</td>
              <td class="text-right">{{ getMetaTotal(nivel) | number }}</td>
              <td class="text-right">{{ getEjecucionTotal(nivel) | number }}</td>
              <td class="text-right">
                <span class="badge"
                      [ngClass]="'badge-' + getClasePorcentaje(getCumplimientoTotal(nivel))">
                  {{ getCumplimientoTotal(nivel) | number:'1.2-2' }}%
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

  getMetaTotal(nivel: FormacionPorNivel): number {
    return (nivel.regularMeta || 0) + (nivel.campesenaMeta || 0) + (nivel.fullPopularMeta || 0);
  }

  getEjecucionTotal(nivel: FormacionPorNivel): number {
    return (nivel.regularEjecucion || 0) + (nivel.campesenaEjecucion || 0) + (nivel.fullPopularEjecucion || 0);
  }

  getCumplimientoTotal(nivel: FormacionPorNivel): number {
    const metaTotal = this.getMetaTotal(nivel);
    const ejecucionTotal = this.getEjecucionTotal(nivel);
    return metaTotal > 0 ? (ejecucionTotal / metaTotal) * 100 : 0;
  }
}