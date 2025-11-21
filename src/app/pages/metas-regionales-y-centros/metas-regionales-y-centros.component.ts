import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XlsbApiService, FileInfo } from '../../services/xlsb-api.service';

/**
 * Interfaz para los datos de una regional desde la API
 * Basado en los atributos definidos en NOMBRES_ATRIBUTOS.md
 */
interface RegionalData {
  // Identificación
  Orden?: number;
  PERIODO?: number;
  COD_REGIONAL?: number;
  REGIONAL?: string;

  // Tecnólogos (Educación Superior)
  TEC_REG_PRE?: number;  // Tecnólogos Regular - Presencial
  TEC_REG_VIR?: number;  // Tecnólogos Regular - Virtual
  TEC_REG_A_D?: number;  // Tecnólogos Regular - A Distancia
  TEC_CAMPESE?: number;  // Tecnólogos CampeSENA
  TEC_FULL_PO?: number;  // Tecnólogos Full Popular
  TECNOLOGOS?: number;   // Subtotal Tecnólogos
  EDU_SUPERIO?: number;  // Total Educación Superior

  // Operarios
  OPE_REGULAR?: number;
  OPE_CAMPESE?: number;
  OPE_FULL_PO?: number;
  SUB_TOT_OPE?: number;

  // Auxiliares
  AUX_REGULAR?: number;
  AUX_CAMPESE?: number;
  AUX_FULL_PO?: number;
  SUB_TOT_AUX?: number;

  // Técnico Laboral
  TCO_REG_PRE?: number;
  TCO_REG_VIR?: number;
  TCO_CAMPESE?: number;
  TCO_FULL_PO?: number;
  TCO_ART_MED?: number;
  SUB_TCO_LAB?: number;

  // Profesional Técnico
  PROF_TECNIC?: number;

  // Totales Formación Laboral y Titulada
  TOT_FOR_LAB?: number;
  TOT_FOR_TIT?: number;

  // Formación Complementaria
  COM_VIR_SBI?: number;
  COM_PRE_SBI?: number;
  COM_BIL_VIR?: number;
  COM_BIL_PRE?: number;
  SUB_PRO_BIN?: number;
  COM_CAMPESE?: number;
  COM_FULL_PO?: number;
  TOT_COMPLEM?: number;

  // Totales FPI
  TOT_PROF_IN?: number;
  TOT_FP_CAME?: number;
  TOT_FP_FULL?: number;
  TOT_FP_VIRT?: number;

  // Metas (prefijo M_)
  M_FOR_LAB_P?: number;
  M_FOR_LAB_V?: number;
  M_FOR_LABOR?: number;
  M_EDU_SUP_P?: number;
  M_EDU_SUP_V?: number;
  M_TOT_E_SUP?: number;
  M_TOT_TIT_P?: number;
  M_TOT_TIT_V?: number;
  M_TOT_TITUL?: number;
  M_COMPLEM_P?: number;
  M_COMPLEM_V?: number;
  M_COMPLEM_T?: number;
  M_FRM_PRO_P?: number;
  M_FRM_PRO_V?: number;
  M_FRM_PRO_T?: number;
  M_PRG_BIL_P?: number;
  M_PRG_BIL_V?: number;
  M_PRG_BIL_T?: number;
  M_CAMPESENA?: number;
  M_FULL?: number;

  // Porcentajes (prefijo R_)
  R_FOR_LAB_P?: number;
  R_FOR_LAB_V?: number;
  R_FOR_LABOR?: number;
  R_EDU_SUP_P?: number;
  R_EDU_SUP_V?: number;
  R_TOT_E_SUP?: number;
  R_TOT_TIT_P?: number;
  R_TOT_TIT_V?: number;
  R_TOT_TITUL?: number;
  R_COMPLEM_P?: number;
  R_COMPLEM_V?: number;
  R_COMPLEM_T?: number;
  R_FRM_PRO_P?: number;
  R_FRM_PRO_V?: number;
  R_FRM_PRO_T?: number;
  R_PRG_BIL_P?: number;
  R_PRG_BIL_V?: number;
  R_PRG_BIL_T?: number;
  R_CAMPESENA?: number;
  R_FULL?: number;

  // Clasificación semáforo (prefijo C_)
  C_FORMA_LAB?: string;
  C_EDU_SUPER?: string;
  C_FRM_TITUL?: string;
  C_FRM_COMP?: string;
  C_FRM_PR_IN?: string;
  C_CAMPESENA?: string;
  C_FULL?: string;

