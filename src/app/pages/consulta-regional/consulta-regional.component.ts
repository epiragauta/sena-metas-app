import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface SeguimientoItem {
  categoria: string;
  subcategoria: string;
  anio: number;
  mes: number;
  cupos: number;
  ejecucion: number;
  porcentaje: number;
}

interface CentroConSeguimiento {
  codigo: number;
  nombre: string;
  seguimiento: SeguimientoItem[];
}

interface RegionalConSeguimiento {
  codigo: number;
  nombre: string;
  centros: CentroConSeguimiento[];
  seguimiento: SeguimientoItem[];
}

interface DatosJerarquicos {
  metadata: any;
  regionales: RegionalConSeguimiento[];
}

@Component({
  selector: 'app-consulta-regional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">Consulta Regional y Centros</div>
      <div class="page-subtitle">Seguimiento de Metas por Regional y Centro de Formación</div>
    </div>

    <!-- Filtros -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row">
          <div class="col-6">
            <label class="form-label"><strong>Regional:</strong></label>
            <select class="form-select" [(ngModel)]="regionalSeleccionada" (change)="onRegionalChange()">
              <option *ngFor="let regional of regionales" [value]="regional.codigo">
                [{{ regional.codigo }}] {{ regional.nombre }}
              </option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label"><strong>Centro:</strong></label>
            <select class="form-select" [(ngModel)]="centroSeleccionado" (change)="onCentroChange()"
                    [disabled]="!centrosDisponibles.length">
              <option [value]="0">-- Seleccione un centro --</option>
              <option *ngFor="let centro of centrosDisponibles" [value]="centro.codigo">
                [{{ centro.codigo }}] {{ centro.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Datos en dos columnas -->
    <div class="row" *ngIf="datosRegional.length > 0">
      <!-- Columna Regional -->
      <div class="col-6">
        <div class="card">
          <div class="card-header bg-sena">
            <h5 class="mb-0">
              <i class="fas fa-map-marker-alt"></i>
              Regional: {{ regionalActual?.nombre }}
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0">
                <thead class="table-dark sticky-header">
                  <tr>
                    <th class="text-left">Metas Formación Profesional Integral</th>
                    <th class="text-right">Meta</th>
                    <th class="text-right">Ejecución</th>
                    <th class="text-right">% Ejecución</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of datosRegional"
                      [class.fila-subtotal]="item.esSubtotal"
                      [class.fila-total]="item.esTotal">
                    <td [style.padding-left]="item.indentacion">{{ item.subcategoria }}</td>
                    <td class="text-right">{{ item.cupos | number }}</td>
                    <td class="text-right">{{ item.ejecucion | number }}</td>
                    <td class="text-right">
                      <span class="badge" [ngClass]="getBadgeClass(item.porcentaje)">
                        {{ item.porcentaje | number:'1.2-2' }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Centro -->
      <div class="col-6">
        <div class="card">
          <div class="card-header bg-sena">
            <h5 class="mb-0">
              <i class="fas fa-building"></i>
              Centro: {{ centroActual?.nombre || 'Seleccione un centro' }}
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0">
                <thead class="table-dark sticky-header">
                  <tr>
                    <th class="text-left">Metas Formación Profesional Integral</th>
                    <th class="text-right">Meta</th>
                    <th class="text-right">Ejecución</th>
                    <th class="text-right">% Ejecución</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="datosCentro.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">
                      <i class="fas fa-info-circle"></i>
                      Seleccione un centro para ver sus datos
                    </td>
                  </tr>
                  <tr *ngFor="let item of datosCentro"
                      [class.fila-subtotal]="item.esSubtotal"
                      [class.fila-total]="item.esTotal">
                    <td [style.padding-left]="item.indentacion">{{ item.subcategoria }}</td>
                    <td class="text-right">{{ item.cupos | number }}</td>
                    <td class="text-right">{{ item.ejecucion | number }}</td>
                    <td class="text-right">
                      <span class="badge" [ngClass]="getBadgeClass(item.porcentaje)">
                        {{ item.porcentaje | number:'1.2-2' }}%
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

    <!-- Loading -->
    <div *ngIf="cargando" class="text-center mt-3">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
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
      border-color: var(--sena-naranja);
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
    }

    .form-select:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .bg-sena {
      background: linear-gradient(135deg, var(--sena-verde) 0%, #2d7a00 100%);
      color: white;
    }

    .bg-sena h5 {
      color: white;
      margin: 0;
    }

    .table-responsive {
      max-height: 70vh;
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

    .fila-subtotal td {
      font-weight: 600;
      color: var(--sena-naranja-oscuro);
    }

    .fila-total {
      background: linear-gradient(135deg, #ffe0b2 0%, #ffcc80 100%) !important;
      font-weight: bold;
    }

    .fila-total td {
      font-weight: bold;
      color: var(--sena-negro);
      font-size: 1rem;
    }

    .badge {
      padding: 6px 12px;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 4px;
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

    .py-4 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }

    i.fas {
      margin-right: 8px;
    }
  `]
})
export class ConsultaRegionalComponent implements OnInit {
  cargando = true;
  regionales: RegionalConSeguimiento[] = [];
  regionalSeleccionada: number = 0;
  centroSeleccionado: number = 0;
  centrosDisponibles: CentroConSeguimiento[] = [];

  regionalActual?: RegionalConSeguimiento;
  centroActual?: CentroConSeguimiento;

  datosRegional: any[] = [];
  datosCentro: any[] = [];

  // Orden de subcategorías según especificación
  ordenSubcategorias = [
    { nombre: 'Tecnólogos Regular - Presencial', nivel: 0 },
    { nombre: 'Tecnologos Regular - Presencial', nivel: 0 }, // Variante sin tilde
    { nombre: 'Tecnólogos Regular - Virtual', nivel: 0 },
    { nombre: 'Tecnólogos Regular - A Distancia', nivel: 0 },
    { nombre: 'Tecnólogos CampeSENA', nivel: 0 },
    { nombre: 'Tecnólogos Full Popular', nivel: 0 },
    { nombre: 'SubTotal Tecnólogos (E)', nivel: 1, esSubtotal: true },
    { nombre: 'TOTAL EDUCACION SUPERIOR (E)', nivel: 2, esTotal: true },
    { nombre: 'EDUCACION SUPERIOR (=E)', nivel: 2, esTotal: true }, // Variante
    { nombre: 'Operarios Regular', nivel: 0 },
    { nombre: 'Operarios CampeSENA', nivel: 0 },
    { nombre: 'Operarios Full Popular', nivel: 0 },
    { nombre: 'Total Operarios (B)', nivel: 1, esSubtotal: true },
    { nombre: 'SubTotal Operarios (B)', nivel: 1, esSubtotal: true }, // Variante
    { nombre: 'Auxiliares Regular', nivel: 0 },
    { nombre: 'Auxiliares CampeSENA', nivel: 0 },
    { nombre: 'Auxiliares Full Popular', nivel: 0 },
    { nombre: 'Total Auxiliares (A)', nivel: 1, esSubtotal: true },
    { nombre: 'SubTotal Auxiliares (A)', nivel: 1, esSubtotal: true }, // Variante
    { nombre: 'Técnico Laboral Regular - Presencial', nivel: 0 },
    { nombre: 'Técnico Laboral Regular - Virtual', nivel: 0 },
    { nombre: 'Técnico Laboral CampeSENA', nivel: 0 },
    { nombre: 'Técnico Laboral Full Popular', nivel: 0 },
    { nombre: 'Técnico Laboral Articulación con la Media', nivel: 0 },
    { nombre: 'Total Técnico Laboral (C)', nivel: 1, esSubtotal: true },
    { nombre: 'SubTotal Técnico Laboral (C)', nivel: 1, esSubtotal: true }, // Variante
    { nombre: 'Total Profundización Técnica (T)', nivel: 1, esSubtotal: true },
    { nombre: 'Profundización Técnica (T)', nivel: 1, esSubtotal: true }, // Variante
    { nombre: 'TOTAL FORMACIÓN LABORAL (Operarios, Auxiliar  y técnico laboral, profundización técnica) (D=A+B+C+T)', nivel: 2, esTotal: true },
    { nombre: 'TOTAL FORMACIÓN LABORAL (D=A+B+C+T)', nivel: 2, esTotal: true }, // Variante
    { nombre: 'TOTAL FORMACION TITULADA (F)  = (D+E)', nivel: 2, esTotal: true },
    { nombre: 'TOTAL FORMACION TITULADA (F = D+E)', nivel: 2, esTotal: true }, // Variante
    { nombre: 'Formación Complementaria - Virtual  (Sin Bilingüismo) (G)', nivel: 1, esSubtotal: true },
    { nombre: 'Formación Complementaria - Presencial (Sin Bilingüismo) (H)', nivel: 2, esTotal: true },
    { nombre: 'Programa de Bilingüismo - Virtual (I)', nivel: 0 },
    { nombre: 'Programa de Bilingüismo - Presencial (J)', nivel: 0 },
    { nombre: 'Total Programa de Bilinguïsmo (K)', nivel: 1, esSubtotal: true },
    { nombre: 'SubTotal Programa de Bilinguïsmo (K = I + J)', nivel: 1, esSubtotal: true }, // Variante
    { nombre: 'Formación Complementaria CampeSENA (L)', nivel: 1, esSubtotal: true },
    { nombre: 'Formación Complementaria Full Popular (M)', nivel: 1, esSubtotal: true },
    { nombre: 'TOTAL FORMACION COMPLEMENTARIA (N) = (G+H+K+L+M)', nivel: 2, esTotal: true },
    { nombre: 'TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)', nivel: 2, esTotal: true }, // Variante
    { nombre: 'TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)', nivel: 2, esTotal: true }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.http.get<DatosJerarquicos>('assets/data/seguimiento_metas_por_regional.json')
      .subscribe({
        next: (datos) => {
          this.regionales = datos.regionales;

          // Seleccionar una regional aleatoria
          if (this.regionales.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * this.regionales.length);
            this.regionalSeleccionada = this.regionales[indiceAleatorio].codigo;
            this.onRegionalChange();
          }

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando datos:', err);
          this.cargando = false;
        }
      });
  }

  onRegionalChange(): void {
    console.log('Regional seleccionada:', this.regionalSeleccionada);
    this.regionalActual = this.regionales.find(r => r.codigo == this.regionalSeleccionada);

    if (this.regionalActual) {
      this.centrosDisponibles = this.regionalActual.centros;
      this.centroSeleccionado = 0;
      this.centroActual = undefined;
      this.datosCentro = [];

      // Procesar datos de la regional
      this.datosRegional = this.procesarDatos(this.regionalActual.seguimiento);
    }
  }

  onCentroChange(): void {
    if (this.centroSeleccionado > 0 && this.regionalActual) {
      this.centroActual = this.centrosDisponibles.find(c => c.codigo == this.centroSeleccionado);

      if (this.centroActual) {
        this.datosCentro = this.procesarDatos(this.centroActual.seguimiento);
      }
    } else {
      this.centroActual = undefined;
      this.datosCentro = [];
    }
  }

  procesarDatos(seguimiento: SeguimientoItem[]): any[] {
    const resultado: any[] = [];

    // Crear un mapa de datos por subcategoría
    const mapaSubcategorias = new Map<string, SeguimientoItem>();
    seguimiento.forEach(item => {
      mapaSubcategorias.set(item.subcategoria, item);
    });

    // Identificar la categoría de los datos para generar subtotales
    const categoriaActual = seguimiento.length > 0 ? seguimiento[0].categoria : '';

    // Solo calcular SubTotal Tecnólogos (E) que no existe en seguimiento_regional
    // Los demás subtotales (Operarios, Auxiliares, Técnico Laboral) ya existen como "Total X"
    const tecnologosItems = [
      'Tecnólogos Regular - Presencial',
      'Tecnologos Regular - Presencial', // Variante sin tilde
      'Tecnólogos Regular - Virtual',
      'Tecnólogos Regular - A Distancia',
      'Tecnólogos CampeSENA',
      'Tecnólogos Full Popular'
    ];

    // Calcular SubTotal Tecnólogos (E) solo si no existe en los datos
    let subtotalTecnologos: SeguimientoItem | null = null;
    if (!mapaSubcategorias.has('SubTotal Tecnólogos (E)')) {
      let totalCupos = 0;
      let totalEjecucion = 0;
      let encontrados = 0;

      tecnologosItems.forEach(item => {
        const dato = mapaSubcategorias.get(item);
        if (dato) {
          totalCupos += dato.cupos;
          totalEjecucion += dato.ejecucion;
          encontrados++;
        }
      });

      if (encontrados > 0) {
        const porcentaje = totalCupos > 0 ? (totalEjecucion / totalCupos * 100) : 0;
        subtotalTecnologos = {
          categoria: categoriaActual,
          subcategoria: 'SubTotal Tecnólogos (E)',
          anio: seguimiento[0]?.anio || 2025,
          mes: seguimiento[0]?.mes || 9,
          cupos: totalCupos,
          ejecucion: totalEjecucion,
          porcentaje: parseFloat(porcentaje.toFixed(2))
        };
      }
    }

    // Ordenar según el array de ordenSubcategorias
    this.ordenSubcategorias.forEach(orden => {
      let dato = mapaSubcategorias.get(orden.nombre);

      // Si no existe y es "SubTotal Tecnólogos (E)", usar el calculado
      if (!dato && orden.nombre === 'SubTotal Tecnólogos (E)' && subtotalTecnologos) {
        dato = subtotalTecnologos;
      }

      if (dato) {
        resultado.push({
          ...dato,
          esSubtotal: orden.esSubtotal || false,
          esTotal: orden.esTotal || false,
          indentacion: `${orden.nivel * 20}px`
        });
      }
    });

    return resultado;
  }

  getBadgeClass(porcentaje: number): string {
    if (porcentaje >= 90) return 'badge-success';
    if (porcentaje >= 70) return 'badge-warning';
    return 'badge-danger';
  }
}
