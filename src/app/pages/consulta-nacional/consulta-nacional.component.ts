import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { XlsbApiService, FileInfo } from '../../services/xlsb-api.service';
import { forkJoin } from 'rxjs';

interface MetasJson {
  data: MetaRegional[];
}

interface MetaRegional {
  'CÓDIGO REGIONAL': string;
  'NOMBRE REGIONAL': string;
  'EDUCACION SUPERIOR | Tecnologos Regular - Presencial | Cupos': number;
  'Tecnólogos Regular - Virtual | Cupos': number;
  'Tecnólogos Regular - A Distancia | Cupos': number;
  'Tecnólogos CampeSENA | Cupos': number;
  'Tecnólogos Full Popular | Cupos': number;
  'Total Tecnólogos (E) | Cupos': number;
  'TOTAL EDUCACION SUPERIOR (E) | Cupos': number;
  'FORMACIÓN LABORAL (Técnicos + Auxiliares + Operarios + Profundización Técnica) | Operarios Regular | Cupos': number;
  'Operarios CampeSENA | Cupos': number;
  'Operarios Full Popular | Cupos': number;
  'Total Operarios (B) | Cupos': number;
  'Auxiliares Regular | Cupos': number;
  'Auxiliares CampeSENA | Cupos': number;
  'Auxiliares Full Popular | Cupos': number;
  'Total Auxiliares (A) | Cupos': number;
  'Técnico Laboral Regular - Presencial | Cupos': number;
  'Técnico Laboral Regular - Virtual | Cupos': number;
  'Técnico Laboral CampeSENA | Cupos': number;
  'Técnico Laboral Full Popular | Cupos': number;
  'Técnico Laboral Articulación con la Media | Cupos': number;
  'Total Técnico Laboral (C) | Cupos': number;
  'Total Profundización Técnica (T) | Cupos': number;
  'TOTAL FORMACIÓN LABORAL (Operarios, Auxiliar  y técnico laboral, profundización técnica) (D=A+B+C+T) | Cupos': number;
  'TOTAL FORMACION TITULADA (F)  = (D+E) | Cupos': number;
  'Formación Complementaria - Virtual  (Sin Bilingüismo) (G) | Cupos': number;
  'Formación Complementaria - Presencial (Sin Bilingüismo) (H) | Cupos': number;
  'Programa de Bilingüismo - Virtual (I) | Cupos': number;
  'Programa de Bilingüismo - Presencial (J) | Cupos': number;
  'Total Programa de Bilinguïsmo (K) | Cupos': number;
  'Formación Complementaria CampeSENA (L) | Cupos': number;
  'Formación Complementaria Full Popular (M) | Cupos': number;
  'TOTAL FORMACION COMPLEMENTARIA (N) = (G+H+K+L+M) | Cupos': number;
  'TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F) | Cupos': number;
  [key: string]: any;
}

/**
 * Interfaz para los datos nacionales agregados
 * Permite cualquier clave string para flexibilidad con metas y porcentajes
 */
interface DatosNacionales {
  [key: string]: number | undefined;
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
  selector: 'app-consulta-nacional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">Consulta Nacional</div>
      <div class="page-subtitle">Consolidado Nacional de Metas y Ejecución</div>
    </div>

    <!-- Selector de archivo -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <label class="form-label"><strong>Archivo:</strong></label>
            <select class="form-select" [(ngModel)]="archivoSeleccionado" (change)="onArchivoChange()">
              <option value="">-- Seleccione un archivo --</option>
              <option *ngFor="let archivo of archivosDisponibles" [value]="archivo.file_id">
                {{ archivo.original_name }}
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
    <div *ngIf="datosNacionales">
      <!-- Tabla Principal: Metas Formación Profesional Integral -->
      <div class="card mb-3">
        <div class="card-header bg-sena" (click)="colapsadoFPI = !colapsadoFPI" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Metas Formación Profesional Integral</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoFPI">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoFPI">
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
        <div class="card-header bg-sena" (click)="colapsadoPR = !colapsadoPR" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Metas Programas Relevantes</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoPR">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoPR">
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
                <tr *ngFor="let fila of tablaProgramasRelevantes"
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

      <!-- Separador: Otras Metas -->
      <div class="section-separator">
        <h4>OTRAS METAS RELACIONADAS CON FORMACIÓN PROFESIONAL</h4>
      </div>

      <!-- Retención -->
      <div class="card mb-3">
        <div class="card-header bg-sena" (click)="colapsadoRET = !colapsadoRET" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Retención</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoRET">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoRET">
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
                <tr *ngFor="let fila of tablaRetencion"
                    [class.fila-subtotal]="fila.esSubtotal"
                    [class.fila-total]="fila.esTotal">
                  <td [style.padding-left]="(fila.nivel || 0) * 20 + 'px'">{{ fila.descripcion }}</td>
                  <td class="text-right">{{ fila.meta !== null ? (fila.meta | number:'1.2-2') + '%' : 'N/A' }}</td>
                  <td class="text-right">{{ fila.ejecucion !== null ? (fila.ejecucion | number:'1.2-2') + '%' : 'N/A' }}</td>
                  <td class="text-right">
                    <span *ngIf="fila.porcentaje !== null">
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

      <!-- Certificación -->
      <div class="card mb-3">
        <div class="card-header bg-sena" (click)="colapsadoCERT = !colapsadoCERT" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Certificación Formación Profesional</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoCERT">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoCERT">
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
                <tr *ngFor="let fila of tablaCertificacion"
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

      <!-- Certificación de Competencias Laborales -->
      <div class="card mb-3" *ngIf="tablaCompetenciasLaborales.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoCOMP = !colapsadoCOMP" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Certificación de Competencias Laborales</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoCOMP">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoCOMP">
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
                <tr *ngFor="let fila of tablaCompetenciasLaborales"
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

      <!-- Productividad CampeSENA -->
      <div class="card mb-3" *ngIf="tablaProductividadCampesena.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoPROD = !colapsadoPROD" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Productividad CampeSENA</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoPROD">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoPROD">
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
                <tr *ngFor="let fila of tablaProductividadCampesena"
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

      <!-- Poblaciones Vulnerables -->
      <div class="card mb-3" *ngIf="tablaPoblacionesVulnerables.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoPOBL = !colapsadoPOBL" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Poblaciones Vulnerables</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoPOBL">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoPOBL">
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
                <tr *ngFor="let fila of tablaPoblacionesVulnerables"
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

      <!-- Desagregación Otras Poblaciones Vulnerables -->
      <div class="card mb-3" *ngIf="tablaDesagregacionVulnerables.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoDESA = !colapsadoDESA" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Desagregación OTRAS POBLACIONES VULNERABLES</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoDESA">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoDESA">
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
                <tr *ngFor="let fila of tablaDesagregacionVulnerables"
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

      <!-- Agencia Pública de Empleo -->
      <div class="card mb-3" *ngIf="tablaAgenciaEmpleo.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoAPE = !colapsadoAPE" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Agencia Pública de Empleo</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoAPE">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoAPE">
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
                <tr *ngFor="let fila of tablaAgenciaEmpleo"
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

