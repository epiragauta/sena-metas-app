import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosMetas } from '../models/meta.model';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filtros-container">
      <div class="filtros-header">
        <h4>Filtros</h4>
        <button class="btn-reset" (click)="limpiarFiltros()">
          Limpiar Filtros
        </button>
      </div>

      <div class="filtros-body">
        <!-- Búsqueda por texto -->
        <div class="filtro-group">
          <label>Buscar</label>
          <input
            type="text"
            class="form-control"
            placeholder="Buscar en descripción..."
            [(ngModel)]="filtrosActuales.textoBusqueda"
            (ngModelChange)="onFiltrosChange()"
          />
        </div>

        <!-- Filtro por tipo -->
        <div class="filtro-group">
          <label>Tipo de Indicador</label>
          <select
            class="form-control"
            [(ngModel)]="filtrosActuales.tipo"
            (ngModelChange)="onFiltrosChange()"
          >
            <option value="todos">Todos</option>
            <option value="total">Totales</option>
            <option value="subtotal">Subtotales</option>
            <option value="detalle">Detalles</option>
          </select>
        </div>

        <!-- Filtro por niveles jerárquicos -->
        <div class="filtro-group">
          <label>Niveles Jerárquicos</label>
          <div class="checkbox-group">
            <label class="checkbox-label" *ngFor="let nivel of nivelesDisponibles">
              <input
                type="checkbox"
                [checked]="isNivelSeleccionado(nivel)"
                (change)="toggleNivel(nivel)"
              />
              Nivel {{ nivel }}
            </label>
          </div>
        </div>

        <!-- Filtro por rango de porcentaje -->
        <div class="filtro-group">
          <label>Rango de Cumplimiento (%)</label>
          <div class="range-inputs">
            <input
              type="number"
              class="form-control"
              placeholder="Mín"
              min="0"
              max="200"
              [(ngModel)]="filtrosActuales.porcentajeMin"
              (ngModelChange)="onFiltrosChange()"
            />
            <span class="range-separator">-</span>
            <input
              type="number"
              class="form-control"
              placeholder="Máx"
              min="0"
              max="200"
              [(ngModel)]="filtrosActuales.porcentajeMax"
              (ngModelChange)="onFiltrosChange()"
            />
          </div>
        </div>

        <!-- Filtros rápidos por estado -->
        <div class="filtro-group">
          <label>Filtros Rápidos</label>
          <div class="quick-filters">
            <button
              class="btn-quick-filter danger"
              (click)="aplicarFiltroRapido('bajo')"
            >
              Bajo (&lt; 70%)
            </button>
            <button
              class="btn-quick-filter warning"
              (click)="aplicarFiltroRapido('vulnerable')"
            >
              Vulnerable (70-85%)
            </button>
            <button
              class="btn-quick-filter success"
              (click)="aplicarFiltroRapido('buena')"
            >
              Buena (&gt; 85%)
            </button>
          </div>
        </div>

        <!-- Estadísticas de filtrado -->
        <div class="filtro-stats" *ngIf="mostrarEstadisticas && estadisticas">
          <div class="stats-header">Resultados</div>
          <div class="stats-item">
            <span class="stats-label">Total:</span>
            <span class="stats-value">{{ estadisticas.total }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">Totales:</span>
            <span class="stats-value">{{ estadisticas.totales }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">Subtotales:</span>
            <span class="stats-value">{{ estadisticas.subtotales }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">Detalles:</span>
            <span class="stats-value">{{ estadisticas.detalles }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">Promedio Cumplimiento:</span>
            <span class="stats-value">{{ estadisticas.promedioCumplimiento | number:'1.1-1' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filtros-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .filtros-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .filtros-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .btn-reset {
      background: #f44336;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .btn-reset:hover {
      background: #d32f2f;
    }

    .filtros-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .filtro-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filtro-group label {
      font-weight: 600;
      color: #555;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #ff6600;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox-label input[type="checkbox"] {
      cursor: pointer;
    }

    .range-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .range-inputs input {
      flex: 1;
    }

    .range-separator {
      color: #888;
      font-weight: bold;
    }

    .quick-filters {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-quick-filter {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      color: white;
      transition: opacity 0.2s;
    }

    .btn-quick-filter:hover {
      opacity: 0.8;
    }

    .btn-quick-filter.danger {
      background: #f44336;
    }

    .btn-quick-filter.warning {
      background: #ff9800;
    }

    .btn-quick-filter.success {
      background: #4caf50;
    }

    .filtro-stats {
      margin-top: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .stats-header {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .stats-item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      font-size: 0.875rem;
    }

    .stats-label {
      color: #666;
    }

    .stats-value {
      font-weight: 600;
      color: #333;
    }
  `]
})
export class FiltrosComponent {
  @Input() nivelesDisponibles: number[] = [1, 2, 3, 4, 5];
  @Input() mostrarEstadisticas: boolean = true;
  @Input() estadisticas?: {
    total: number;
    totales: number;
    subtotales: number;
    detalles: number;
    promedioEjecucion: number;
    promedioCumplimiento: number;
  };

  @Output() filtrosChange = new EventEmitter<FiltrosMetas>();

  filtrosActuales: FiltrosMetas = {
    tipo: 'todos',
    niveles: [],
    textoBusqueda: '',
    porcentajeMin: undefined,
    porcentajeMax: undefined
  };

  isNivelSeleccionado(nivel: number): boolean {
    return this.filtrosActuales.niveles?.includes(nivel) || false;
  }

  toggleNivel(nivel: number): void {
    if (!this.filtrosActuales.niveles) {
      this.filtrosActuales.niveles = [];
    }

    const index = this.filtrosActuales.niveles.indexOf(nivel);
    if (index > -1) {
      this.filtrosActuales.niveles.splice(index, 1);
    } else {
      this.filtrosActuales.niveles.push(nivel);
    }

    this.onFiltrosChange();
  }

  aplicarFiltroRapido(tipo: 'bajo' | 'vulnerable' | 'buena'): void {
    if (tipo === 'bajo') {
      this.filtrosActuales.porcentajeMin = 0;
      this.filtrosActuales.porcentajeMax = 70;
    } else if (tipo === 'vulnerable') {
      this.filtrosActuales.porcentajeMin = 70;
      this.filtrosActuales.porcentajeMax = 85;
    } else {
      this.filtrosActuales.porcentajeMin = 85;
      this.filtrosActuales.porcentajeMax = 200;
    }

    this.onFiltrosChange();
  }

  limpiarFiltros(): void {
    this.filtrosActuales = {
      tipo: 'todos',
      niveles: [],
      textoBusqueda: '',
      porcentajeMin: undefined,
      porcentajeMax: undefined
    };
    this.onFiltrosChange();
  }

  onFiltrosChange(): void {
    // Limpiar filtros vacíos
    const filtrosLimpios: FiltrosMetas = {};

    if (this.filtrosActuales.tipo && this.filtrosActuales.tipo !== 'todos') {
      filtrosLimpios.tipo = this.filtrosActuales.tipo;
    }

    if (this.filtrosActuales.niveles && this.filtrosActuales.niveles.length > 0) {
      filtrosLimpios.niveles = this.filtrosActuales.niveles;
    }

    if (this.filtrosActuales.textoBusqueda && this.filtrosActuales.textoBusqueda.trim() !== '') {
      filtrosLimpios.textoBusqueda = this.filtrosActuales.textoBusqueda;
    }

    if (this.filtrosActuales.porcentajeMin !== undefined && this.filtrosActuales.porcentajeMin !== null) {
      filtrosLimpios.porcentajeMin = this.filtrosActuales.porcentajeMin;
    }

    if (this.filtrosActuales.porcentajeMax !== undefined && this.filtrosActuales.porcentajeMax !== null) {
      filtrosLimpios.porcentajeMax = this.filtrosActuales.porcentajeMax;
    }

    this.filtrosChange.emit(filtrosLimpios);
  }
}