  // Cualquier otro campo
  [key: string]: any;
}

interface TablaFila {
  descripcion: string;
  meta: number | null;
  ejecucion: number | null;
  porcentaje: number | null;
  esSubtotal?: boolean;
  esTotal?: boolean;
  nivel?: number;
}

@Component({
  selector: 'app-metas-regionales-y-centros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">Metas Regionales y Centros</div>
      <div class="page-subtitle">Datos desde API - Seguimiento de Metas por Regional</div>
    </div>

    <!-- Selector de archivo -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row">
          <div class="col-6">
            <label class="form-label"><strong>Archivo:</strong></label>
            <select class="form-select" [(ngModel)]="archivoSeleccionado" (change)="onArchivoChange()">
              <option value="">-- Seleccione un archivo --</option>
              <option *ngFor="let archivo of archivosDisponibles" [value]="archivo.file_id">
                {{ archivo.original_name }}
              </option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label"><strong>Regional:</strong></label>
            <select class="form-select" [(ngModel)]="regionalSeleccionada" (change)="onRegionalChange()"
                    [disabled]="!regionalesDisponibles.length">
              <option value="">-- Seleccione una regional --</option>
              <option *ngFor="let regional of regionalesDisponibles" [value]="regional.COD_REGIONAL">
                [{{ regional.COD_REGIONAL }}] {{ regional.REGIONAL }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay archivos -->
    <div class="card mb-3" *ngIf="!cargando && archivosDisponibles.length === 0">
      <div class="card-body text-center">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff9800;"></i>
        <p class="mt-2">No hay archivos disponibles en la API.</p>
        <p class="text-muted">Sube un archivo XLSB a la API para visualizar los datos.</p>
      </div>
    </div>

    <!-- Tablas de datos -->
    <div *ngIf="regionalActual">
      <!-- Metas Formación Profesional Integral -->
      <div class="card mb-3">
        <div class="card-header bg-sena">
          <h5 class="mb-0">
            <i class="fas fa-graduation-cap"></i>
            Metas Formación Profesional Integral - {{ regionalActual.REGIONAL }}
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-dark sticky-header">
                <tr>
                  <th class="text-left">Descripción</th>
                  <th class="text-right">META</th>
                  <th class="text-right">EJECUCIÓN</th>
                  <th class="text-right">% EJEC</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of tablaFPI"
                    [class.fila-subtotal]="fila.esSubtotal"
                    [class.fila-total]="fila.esTotal">
                  <td [style.padding-left]="(fila.nivel || 0) * 20 + 'px'">{{ fila.descripcion }}</td>
                  <td class="text-right">{{ fila.meta !== null ? (fila.meta | number) : 'N/A' }}</td>
                  <td class="text-right">{{ fila.ejecucion !== null ? (fila.ejecucion | number) : 'N/A' }}</td>
                  <td class="text-right">
                    <span *ngIf="fila.porcentaje !== null" class="badge" [ngClass]="getBadgeClass(fila.porcentaje)">
                      {{ fila.porcentaje | number:'1.2-2' }}%
                    </span>
                    <span *ngIf="fila.porcentaje === null" class="text-muted">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Metas Programas Relevantes -->
      <div class="card mb-3">
        <div class="card-header bg-sena">
          <h5 class="mb-0">
            <i class="fas fa-star"></i>
            Metas Programas Relevantes
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-dark sticky-header">
                <tr>
                  <th class="text-left">Descripción</th>
                  <th class="text-right">META</th>
                  <th class="text-right">EJECUCIÓN</th>
                  <th class="text-right">% EJEC</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of tablaProgramasRelevantes">
                  <td>{{ fila.descripcion }}</td>
                  <td class="text-right">{{ fila.meta !== null ? (fila.meta | number) : 'N/A' }}</td>
                  <td class="text-right">{{ fila.ejecucion !== null ? (fila.ejecucion | number) : 'N/A' }}</td>
                  <td class="text-right">
                    <span *ngIf="fila.porcentaje !== null" class="badge" [ngClass]="getBadgeClass(fila.porcentaje)">
                      {{ fila.porcentaje | number:'1.2-2' }}%
                    </span>
                    <span *ngIf="fila.porcentaje === null" class="text-muted">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Retención -->
      <div class="card mb-3">
        <div class="card-header bg-sena">
          <h5 class="mb-0">
            <i class="fas fa-chart-line"></i>
            Retención
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-dark sticky-header">
                <tr>
                  <th class="text-left">Descripción</th>
                  <th class="text-right">META</th>
                  <th class="text-right">EJECUCIÓN</th>
                  <th class="text-right">% EJEC</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of tablaRetencion">
                  <td>{{ fila.descripcion }}</td>
                  <td class="text-right">{{ fila.meta !== null ? (fila.meta | number:'1.0-0') + '%' : 'N/A' }}</td>
                  <td class="text-right">{{ fila.ejecucion !== null ? (fila.ejecucion | number:'1.2-2') + '%' : 'N/A' }}</td>
                  <td class="text-right">
                    <span *ngIf="fila.porcentaje !== null" class="badge" [ngClass]="getBadgeClass(fila.porcentaje)">
                      {{ fila.porcentaje | number:'1.2-2' }}%
                    </span>
                    <span *ngIf="fila.porcentaje === null" class="text-muted">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CampeSENA -->
      <div class="card mb-3">
        <div class="card-header bg-sena">
          <h5 class="mb-0">
            <i class="fas fa-leaf"></i>
            CampeSENA
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-dark sticky-header">
                <tr>
                  <th class="text-left">Descripción</th>
                  <th class="text-right">META</th>
                  <th class="text-right">EJECUCIÓN</th>
                  <th class="text-right">% EJEC</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of tablaCampesena">
                  <td>{{ fila.descripcion }}</td>
                  <td class="text-right">{{ fila.meta !== null ? (fila.meta | number) : 'N/A' }}</td>
                  <td class="text-right">{{ fila.ejecucion !== null ? (fila.ejecucion | number) : 'N/A' }}</td>
                  <td class="text-right">
                    <span *ngIf="fila.porcentaje !== null" class="badge" [ngClass]="getBadgeClass(fila.porcentaje)">
                      {{ fila.porcentaje | number:'1.2-2' }}%
                    </span>
                    <span *ngIf="fila.porcentaje === null" class="text-muted">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Full Popular -->
      <div class="card mb-3">
        <div class="card-header bg-sena">
          <h5 class="mb-0">
            <i class="fas fa-users"></i>
            Full Popular
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-dark sticky-header">
                <tr>
                  <th class="text-left">Descripción</th>
                  <th class="text-right">META</th>
                  <th class="text-right">EJECUCIÓN</th>
                  <th class="text-right">% EJEC</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of tablaFullPopular">
                  <td>{{ fila.descripcion }}</td>
                  <td class="text-right">{{ fila.meta !== null ? (fila.meta | number) : 'N/A' }}</td>
                  <td class="text-right">{{ fila.ejecucion !== null ? (fila.ejecucion | number) : 'N/A' }}</td>
                  <td class="text-right">
                    <span *ngIf="fila.porcentaje !== null" class="badge" [ngClass]="getBadgeClass(fila.porcentaje)">
                      {{ fila.porcentaje | number:'1.2-2' }}%
                    </span>
                    <span *ngIf="fila.porcentaje === null" class="text-muted">N/A</span>
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

    <!-- Nota TODO -->
    <div class="card mb-3" *ngIf="!cargando && regionalActual">
      <div class="card-body">
        <p class="text-muted mb-0">
          <strong>TODO:</strong> Las tablas de Certificación, Poblaciones Vulnerables, Agencia Pública de Empleo,
          Emprendimiento y Contratos de Aprendizaje requieren columnas adicionales que no están disponibles
          en los datos actuales. Estos datos deberán integrarse cuando estén disponibles en la API.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 600;
      color: var(--sena-negro);
      margin-bottom: 8px;
      display: block;
    }

    .form-select {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: all 0.3s;
      background-color: white;
    }

    .form-select:focus {
      border-color: var(--sena-verde);
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
    }

    .form-select:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .bg-sena {
      background: linear-gradient(135deg, var(--sena-verde-institucional) 0%, #2d7a00 100%);
      color: white;
    }

    .bg-sena h5 {
      color: white;
      margin: 0;
    }

    .table-responsive {
      max-height: 50vh;
      overflow-y: auto;
    }

    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: #212529 !important;
    }

    .table {
      margin-bottom: 0;
      font-size: 0.9rem;
    }

    .table th {
      padding: 12px 8px;
      font-weight: 600;
      white-space: nowrap;
    }

    .table td {
      padding: 8px;
      vertical-align: middle;
    }

    .fila-subtotal {
      background-color: #fff3e0 !important;
      font-weight: 600;
    }

    .fila-total {
      background-color: #e8f5e9 !important;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .badge {
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.85rem;
      min-width: 70px;
      display: inline-block;
      text-align: center;
    }

    .badge-success {
      background-color: var(--color-exito);
      color: white;
    }

    .badge-warning {
      background-color: var(--color-advertencia);
      color: var(--sena-negro);
    }

    .badge-danger {
      background-color: var(--color-peligro);
      color: white;
    }

    .text-muted {
      color: #6c757d;
    }

    .page-header {
      background: linear-gradient(135deg, #4CAF50 0%, #2d7a00 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .page-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }

    .card {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .card-header {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
      border-radius: 6px 6px 0 0;
    }

    .card-body {
      padding: 15px;
    }

    .mb-3 {
      margin-bottom: 20px;
    }

    .mb-0 {
      margin-bottom: 0;
    }

    .mt-2 {
      margin-top: 10px;
    }

    .row {
      display: flex;
      gap: 20px;
      margin: -10px;
    }

    .col-6 {
      flex: 1;
      padding: 10px;
    }

    .text-center {
      text-align: center;
    }

    .text-left {
      text-align: left;
    }

    .text-right {
      text-align: right;
    }

    .mt-3 {
      margin-top: 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #4CAF50;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    i.fas {
      margin-right: 8px;
    }
  `]
})
export class MetasRegionalesYCentrosComponent implements OnInit {
  cargando = true;
  archivosDisponibles: FileInfo[] = [];
  archivoSeleccionado: string = '';
  regionalesDisponibles: RegionalData[] = [];
  regionalSeleccionada: string = '';
  regionalActual: RegionalData | null = null;

  // Tablas de datos
  tablaFPI: TablaFila[] = [];
  tablaProgramasRelevantes: TablaFila[] = [];
  tablaRetencion: TablaFila[] = [];
  tablaCampesena: TablaFila[] = [];
  tablaFullPopular: TablaFila[] = [];

  constructor(private xlsbApiService: XlsbApiService) {}

  ngOnInit(): void {
    this.cargarArchivos();
  }

  cargarArchivos(): void {
    this.cargando = true;
    this.xlsbApiService.getFiles().subscribe({
      next: (archivos) => {
        this.archivosDisponibles = archivos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando archivos:', err);
        this.cargando = false;
      }
    });
  }

  onArchivoChange(): void {
    if (!this.archivoSeleccionado) {
      this.regionalesDisponibles = [];
      this.regionalSeleccionada = '';
      this.regionalActual = null;
      return;
    }

    this.cargando = true;
    this.xlsbApiService.getRegionalData(this.archivoSeleccionado).subscribe({
      next: (datos) => {
        this.regionalesDisponibles = datos;
        this.cargando = false;

        // Seleccionar primera regional si existe
        if (this.regionalesDisponibles.length > 0) {
          this.regionalSeleccionada = String(this.regionalesDisponibles[0].COD_REGIONAL);
          this.onRegionalChange();
        }
      },
      error: (err) => {
        console.error('Error cargando datos regionales:', err);
        this.cargando = false;
      }
    });
  }

  onRegionalChange(): void {
    if (!this.regionalSeleccionada) {
      this.regionalActual = null;
      this.limpiarTablas();
      return;
    }

    this.regionalActual = this.regionalesDisponibles.find(
      r => String(r.COD_REGIONAL) === this.regionalSeleccionada
    ) || null;

    if (this.regionalActual) {
      this.generarTablas();
    }
  }

  limpiarTablas(): void {
    this.tablaFPI = [];
    this.tablaProgramasRelevantes = [];
    this.tablaRetencion = [];
    this.tablaCampesena = [];
    this.tablaFullPopular = [];
  }

  generarTablas(): void {
    if (!this.regionalActual) return;

    const data = this.regionalActual;

    // Generar tabla de Formación Profesional Integral
    this.tablaFPI = this.generarTablaFPI(data);

    // Generar tabla de Programas Relevantes
    this.tablaProgramasRelevantes = this.generarTablaProgramasRelevantes(data);

    // Generar tabla de Retención
    this.tablaRetencion = this.generarTablaRetencion(data);

    // Generar tabla CampeSENA
    this.tablaCampesena = this.generarTablaCampesena(data);

    // Generar tabla Full Popular
    this.tablaFullPopular = this.generarTablaFullPopular(data);
  }

  /**
   * Genera la tabla de Metas Formación Profesional Integral
   */
  generarTablaFPI(data: RegionalData): TablaFila[] {
    return [
      // Tecnólogos
      this.crearFila('Tecnólogos Regular - Presencial', null, data.TEC_REG_PRE, null, 0),
      this.crearFila('Tecnólogos Regular - Virtual', null, data.TEC_REG_VIR, null, 0),
      this.crearFila('Tecnólogos Regular - A Distancia', null, data.TEC_REG_A_D, null, 0),
      this.crearFila('Tecnólogos CampeSENA', null, data.TEC_CAMPESE, null, 0),
      this.crearFila('Tecnólogos Full Popular', null, data.TEC_FULL_PO, null, 0),
      this.crearFila('SubTotal Tecnólogos (E)', null, data.TECNOLOGOS, null, 1, true),
      this.crearFila('EDUCACION SUPERIOR (=E)', data.M_TOT_E_SUP, data.EDU_SUPERIO, data.R_TOT_E_SUP, 2, false, true),

      // Operarios
      this.crearFila('Operarios Regular', null, data.OPE_REGULAR, null, 0),
      this.crearFila('Operarios CampeSENA', null, data.OPE_CAMPESE, null, 0),
      this.crearFila('Operarios Full Popular', null, data.OPE_FULL_PO, null, 0),
      this.crearFila('SubTotal Operarios (B)', null, data.SUB_TOT_OPE, null, 1, true),

      // Auxiliares
      this.crearFila('Auxiliares Regular', null, data.AUX_REGULAR, null, 0),
      this.crearFila('Auxiliares CampeSENA', null, data.AUX_CAMPESE, null, 0),
      this.crearFila('Auxiliares Full Popular', null, data.AUX_FULL_PO, null, 0),
      this.crearFila('SubTotal Auxiliares (A)', null, data.SUB_TOT_AUX, null, 1, true),

      // Técnico Laboral
      this.crearFila('Técnico Laboral Regular - Presencial', null, data.TCO_REG_PRE, null, 0),
      this.crearFila('Técnico Laboral Regular - Virtual', null, data.TCO_REG_VIR, null, 0),
      this.crearFila('Técnico Laboral CampeSENA', null, data.TCO_CAMPESE, null, 0),
      this.crearFila('Técnico Laboral Full Popular', null, data.TCO_FULL_PO, null, 0),
      this.crearFila('Técnico Laboral Articulación con la Media', null, data.TCO_ART_MED, null, 0),
      this.crearFila('SubTotal Técnico Laboral (C)', null, data.SUB_TCO_LAB, null, 1, true),

      // Profundización Técnica
      this.crearFila('Profundización Técnica (T)', null, data.PROF_TECNIC, null, 1, true),

      // Totales
      this.crearFila('TOTAL FORMACIÓN LABORAL (D=A+B+C+T)', data.M_FOR_LABOR, data.TOT_FOR_LAB, data.R_FOR_LABOR, 2, false, true),
      this.crearFila('TOTAL FORMACION TITULADA (F = D+E)', data.M_TOT_TITUL, data.TOT_FOR_TIT, data.R_TOT_TITUL, 2, false, true),

      // Formación Complementaria
      this.crearFila('Formación Complementaria - Virtual (Sin Bilingüismo) (G)', null, data.COM_VIR_SBI, null, 1, true),
      this.crearFila('Formación Complementaria - Presencial (Sin Bilingüismo) (H)', null, data.COM_PRE_SBI, null, 2, false, true),
      this.crearFila('Programa de Bilingüismo - Virtual (I)', null, data.COM_BIL_VIR, null, 0),
      this.crearFila('Programa de Bilingüismo - Presencial (J)', null, data.COM_BIL_PRE, null, 0),
      this.crearFila('SubTotal Programa de Bilinguïsmo (K = I + J)', data.M_PRG_BIL_T, data.SUB_PRO_BIN, data.R_PRG_BIL_T, 1, true),
      this.crearFila('Formación Complementaria CampeSENA (L)', null, data.COM_CAMPESE, null, 1, true),
      this.crearFila('Formación Complementaria Full Popular (M)', null, data.COM_FULL_PO, null, 1, true),
      this.crearFila('TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)', data.M_COMPLEM_T, data.TOT_COMPLEM, data.R_COMPLEM_T, 2, false, true),
      this.crearFila('TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)', data.M_FRM_PRO_T, data.TOT_PROF_IN, data.R_FRM_PRO_T, 2, false, true),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);
  }

  /**
   * Genera la tabla de Programas Relevantes
   */
  generarTablaProgramasRelevantes(data: RegionalData): TablaFila[] {
    return [
      this.crearFila('Total Formación Profesional CampeSENA', data.M_CAMPESENA, data.TOT_FP_CAME, data.R_CAMPESENA),
      this.crearFila('Total Formación Profesional Full Popular', data.M_FULL, data.TOT_FP_FULL, data.R_FULL),
      this.crearFila('Total Formación Profesional Integral - Virtual', data.M_FRM_PRO_V, data.TOT_FP_VIRT, data.R_FRM_PRO_V),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);
  }

  /**
   * Genera la tabla de Retención
   * TODO: Los datos de retención requieren columnas específicas que no están en NOMBRES_ATRIBUTOS.md
   */
  generarTablaRetencion(data: RegionalData): TablaFila[] {
    return [
      this.crearFila('FORMACIÓN LABORAL - Presencial', data.R_FOR_LAB_P ? 90 : null, data.R_FOR_LAB_P, null),
      this.crearFila('FORMACIÓN LABORAL - Virtual', data.R_FOR_LAB_V ? 84 : null, data.R_FOR_LAB_V, null),
      this.crearFila('TOTAL FORMACIÓN LABORAL', data.R_FOR_LABOR ? 87 : null, data.R_FOR_LABOR, null),
      this.crearFila('EDUCACION SUPERIOR - Presencial', data.R_EDU_SUP_P ? 92 : null, data.R_EDU_SUP_P, null),
      this.crearFila('EDUCACION SUPERIOR - Virtual', data.R_EDU_SUP_V ? 87 : null, data.R_EDU_SUP_V, null),
      this.crearFila('TOTAL EDUCACION SUPERIOR', data.R_TOT_E_SUP ? 90 : null, data.R_TOT_E_SUP, null),
      this.crearFila('CampeSENA', data.R_CAMPESENA ? 92 : null, data.R_CAMPESENA, null),
      this.crearFila('Full Popular', data.R_FULL ? 61 : null, data.R_FULL, null),
    ].filter(fila => fila.ejecucion !== null);
  }

  /**
   * Genera la tabla CampeSENA
   */
  generarTablaCampesena(data: RegionalData): TablaFila[] {
    return [
      this.crearFila('Tecnólogos CampeSENA', null, data.TEC_CAMPESE, null),
      this.crearFila('Operarios CampeSENA', null, data.OPE_CAMPESE, null),
      this.crearFila('Auxiliares CampeSENA', null, data.AUX_CAMPESE, null),
      this.crearFila('Técnico Laboral CampeSENA', null, data.TCO_CAMPESE, null),
      this.crearFila('Formación Complementaria CampeSENA (L)', null, data.COM_CAMPESE, null),
      this.crearFila('Total Formación Profesional CampeSENA', data.M_CAMPESENA, data.TOT_FP_CAME, data.R_CAMPESENA),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);
  }

  /**
   * Genera la tabla Full Popular
   */
  generarTablaFullPopular(data: RegionalData): TablaFila[] {
    return [
      this.crearFila('Tecnólogos Full Popular', null, data.TEC_FULL_PO, null),
      this.crearFila('Operarios Full Popular', null, data.OPE_FULL_PO, null),
      this.crearFila('Auxiliares Full Popular', null, data.AUX_FULL_PO, null),
      this.crearFila('Técnico Laboral Full Popular', null, data.TCO_FULL_PO, null),
      this.crearFila('Formación Complementaria Full Popular (M)', null, data.COM_FULL_PO, null),
      this.crearFila('Total Formación Profesional Full Popular', data.M_FULL, data.TOT_FP_FULL, data.R_FULL),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);
  }

  /**
   * Crea una fila de tabla con los valores proporcionados
   */
  crearFila(
    descripcion: string,
    meta: number | null | undefined,
    ejecucion: number | null | undefined,
    porcentaje: number | null | undefined,
    nivel: number = 0,
    esSubtotal: boolean = false,
    esTotal: boolean = false
  ): TablaFila {
    // Calcular porcentaje si no se proporciona y hay meta y ejecución
    let porcentajeCalculado = porcentaje ?? null;
    if (porcentajeCalculado === null && meta && ejecucion) {
      porcentajeCalculado = (ejecucion / meta) * 100;
    }

    return {
      descripcion,
      meta: meta ?? null,
      ejecucion: ejecucion ?? null,
      porcentaje: porcentajeCalculado,
      esSubtotal,
      esTotal,
      nivel
    };
  }

  getBadgeClass(porcentaje: number): string {
    if (porcentaje >= 90) return 'badge-success';
    if (porcentaje >= 70) return 'badge-warning';
    return 'badge-danger';
  }
}