      <!-- Emprendimiento y Fortalecimiento -->
      <div class="card mb-3" *ngIf="tablaEmprendimiento.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoEMPR = !colapsadoEMPR" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Emprendimiento y Fortalecimiento</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoEMPR">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoEMPR">
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
                <tr *ngFor="let fila of tablaEmprendimiento"
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

      <!-- Fondo Emprender -->
      <div class="card mb-3" *ngIf="tablaFondoEmprender.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoFOND = !colapsadoFOND" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Fondo Emprender</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoFOND">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoFOND">
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
                <tr *ngFor="let fila of tablaFondoEmprender"
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

      <!-- Contratos de Aprendizaje -->
      <div class="card mb-3" *ngIf="tablaContratosAprendizaje.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoCONT = !colapsadoCONT" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Contratos de Aprendizaje</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoCONT">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoCONT">
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
                <tr *ngFor="let fila of tablaContratosAprendizaje"
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

      <!-- Internacionalización -->
      <div class="card mb-3" *ngIf="tablaInternacionalizacion.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoINTE = !colapsadoINTE" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Internacionalización</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoINTE">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoINTE">
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
                <tr *ngFor="let fila of tablaInternacionalizacion"
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

      <!-- Cupos Autorizados FIC -->
      <div class="card mb-3" *ngIf="tablaCuposFIC.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoFIC = !colapsadoFIC" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Cupos Autorizados FIC</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoFIC">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoFIC">
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
                <tr *ngFor="let fila of tablaCuposFIC"
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

      <!-- Estrategia Formación Continua Especial Campesina -->
      <div class="card mb-3" *ngIf="tablaFormacionContinuaCampesina.length > 0">
        <div class="card-header bg-sena" (click)="colapsadoFCEC = !colapsadoFCEC" style="cursor: pointer;">
          <h5 class="mb-0 d-flex justify-content-between align-items-center">
            <span>Estrategia Formación Continua Especial Campesina</span>
            <span class="toggle-icon" [class.collapsed]="colapsadoFCEC">▼</span>
          </h5>
        </div>
        <div class="card-body p-0" [class.collapsed]="colapsadoFCEC">
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
                <tr *ngFor="let fila of tablaFormacionContinuaCampesina"
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

    </div>

    <!-- Loading -->
    <div *ngIf="cargando" class="text-center mt-3">
      <div class="spinner"></div>
      <p>Cargando datos nacionales...</p>
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

    .badge-over {
      background-color: #FFC000;
      color: #000000;
    }

    .badge-success {
      background-color: #92D050;
      color: #006100;
    }

    .badge-warning {
      background-color: #FFFF00;
      color: #000000;
    }

    .badge-danger {
      background-color: #FF0000;
      color: white;
    }

    .text-muted {
      color: #6c757d;
    }

    .section-separator {
      background: linear-gradient(135deg, #2d7a00 0%, #4CAF50 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      margin: 25px 0 15px 0;
      text-align: center;
    }

    .section-separator h4 {
      margin: 0;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 0.5px;
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

    .col-12 {
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

    .card-header.bg-sena:hover {
      opacity: 0.95;
    }

    .d-flex {
      display: flex;
    }

    .justify-content-between {
      justify-content: space-between;
    }

    .align-items-center {
      align-items: center;
    }

    .toggle-icon {
      font-size: 18px;
      margin-left: 10px;
      transition: transform 0.3s ease;
      display: inline-block;
      transform: rotate(0deg);
    }

    .toggle-icon.collapsed {
      transform: rotate(-90deg);
    }

    .card-body {
      max-height: 2000px;
      overflow: hidden;
      transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out;
      opacity: 1;
    }

    .card-body.collapsed {
      max-height: 0;
      opacity: 0;
      transition: max-height 0.3s ease-in-out, opacity 0.2s ease-in-out;
    }
  `]
})
export class ConsultaNacionalComponent implements OnInit {
  cargando = true;
  archivosDisponibles: FileInfo[] = [];
  archivoSeleccionado: string = '';
  datosNacionales: DatosNacionales | null = null;

  // Tablas de datos
  tablaFPI: TablaFila[] = [];
  tablaProgramasRelevantes: TablaFila[] = [];
  tablaRetencion: TablaFila[] = [];
  tablaCertificacion: TablaFila[] = [];
  tablaCompetenciasLaborales: TablaFila[] = [];
  tablaProductividadCampesena: TablaFila[] = [];
  tablaPoblacionesVulnerables: TablaFila[] = [];
  tablaDesagregacionVulnerables: TablaFila[] = [];
  tablaAgenciaEmpleo: TablaFila[] = [];
  tablaEmprendimiento: TablaFila[] = [];
  tablaFondoEmprender: TablaFila[] = [];
  tablaContratosAprendizaje: TablaFila[] = [];
  tablaInternacionalizacion: TablaFila[] = [];
  tablaCuposFIC: TablaFila[] = [];
  tablaFormacionContinuaCampesina: TablaFila[] = [];

  // Estado de colapsables
  colapsadoFPI = false;
  colapsadoPR = true;
  colapsadoRET = true;
  colapsadoCERT = true;
  colapsadoCOMP = true;
  colapsadoPROD = true;
  colapsadoPOBL = true;
  colapsadoDESA = true;
  colapsadoAPE = true;
  colapsadoEMPR = true;
  colapsadoFOND = true;
  colapsadoCONT = true;
  colapsadoINTE = true;
  colapsadoFIC = true;
  colapsadoFCEC = true;

  private metasNacionales: DatosNacionales | null = null;

  constructor(
    private xlsbApiService: XlsbApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarMetasYArchivos();
  }

  cargarMetasYArchivos(): void {
    this.cargando = true;

    // Cargar metas del JSON y archivos disponibles en paralelo
    forkJoin({
      metas: this.http.get<MetasJson>('assets/data/Metas SENA 2025 V5 formacion x regional.json'),
      archivos: this.xlsbApiService.getFiles()
    }).subscribe({
      next: ({ metas, archivos }) => {
        this.metasNacionales = this.agregarMetasNacionales(metas.data);
        this.archivosDisponibles = archivos;
        if (archivos.length > 0) {
          this.archivoSeleccionado = archivos[0].file_id;
          this.cargarDatosEjecucion();
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.cargando = false;
      }
    });
  }

  agregarMetasNacionales(regionales: MetaRegional[]): DatosNacionales {
    const metas: DatosNacionales = {};

    const mapeo: { [key: string]: string } = {
      'M_TEC_REG_PRE': 'EDUCACION SUPERIOR | Tecnologos Regular - Presencial | Cupos',
      'M_TEC_REG_VIR': 'Tecnólogos Regular - Virtual | Cupos',
      'M_TEC_REG_A_D': 'Tecnólogos Regular - A Distancia | Cupos',
      'M_TEC_CAMPESE': 'Tecnólogos CampeSENA | Cupos',
      'M_TEC_FULL_PO': 'Tecnólogos Full Popular | Cupos',
      'M_TECNOLOGOS': 'Total Tecnólogos (E) | Cupos',
      'M_TOT_E_SUP': 'TOTAL EDUCACION SUPERIOR (E) | Cupos',
      'M_OPE_REGULAR': 'FORMACIÓN LABORAL (Técnicos + Auxiliares + Operarios + Profundización Técnica) | Operarios Regular | Cupos',
      'M_OPE_CAMPESE': 'Operarios CampeSENA | Cupos',
      'M_OPE_FULL_PO': 'Operarios Full Popular | Cupos',
      'M_SUB_TOT_OPE': 'Total Operarios (B) | Cupos',
      'M_AUX_REGULAR': 'Auxiliares Regular | Cupos',
      'M_AUX_CAMPESE': 'Auxiliares CampeSENA | Cupos',
      'M_AUX_FULL_PO': 'Auxiliares Full Popular | Cupos',
      'M_SUB_TOT_AUX': 'Total Auxiliares (A) | Cupos',
      'M_TCO_REG_PRE': 'Técnico Laboral Regular - Presencial | Cupos',
      'M_TCO_REG_VIR': 'Técnico Laboral Regular - Virtual | Cupos',
      'M_TCO_CAMPESE': 'Técnico Laboral CampeSENA | Cupos',
      'M_TCO_FULL_PO': 'Técnico Laboral Full Popular | Cupos',
      'M_TCO_ART_MED': 'Técnico Laboral Articulación con la Media | Cupos',
      'M_SUB_TCO_LAB': 'Total Técnico Laboral (C) | Cupos',
      'M_PROF_TECNIC': 'Total Profundización Técnica (T) | Cupos',
      'M_FOR_LABOR': 'TOTAL FORMACIÓN LABORAL (Operarios, Auxiliar  y técnico laboral, profundización técnica) (D=A+B+C+T) | Cupos',
      'M_TOT_TITUL': 'TOTAL FORMACION TITULADA (F)  = (D+E) | Cupos',
      'M_COM_VIR_SBI': 'Formación Complementaria - Virtual  (Sin Bilingüismo) (G) | Cupos',
      'M_COM_PRE_SBI': 'Formación Complementaria - Presencial (Sin Bilingüismo) (H) | Cupos',
      'M_COM_BIL_VIR': 'Programa de Bilingüismo - Virtual (I) | Cupos',
      'M_COM_BIL_PRE': 'Programa de Bilingüismo - Presencial (J) | Cupos',
      'M_PRG_BIL_T': 'Total Programa de Bilinguïsmo (K) | Cupos',
      'M_COM_CAMPESE': 'Formación Complementaria CampeSENA (L) | Cupos',
      'M_COM_FULL_PO': 'Formación Complementaria Full Popular (M) | Cupos',
      'M_COMPLEM_T': 'TOTAL FORMACION COMPLEMENTARIA (N) = (G+H+K+L+M) | Cupos',
      'M_FRM_PRO_T': 'TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F) | Cupos',
      // Programas Relevantes
      'M_TOT_FP_CAME': 'Metas Programas Relevantes | Total Formación Profesional CampeSENA | Cupos',
      'M_TOT_FP_FULL': 'Total Formación Profesional Full Popular | Cupos',
      'M_TOT_FP_VIRT': 'Total Formación Profesional Integral - Virtual | Cupos',
      // Retención
      'M_RET_FL_PRE': 'OTRAS METAS DE FORMACIÓN | RETENCIÓN | FORMACIÓN LABORAL  - Presencial',
      'M_RET_FL_VIR': 'FORMACIÓN LABORAL  - Virtual',
      'M_RET_FL_TOT': 'TOTAL FORMACIÓN LABORAL',
      'M_RET_ES_PRE': 'EDUCACION SUPERIOR -   Presencial',
      'M_RET_ES_VIR': 'EDUCACION SUPERIOR -  Virtual',
      'M_RET_ES_TOT': 'TOTAL EDUCACION SUPERIOR',
      'M_RET_TIT_PRE': 'TOTAL TITULADA -Presencial',
      'M_RET_TIT_VIR': 'TOTAL TITULADA - Virtual',
      'M_RET_TIT_TOT': 'TOTAL TITULADA',
      'M_RET_COM_PRE': 'COMPLEMENTARIA - Presencial',
      'M_RET_COM_VIR': 'COMPLEMENTARIA - Virtual',
      'M_RET_COM_TOT': 'TOTAL COMPLEMENTARIA',
      'M_RET_FP_PRE': 'TOTAL FORMACIÓN PROFESIONAL - Presencial',
      'M_RET_FP_VIR': 'TOTAL FORMACIÓN PROFESIONAL - Virtual',
      'M_RET_FP_TOT': 'TOTAL FORMACIÓN PROFESIONAL',
      'M_RET_BIL_PRE': 'PROGRAMA DE BILINGÜISMO- presencial',
      'M_RET_BIL_VIR': 'PROGRAMA DE BILINGÜISMO- virtual',
      'M_RET_BIL_TOT': 'PROGRAMA DE BILINGÜISMO',
      'M_RET_CAMPE': 'CampeSENA',
      'M_RET_FULL': 'Full  Popular'
    };

    // Campos de retención (son porcentajes - calcular promedio)
    const camposRetencion = [
      'M_RET_FL_PRE', 'M_RET_FL_VIR', 'M_RET_FL_TOT',
      'M_RET_ES_PRE', 'M_RET_ES_VIR', 'M_RET_ES_TOT',
      'M_RET_TIT_PRE', 'M_RET_TIT_VIR', 'M_RET_TIT_TOT',
      'M_RET_COM_PRE', 'M_RET_COM_VIR', 'M_RET_COM_TOT',
      'M_RET_FP_PRE', 'M_RET_FP_VIR', 'M_RET_FP_TOT',
      'M_RET_BIL_PRE', 'M_RET_BIL_VIR', 'M_RET_BIL_TOT',
      'M_RET_CAMPE', 'M_RET_FULL'
    ];

    // Agregar campos de Certificación
    mapeo['M_CERT_FL'] = 'CERTIFICACIÓN | FORMACIÓN LABORAL';
    mapeo['M_CERT_ES'] = 'EDUCACIÓN SUPERIOR';
    mapeo['M_CERT_FT'] = 'TOTAL FORMACIÓN TITULADA';
    mapeo['M_CERT_FC'] = 'TOTAL FORMACIÓN COMPLEMENTARIA';
    mapeo['M_CERT_FPI'] = 'TOTAL FORMACIÓN PROFESIONAL INTEGRAL';
    mapeo['M_CERT_ARM'] = 'ARTICULACION CON LA MEDIA - (Incluidas en Formación laboral)';
    mapeo['M_CERT_CAM'] = 'CampeSENA (Incluidas en Formación Profesional Integral)';
    mapeo['M_CERT_FUL'] = 'Full  Popular (Incluidas en Formación Profesional Integral)';

    const contadores: { [key: string]: number } = {};

    regionales.forEach(reg => {
      Object.keys(mapeo).forEach(key => {
        const campo = mapeo[key];
        const valor = reg[campo] || 0;

        if (camposRetencion.includes(key)) {
          // Para retención: acumular para promedio
          metas[key] = (metas[key] || 0) + valor;
          contadores[key] = (contadores[key] || 0) + 1;
        } else {
          // Para cupos: sumar
          metas[key] = (metas[key] || 0) + valor;
        }
      });
    });

    // Calcular promedio para campos de retención
    camposRetencion.forEach(key => {
      if (metas[key] && contadores[key]) {
        metas[key] = metas[key]! / contadores[key];
      }
    });

    return metas;
  }

  cargarDatosEjecucion(): void {
    if (!this.archivoSeleccionado) return;

    this.cargando = true;
    this.xlsbApiService.getRegionalData(this.archivoSeleccionado).subscribe({
      next: (datos) => {
        const ejecucion = this.agregarDatosNacionales(datos);
        this.datosNacionales = this.combinarMetasYEjecucion(ejecucion);
        this.generarTablas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando datos regionales:', err);
        this.cargando = false;
      }
    });
  }

  combinarMetasYEjecucion(ejecucion: DatosNacionales): DatosNacionales {
    const combinado = { ...ejecucion };

    if (this.metasNacionales) {
      // Copiar todas las metas
      Object.keys(this.metasNacionales).forEach(key => {
        combinado[key] = this.metasNacionales![key];
      });

      // Calcular porcentajes
      const porcentajes: [string, string, string][] = [
        ['R_TEC_REG_PRE', 'TEC_REG_PRE', 'M_TEC_REG_PRE'],
        ['R_TEC_REG_VIR', 'TEC_REG_VIR', 'M_TEC_REG_VIR'],
        ['R_TEC_REG_A_D', 'TEC_REG_A_D', 'M_TEC_REG_A_D'],
        ['R_TEC_CAMPESE', 'TEC_CAMPESE', 'M_TEC_CAMPESE'],
        ['R_TEC_FULL_PO', 'TEC_FULL_PO', 'M_TEC_FULL_PO'],
        ['R_TECNOLOGOS', 'TECNOLOGOS', 'M_TECNOLOGOS'],
        ['R_TOT_E_SUP', 'EDU_SUPERIO', 'M_TOT_E_SUP'],
        ['R_OPE_REGULAR', 'OPE_REGULAR', 'M_OPE_REGULAR'],
        ['R_OPE_CAMPESE', 'OPE_CAMPESE', 'M_OPE_CAMPESE'],
        ['R_OPE_FULL_PO', 'OPE_FULL_PO', 'M_OPE_FULL_PO'],
        ['R_SUB_TOT_OPE', 'SUB_TOT_OPE', 'M_SUB_TOT_OPE'],
        ['R_AUX_REGULAR', 'AUX_REGULAR', 'M_AUX_REGULAR'],
        ['R_AUX_CAMPESE', 'AUX_CAMPESE', 'M_AUX_CAMPESE'],
        ['R_AUX_FULL_PO', 'AUX_FULL_PO', 'M_AUX_FULL_PO'],
        ['R_SUB_TOT_AUX', 'SUB_TOT_AUX', 'M_SUB_TOT_AUX'],
        ['R_TCO_REG_PRE', 'TCO_REG_PRE', 'M_TCO_REG_PRE'],
        ['R_TCO_REG_VIR', 'TCO_REG_VIR', 'M_TCO_REG_VIR'],
        ['R_TCO_CAMPESE', 'TCO_CAMPESE', 'M_TCO_CAMPESE'],
        ['R_TCO_FULL_PO', 'TCO_FULL_PO', 'M_TCO_FULL_PO'],
        ['R_TCO_ART_MED', 'TCO_ART_MED', 'M_TCO_ART_MED'],
        ['R_SUB_TCO_LAB', 'SUB_TCO_LAB', 'M_SUB_TCO_LAB'],
        ['R_PROF_TECNIC', 'PROF_TECNIC', 'M_PROF_TECNIC'],
        ['R_FOR_LABOR', 'TOT_FOR_LAB', 'M_FOR_LABOR'],
        ['R_TOT_TITUL', 'TOT_FOR_TIT', 'M_TOT_TITUL'],
        ['R_COM_VIR_SBI', 'COM_VIR_SBI', 'M_COM_VIR_SBI'],
        ['R_COM_PRE_SBI', 'COM_PRE_SBI', 'M_COM_PRE_SBI'],
        ['R_COM_BIL_VIR', 'COM_BIL_VIR', 'M_COM_BIL_VIR'],
        ['R_COM_BIL_PRE', 'COM_BIL_PRE', 'M_COM_BIL_PRE'],
        ['R_PRG_BIL_T', 'SUB_PRO_BIN', 'M_PRG_BIL_T'],
        ['R_COM_CAMPESE', 'COM_CAMPESE', 'M_COM_CAMPESE'],
        ['R_COM_FULL_PO', 'COM_FULL_PO', 'M_COM_FULL_PO'],
        ['R_COMPLEM_T', 'TOT_COMPLEM', 'M_COMPLEM_T'],
        ['R_FRM_PRO_T', 'TOT_PROF_IN', 'M_FRM_PRO_T']
      ];

      porcentajes.forEach(([resultado, ejecucionKey, metaKey]) => {
        combinado[resultado] = this.calcularPorcentaje(combinado[ejecucionKey], combinado[metaKey]);
      });

      // Calcular porcentajes de Certificación
      combinado['R_CERT_FL'] = this.calcularPorcentaje(combinado['C_FORMA_LAB'], combinado['M_CERT_FL']);
      combinado['R_CERT_ES'] = this.calcularPorcentaje(combinado['C_EDU_SUPER'], combinado['M_CERT_ES']);
      combinado['R_CERT_FT'] = this.calcularPorcentaje(combinado['C_FRM_TITUL'], combinado['M_CERT_FT']);
      combinado['R_CERT_FC'] = this.calcularPorcentaje(combinado['C_FRM_COMP'], combinado['M_CERT_FC']);
      combinado['R_CERT_FPI'] = this.calcularPorcentaje(combinado['C_FRM_PR_IN'], combinado['M_CERT_FPI']);
      combinado['R_CERT_ARM'] = this.calcularPorcentaje(combinado['C_TCO_ARMED'], combinado['M_CERT_ARM']);
      combinado['R_CERT_CAM'] = this.calcularPorcentaje(combinado['C_CAMPESENA'], combinado['M_CERT_CAM']);
      combinado['R_CERT_FUL'] = this.calcularPorcentaje(combinado['C_FULL'], combinado['M_CERT_FUL']);
    }

    return combinado;
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
      this.datosNacionales = null;
      this.limpiarTablas();
      return;
    }

    this.cargando = true;
    this.xlsbApiService.getRegionalData(this.archivoSeleccionado).subscribe({
      next: (datos) => {
        // Agregar datos de todas las regionales
        this.datosNacionales = this.agregarDatosNacionales(datos);
        this.generarTablas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando datos regionales:', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Agrega los datos de todas las regionales para obtener el consolidado nacional
   */
  agregarDatosNacionales(regionales: any[]): DatosNacionales {
    const agregado: DatosNacionales = {};

    const camposASumar = [
      // Tecnólogos
      'TEC_REG_PRE', 'TEC_REG_VIR', 'TEC_REG_A_D', 'TEC_CAMPESE', 'TEC_FULL_PO', 'TECNOLOGOS', 'EDU_SUPERIO',
      // Operarios
      'OPE_REGULAR', 'OPE_CAMPESE', 'OPE_FULL_PO', 'SUB_TOT_OPE',
      // Auxiliares
      'AUX_REGULAR', 'AUX_CAMPESE', 'AUX_FULL_PO', 'SUB_TOT_AUX',
      // Técnico Laboral
      'TCO_REG_PRE', 'TCO_REG_VIR', 'TCO_CAMPESE', 'TCO_FULL_PO', 'TCO_ART_MED', 'SUB_TCO_LAB',
      // Profundización Técnica
      'PROF_TECNIC',
      // Totales
      'TOT_FOR_LAB', 'TOT_FOR_TIT',
      // Formación Complementaria
      'COM_VIR_SBI', 'COM_PRE_SBI', 'COM_BIL_VIR', 'COM_BIL_PRE', 'SUB_PRO_BIN',
      'COM_CAMPESE', 'COM_FULL_PO', 'TOT_COMPLEM',
      // Totales FPI
      'TOT_PROF_IN', 'TOT_FP_CAME', 'TOT_FP_FULL', 'TOT_FP_VIRT',
      // Metas
      'M_TOT_E_SUP', 'M_FOR_LABOR', 'M_TOT_TITUL', 'M_COMPLEM_T', 'M_FRM_PRO_T',
      'M_PRG_BIL_T', 'M_CAMPESENA', 'M_FULL', 'M_FRM_PRO_V',
      // Certificación
      'C_FORMA_LAB', 'C_EDU_SUPER', 'C_FRM_TITUL', 'C_FRM_COMP', 'C_FRM_PR_IN',
      'C_TCO_ARMED', 'C_CAMPESENA', 'C_FULL',
      // Estrategia Formación Continua Especial Campesina
      'SUB_COM_FCEC', 'C_COM_FCEC', 'SUB_COM_FCEF', 'C_COM_FCEF',
      // Técnico Laboral STC
      'SUB_TCO_STC', 'C_TCO_STC'
    ];

    // Campos de retención de la API (son porcentajes - promediar)
    const camposRetencionAPI = [
      'R_FOR_LAB_P', 'R_FOR_LAB_V',
      'R_EDU_SUP_P', 'R_EDU_SUP_V',
      'R_TOT_TIT_P', 'R_TOT_TIT_V',
      'R_COMPLEM_P', 'R_COMPLEM_V',
      'R_FRM_PRO_P', 'R_FRM_PRO_V',
      'R_PRG_BIL_P', 'R_PRG_BIL_V',
      'R_CAMPESENA', 'R_FULL'
    ];
    const contadoresRet: { [key: string]: number } = {};

    // Sumar todos los campos
    regionales.forEach(regional => {
      camposASumar.forEach(campo => {
        const valor = regional[campo];
        if (valor && !isNaN(valor)) {
          agregado[campo] = (agregado[campo] || 0) + Number(valor);
        }
      });

      // Acumular porcentajes de retención para promediar
      camposRetencionAPI.forEach(campo => {
        const valor = regional[campo];
        if (valor && !isNaN(valor)) {
          agregado[campo] = (agregado[campo] || 0) + Number(valor);
          contadoresRet[campo] = (contadoresRet[campo] || 0) + 1;
        }
      });
    });

    // Calcular promedio para retención de la API
    camposRetencionAPI.forEach(campo => {
      if (agregado[campo] && contadoresRet[campo]) {
        agregado[campo] = agregado[campo]! / contadoresRet[campo];
      }
    });

    // Calcular porcentajes
    agregado['R_TOT_E_SUP'] = this.calcularPorcentaje(agregado['EDU_SUPERIO'], agregado['M_TOT_E_SUP']);
    agregado['R_FOR_LABOR'] = this.calcularPorcentaje(agregado['TOT_FOR_LAB'], agregado['M_FOR_LABOR']);
    agregado['R_TOT_TITUL'] = this.calcularPorcentaje(agregado['TOT_FOR_TIT'], agregado['M_TOT_TITUL']);
    agregado['R_COMPLEM_T'] = this.calcularPorcentaje(agregado['TOT_COMPLEM'], agregado['M_COMPLEM_T']);
    agregado['R_FRM_PRO_T'] = this.calcularPorcentaje(agregado['TOT_PROF_IN'], agregado['M_FRM_PRO_T']);
    agregado['R_CAMPESENA'] = this.calcularPorcentaje(agregado['TOT_FP_CAME'], agregado['M_CAMPESENA']);
    agregado['R_FULL'] = this.calcularPorcentaje(agregado['TOT_FP_FULL'], agregado['M_FULL']);
    agregado['R_FRM_PRO_V'] = this.calcularPorcentaje(agregado['TOT_FP_VIRT'], agregado['M_FRM_PRO_V']);
    agregado['R_PRG_BIL_T'] = this.calcularPorcentaje(agregado['SUB_PRO_BIN'], agregado['M_PRG_BIL_T']);

    return agregado;
  }

  calcularPorcentaje(ejecucion?: number, meta?: number): number | undefined {
    if (!ejecucion || !meta || meta === 0) return undefined;
    return (ejecucion / meta) * 100;
  }

  limpiarTablas(): void {
    this.tablaFPI = [];
    this.tablaProgramasRelevantes = [];
    this.tablaRetencion = [];
    this.tablaCertificacion = [];
    this.tablaCompetenciasLaborales = [];
    this.tablaProductividadCampesena = [];
    this.tablaPoblacionesVulnerables = [];
    this.tablaDesagregacionVulnerables = [];
    this.tablaAgenciaEmpleo = [];
    this.tablaEmprendimiento = [];
    this.tablaFondoEmprender = [];
    this.tablaContratosAprendizaje = [];
    this.tablaInternacionalizacion = [];
    this.tablaCuposFIC = [];
    this.tablaFormacionContinuaCampesina = [];
  }

  generarTablas(): void {
    if (!this.datosNacionales) return;

    const d = this.datosNacionales;

    // Tabla FPI completa (basada en la estructura del componente API Metas)
    this.tablaFPI = [
      // Tecnólogos
      this.crearFila('Tecnólogos Regular - Presencial', d['M_TEC_REG_PRE'], d['TEC_REG_PRE'], null),
      this.crearFila('Tecnólogos Regular - Virtual', d['M_TEC_REG_VIR'], d['TEC_REG_VIR'], null),
      this.crearFila('Tecnólogos Regular - A Distancia', d['M_TEC_REG_A_D'], d['TEC_REG_A_D'], null),
      this.crearFila('Tecnólogos CampeSENA', d['M_TEC_CAMPESE'], d['TEC_CAMPESE'], null),
      this.crearFila('Tecnólogos Full Popular', d['M_TEC_FULL_PO'], d['TEC_FULL_PO'], null),
      this.crearFila('SubTotal Tecnólogos (E)', d['M_TECNOLOGOS'], d['TECNOLOGOS'], null, true),
      this.crearFila('EDUCACION SUPERIOR (=E)', d['M_TOT_E_SUP'], d['EDU_SUPERIO'], d['R_TOT_E_SUP'], false, true),

      // Operarios
      this.crearFila('Operarios Regular', d['M_OPE_REGULAR'], d['OPE_REGULAR'], null),
      this.crearFila('Operarios CampeSENA', d['M_OPE_CAMPESE'], d['OPE_CAMPESE'], null),
      this.crearFila('Operarios Full Popular', d['M_OPE_FULL_PO'], d['OPE_FULL_PO'], null),
      this.crearFila('SubTotal Operarios (B)', d['M_SUB_TOT_OPE'], d['SUB_TOT_OPE'], null, true),

      // Auxiliares
      this.crearFila('Auxiliares Regular', d['M_AUX_REGULAR'], d['AUX_REGULAR'], null),
      this.crearFila('Auxiliares CampeSENA', d['M_AUX_CAMPESE'], d['AUX_CAMPESE'], null),
      this.crearFila('Auxiliares Full Popular', d['M_AUX_FULL_PO'], d['AUX_FULL_PO'], null),
      this.crearFila('SubTotal Auxiliares (A)', d['M_SUB_TOT_AUX'], d['SUB_TOT_AUX'], null, true),

      // Técnico Laboral
      this.crearFila('Técnico Laboral Regular - Presencial', d['M_TCO_REG_PRE'], d['TCO_REG_PRE'], null),
      this.crearFila('Técnico Laboral Regular - Virtual', d['M_TCO_REG_VIR'], d['TCO_REG_VIR'], null),
      this.crearFila('Técnico Laboral CampeSENA', d['M_TCO_CAMPESE'], d['TCO_CAMPESE'], null),
      this.crearFila('Técnico Laboral Full Popular', d['M_TCO_FULL_PO'], d['TCO_FULL_PO'], null),
      this.crearFila('Técnico Laboral Articulación con la Media', d['M_TCO_ART_MED'], d['TCO_ART_MED'], null),
      this.crearFila('SubTotal Técnico Laboral (C)', d['M_SUB_TCO_LAB'], d['SUB_TCO_LAB'], null, true),

      // Profundización Técnica
      this.crearFila('Profundización Técnica (T)', d['M_PROF_TECNIC'], d['PROF_TECNIC'], null, true),

      // Totales
      this.crearFila('TOTAL FORMACIÓN LABORAL (D=A+B+C+T)', d['M_FOR_LABOR'], d['TOT_FOR_LAB'], d['R_FOR_LABOR'], false, true),
      this.crearFila('TOTAL FORMACION TITULADA (F = D+E)', d['M_TOT_TITUL'], d['TOT_FOR_TIT'], d['R_TOT_TITUL'], false, true),

      // Formación Complementaria
      this.crearFila('Formación Complementaria - Virtual (Sin Bilingüismo) (G)', d['M_COM_VIR_SBI'], d['COM_VIR_SBI'], null),
      this.crearFila('Formación Complementaria - Presencial (Sin Bilingüismo) (H)', d['M_COM_PRE_SBI'], d['COM_PRE_SBI'], null),
      this.crearFila('Programa de Bilingüismo - Virtual (I)', d['M_COM_BIL_VIR'], d['COM_BIL_VIR'], null),
      this.crearFila('Programa de Bilingüismo - Presencial (J)', d['M_COM_BIL_PRE'], d['COM_BIL_PRE'], null),
      this.crearFila('SubTotal Programa de Bilinguïsmo (K = I + J)', d['M_PRG_BIL_T'], d['SUB_PRO_BIN'], d['R_PRG_BIL_T'], true),
      this.crearFila('Formación Complementaria CampeSENA (L)', d['M_COM_CAMPESE'], d['COM_CAMPESE'], null),
      this.crearFila('Formación Complementaria Full Popular (M)', d['M_COM_FULL_PO'], d['COM_FULL_PO'], null),
      this.crearFila('TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)', d['M_COMPLEM_T'], d['TOT_COMPLEM'], d['R_COMPLEM_T'], false, true),
      this.crearFila('TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)', d['M_FRM_PRO_T'], d['TOT_PROF_IN'], d['R_FRM_PRO_T'], false, true),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Programas Relevantes
    this.tablaProgramasRelevantes = [
      this.crearFila('Total Formación Profesional CampeSENA', d['M_TOT_FP_CAME'], d['TOT_FP_CAME'], null),
      this.crearFila('Total Formación Profesional Full Popular', d['M_TOT_FP_FULL'], d['TOT_FP_FULL'], null),
      this.crearFila('Total Formación Profesional Integral - Virtual', d['M_TOT_FP_VIRT'], d['TOT_FP_VIRT'], null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Retención (metas y ejecución son porcentajes)
    // Función para normalizar: si es <= 1 es decimal, si > 1 ya es porcentaje
    const normalizarPct = (val: number | undefined) => {
      if (!val) return 0;
      return val <= 1 ? val * 100 : val;
    };

    // Totales de ejecución: normalizar cada valor antes de sumar
    const totFL_E = normalizarPct(d['R_FOR_LAB_P']) + normalizarPct(d['R_FOR_LAB_V']);
    const totES_E = normalizarPct(d['R_EDU_SUP_P']) + normalizarPct(d['R_EDU_SUP_V']);
    const totTIT_E = normalizarPct(d['R_TOT_TIT_P']) + normalizarPct(d['R_TOT_TIT_V']);
    const totCOM_E = normalizarPct(d['R_COMPLEM_P']) + normalizarPct(d['R_COMPLEM_V']);
    const totFP_E = normalizarPct(d['R_FRM_PRO_P']) + normalizarPct(d['R_FRM_PRO_V']);
    const totBIL_E = normalizarPct(d['R_PRG_BIL_P']) + normalizarPct(d['R_PRG_BIL_V']);

    // Totales de META: sumar decimales y multiplicar por 100
    const totFL_M = ((d['M_RET_FL_PRE'] || 0) + (d['M_RET_FL_VIR'] || 0)) * 100;
    const totES_M = ((d['M_RET_ES_PRE'] || 0) + (d['M_RET_ES_VIR'] || 0)) * 100;
    const totTIT_M = ((d['M_RET_TIT_PRE'] || 0) + (d['M_RET_TIT_VIR'] || 0)) * 100;
    const totCOM_M = ((d['M_RET_COM_PRE'] || 0) + (d['M_RET_COM_VIR'] || 0)) * 100;
    const totFP_M = ((d['M_RET_FP_PRE'] || 0) + (d['M_RET_FP_VIR'] || 0)) * 100;
    const totBIL_M = ((d['M_RET_BIL_PRE'] || 0) + (d['M_RET_BIL_VIR'] || 0)) * 100;

    this.tablaRetencion = [
      this.crearFilaRetencion('Formación Laboral - Presencial', d['M_RET_FL_PRE'], d['R_FOR_LAB_P']),
      this.crearFilaRetencion('Formación Laboral - Virtual', d['M_RET_FL_VIR'], d['R_FOR_LAB_V']),
      this.crearFilaRetencionTotal('TOTAL FORMACIÓN LABORAL', totFL_M, totFL_E),
      this.crearFilaRetencion('Educación Superior - Presencial', d['M_RET_ES_PRE'], d['R_EDU_SUP_P']),
      this.crearFilaRetencion('Educación Superior - Virtual', d['M_RET_ES_VIR'], d['R_EDU_SUP_V']),
      this.crearFilaRetencionTotal('TOTAL EDUCACIÓN SUPERIOR', totES_M, totES_E),
      this.crearFilaRetencion('Total Titulada - Presencial', d['M_RET_TIT_PRE'], d['R_TOT_TIT_P']),
      this.crearFilaRetencion('Total Titulada - Virtual', d['M_RET_TIT_VIR'], d['R_TOT_TIT_V']),
      this.crearFilaRetencionTotal('TOTAL TITULADA', totTIT_M, totTIT_E),
      this.crearFilaRetencion('Complementaria - Presencial', d['M_RET_COM_PRE'], d['R_COMPLEM_P']),
      this.crearFilaRetencion('Complementaria - Virtual', d['M_RET_COM_VIR'], d['R_COMPLEM_V']),
      this.crearFilaRetencionTotal('TOTAL COMPLEMENTARIA', totCOM_M, totCOM_E),
      this.crearFilaRetencion('Total Formación Profesional - Presencial', d['M_RET_FP_PRE'], d['R_FRM_PRO_P']),
      this.crearFilaRetencion('Total Formación Profesional - Virtual', d['M_RET_FP_VIR'], d['R_FRM_PRO_V']),
      this.crearFilaRetencionTotal('TOTAL FORMACIÓN PROFESIONAL', totFP_M, totFP_E),
      this.crearFilaRetencion('Programa de Bilingüismo - Presencial', d['M_RET_BIL_PRE'], d['R_PRG_BIL_P']),
      this.crearFilaRetencion('Programa de Bilingüismo - Virtual', d['M_RET_BIL_VIR'], d['R_PRG_BIL_V']),
      this.crearFilaRetencionTotal('PROGRAMA DE BILINGÜISMO', totBIL_M, totBIL_E),
      this.crearFilaRetencion('CampeSENA', d['M_RET_CAMPE'], d['R_CAMPESENA']),
      this.crearFilaRetencion('Full Popular', d['M_RET_FULL'], d['R_FULL']),
    ].filter(fila => fila.meta !== null || fila.ejecucion !== null);

    // Tabla Certificación
    this.tablaCertificacion = [
      this.crearFila('Formación Laboral', d['M_CERT_FL'], d['C_FORMA_LAB'], d['R_CERT_FL']),
      this.crearFila('Educación Superior', d['M_CERT_ES'], d['C_EDU_SUPER'], d['R_CERT_ES']),
      this.crearFila('Total Formación Titulada', d['M_CERT_FT'], d['C_FRM_TITUL'], d['R_CERT_FT'], false, true),
      this.crearFila('Total Formación Complementaria', d['M_CERT_FC'], d['C_FRM_COMP'], d['R_CERT_FC']),
      this.crearFila('TOTAL FORMACIÓN PROFESIONAL INTEGRAL', d['M_CERT_FPI'], d['C_FRM_PR_IN'], d['R_CERT_FPI'], false, true),
      this.crearFila('Articulación con la Media (Incluidas en Formación laboral)', d['M_CERT_ARM'], d['C_TCO_ARMED'], d['R_CERT_ARM']),
      this.crearFila('CampeSENA (Incluidas en Formación Profesional Integral)', d['M_CERT_CAM'], d['C_CAMPESENA'], d['R_CERT_CAM']),
      this.crearFila('Full Popular (Incluidas en Formación Profesional Integral)', d['M_CERT_FUL'], d['C_FULL'], d['R_CERT_FUL']),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Certificación de Competencias Laborales (estructura sin datos - pendiente de alimentar)
    this.tablaCompetenciasLaborales = [
      this.crearFila('Certificación en competencias laborales (ejecución trimestral) (A)', null, null, null),
      this.crearFila('Certificación en competencias con desmovilizados (B)', null, null, null),
      this.crearFila('TOTAL CERTIFICACIONES EN COMPETENCIAS LABORALES (C= A+B)', null, null, null, false, true),
      this.crearFila('Personas Certificadas en Competencias Laborales (D= C-E-C)', null, null, null),
      this.crearFila('Reconocimiento de Competencias Laborales (E)', null, null, null),
      this.crearFila('Evaluación y Certificación (F)', null, null, null),
      this.crearFila('TOTAL CERTIFICACIONES DE COMPETENCIAS LABORALES (G=D+E+F)', null, null, null, false, true),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Productividad CampeSENA
    this.tablaProductividadCampesena = [
      this.crearFila('Usuarios productivos formados para la estrategia CampeSENA', null, null, null),
      this.crearFila('Unidades productivas beneficiadas para la estrategia CampeSENA', null, null, null),
      this.crearFila('Proyectos productivos formalizados para la estrategia CampeSENA', null, null, null),
      this.crearFila('Proyectos productivos beneficiarios para la estrategia CampeSENA', null, null, null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Poblaciones Vulnerables
    this.tablaPoblacionesVulnerables = [
      this.crearFila('Víctimas del Conflicto Armado con Formación Profesional Integral', null, null, null),
      this.crearFila('Reintegrados con Formación Profesional integral', null, null, null),
      this.crearFila('TOTAL VÍCTIMAS DEL CONFLICTO (A+B)', null, null, null, true),
      this.crearFila('PERSONAS EN PROCESO DE REINTEGRACIÓN (B)', null, null, null),
      this.crearFila('TOTAL POBLACIONES VULNERABLES (H= C+D+B)', null, null, null, false, true),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Desagregación OTRAS POBLACIONES VULNERABLES
    this.tablaDesagregacionVulnerables = [
      this.crearFila('Jóvenes Vulnerables', null, null, null),
      this.crearFila('Adolescentes en Conflicto', null, null, null),
      this.crearFila('Remitidos por el ICBF o La Ley Penal', null, null, null),
      this.crearFila('Adulto Mayor', null, null, null),
      this.crearFila('Desplazados', null, null, null),
      this.crearFila('Negritudes (Negros)', null, null, null),
      this.crearFila('Indígenas', null, null, null),
      this.crearFila('ROM (Gitanos)', null, null, null),
      this.crearFila('Raizales del Archipiélago', null, null, null),
      this.crearFila('Palenqueros de San Basilio', null, null, null),
      this.crearFila('Personas de Trata y Adolescentes desmovlizados del Grupo Armados Organizados al margen de Ley', null, null, null),
      this.crearFila('Personas en Proceso de Reintegración', null, null, null),
      this.crearFila('Población PPL', null, null, null),
      this.crearFila('Otros', null, null, null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Agencia Pública de Empleo
    this.tablaAgenciaEmpleo = [
      this.crearFila('COLOCACIONES TRABAJOS SENA', null, null, null),
      this.crearFila('COLOCACIONES NO SENA', null, null, null),
      this.crearFila('TOTAL COLOCACIONES', null, null, null, true),
      this.crearFila('ORIENTADORES LABORALES', null, null, null),
      this.crearFila('GESTIÓN DEL EMPLEO', null, null, null),
      this.crearFila('ORIENTACIONES', null, null, null),
      this.crearFila('TOTAL APRENDICES', null, null, null, true),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Emprendimiento y Fortalecimiento
    this.tablaEmprendimiento = [
      this.crearFila('N° de Empresas Fortalecidas', null, null, null),
      this.crearFila('Empresas con PIFEM Diseñado y Asesoría para su Fortalecimiento', null, null, null),
      this.crearFila('Empresas con Fortalecimiento Empresarial a través del programa PIFEM (Técnicos en Emprendimiento y Fortalecimiento)', null, null, null),
      this.crearFila('Empresas con fortalecimiento Empresarial a través del programa PIFEM (Tecnólogos en Gestión de Empresas Asociadas)', null, null, null),
      this.crearFila('Fomento de negocios fortalecidos en Red Aprender', null, null, null),
      this.crearFila('Total Productores Fortalecidos por las Unidades Productivas', null, null, null, true),
      this.crearFila('Fomento de negocios formalizados en del Fondo Emprender', null, null, null),
      this.crearFila('Empresas Creadas por el programa a través del Fondo Emprender', null, null, null),
      this.crearFila('Empresas Creadas sin el apoyo del Fondo Emprender', null, null, null),
      this.crearFila('Fomento de negocios formalizados sin del Fondo Emprender', null, null, null),
      this.crearFila('Empresas Creadas a partir del Fondo Emprender', null, null, null),
      this.crearFila('Total Productores Fortalecidos por las Unidades', null, null, null, true),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Fondo Emprender
    this.tablaFondoEmprender = [
      this.crearFila('Planes de negocios recibidos del Fondo Emprender', null, null, null),
      this.crearFila('Iniciativas evaluadas del Fondo Emprender', null, null, null),
      this.crearFila('Empresas Creadas por el apoyo del Fondo Emprender', null, null, null),
      this.crearFila('Iniciativas aprobadas del Fondo Emprender', null, null, null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Contratos de Aprendizaje
    this.tablaContratosAprendizaje = [
      this.crearFila('Número de Empresas con Cuotas Registradas', null, null, null),
      this.crearFila('Número de aprendices con Contrato Reportado', null, null, null),
      this.crearFila('Total Número de Aprendices con Contrato Vigente (incluye contratos renovados)', null, null, null, true),
      this.crearFila('Total Número de aprendices con Vínculo Laboral contratados', null, null, null, true),
      this.crearFila('Total número de Aprendices con Apoyo de Sostenimiento', null, null, null, true),
      this.crearFila('Total Aprendices Con Contrato de Aprendizaje', null, null, null, false, true),
      this.crearFila('Aprendices Con Seguimiento de Aprendizaje', null, null, null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Internacionalización
    this.tablaInternacionalizacion = [
      this.crearFila('Movilidad saliente de aprendices e instructores inscritos en actividades de intercambio', null, null, null),
      this.crearFila('Movilidad entrante de personas aprendices e instructores inscritos en actividades de intercambio', null, null, null),
      this.crearFila('Número de centros de Formación con participación en acciones de intercambio', null, null, null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Cupos autorizados FIC
    this.tablaCuposFIC = [
      this.crearFila('Técnicos con cupos en metas regional (Tecnologos)', null, null, null),
      this.crearFila('TECNICO LABORAL FIC (Cupos incluidos en meta regional - Técnico laboral)', null, null, null),
      this.crearFila('FORMACIÓN TITULADA FIC (Cupos incluidos en meta regional = Formación titulada)', null, null, null, true),
      this.crearFila('FORMACIÓN COMPLEMENTARIA FIC (Cupos incluidos en meta regional - Formacion Complementaria)', null, null, null),
      this.crearFila('TOTAL FORMACION PROFESIONAL INTEGRAL FIC (Cupos incluidos en meta regional)', null, null, null, false, true),
      this.crearFila('Total Formación Profesional Integral', null, null, null),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);

    // Tabla Formación Continua Especial Campesina (CON DATOS REALES)
    const calcPctFCEC = this.calcularPorcentaje(d['C_COM_FCEC'], d['SUB_COM_FCEC']);
    const calcPctFCEF = this.calcularPorcentaje(d['C_COM_FCEF'], d['SUB_COM_FCEF']);
    this.tablaFormacionContinuaCampesina = [
      this.crearFila('Formación Complementaria Especial Campesina (FCEC)', d['SUB_COM_FCEC'], d['C_COM_FCEC'], calcPctFCEC),
      this.crearFila('Formación Complementaria Especial (FCEF)', d['SUB_COM_FCEF'], d['C_COM_FCEF'], calcPctFCEF),
    ].filter(fila => fila.ejecucion !== null || fila.meta !== null);
  }

  crearFila(
    descripcion: string,
    meta: number | null | undefined,
    ejecucion: number | null | undefined,
    porcentaje: number | null | undefined,
    esSubtotal: boolean = false,
    esTotal: boolean = false,
    nivel: number = 0
  ): TablaFila {
    // Calcular porcentaje si no se proporciona
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
      nivel,
      esTotal
    };
  }

  crearFilaRetencion(
    descripcion: string,
    meta: number | null | undefined,
    ejecucion: number | null | undefined,
    esTotal: boolean = false
  ): TablaFila {
    // META del JSON viene como decimal (0.87 -> 87%), multiplicar por 100
    // EJECUCIÓN de la API: si es <= 1 es decimal, si es > 1 ya es porcentaje
    const metaPct = meta ? meta * 100 : null;
    const ejecucionPct = ejecucion ? (ejecucion <= 1 ? ejecucion * 100 : ejecucion) : null;

    // Calcular porcentaje (ejecución/meta * 100) pero sin semáforo visual
    let porcentaje: number | null = null;
    if (metaPct && ejecucionPct) {
      porcentaje = (ejecucionPct / metaPct) * 100;
    }

    return {
      descripcion,
      meta: metaPct,
      ejecucion: ejecucionPct,
      porcentaje,
      esSubtotal: false,
      nivel: 0,
      esTotal
    };
  }

  crearFilaRetencionTotal(
    descripcion: string,
    meta: number | null,
    ejecucion: number | null
  ): TablaFila {
    // Los totales ya vienen multiplicados por 100
    let porcentaje: number | null = null;
    if (meta && ejecucion) {
      porcentaje = (ejecucion / meta) * 100;
    }

    return {
      descripcion,
      meta: meta && meta > 0 ? meta : null,
      ejecucion: ejecucion && ejecucion > 0 ? ejecucion : null,
      porcentaje,
      esSubtotal: false,
      nivel: 0,
      esTotal: true
    };
  }

  getBadgeClass(porcentaje: number): string {
    if (porcentaje >= 100.6) return 'badge-over'; // Sobreejecución (naranja)
    if (porcentaje >= 90) return 'badge-success'; // Buena (verde)
    if (porcentaje >= 83) return 'badge-warning'; // Vulnerable (amarillo)
    return 'badge-danger'; // Bajo (rojo)
  }
}
