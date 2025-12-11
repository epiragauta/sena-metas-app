import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of, forkJoin } from 'rxjs';
import { ExportExcelService } from '../../services/exportar-excel.service';
import { XlsbApiService, MetasData } from '../../services/xlsb-api.service';
import { DataTransformerService } from '../../services/data-transformer.service';

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
  templateUrl: './consulta-regional.component.html',
  styleUrl: './consulta-regional.component.scss'
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

  // Datos dummy para las demás tablas
  datosProgramasRelevantes: any[] = [];
  datosRetencion: any[] = [];
  datosCertificacion: any[] = [];
  datosCompetenciasLaborales: any[] = [];
  datosPoblacionesVulnerables: any[] = [];
  datosOtrasPoblaciones: any[] = [];
  datosAgenciaEmpleo: any[] = [];
  datosEmprendimiento: any[] = [];
  datosContratosAprendizaje: any[] = [];
  datosCampesena: any[] = [];
  datosFullPopular: any[] = [];
  datosFeec: any[] = [];
  datosPrimerCurso: any[] = [];

  // Estado de expansión/colapso de las tablas
  tablasExpandidas: { [key: string]: boolean } = {
    'formacion': true,
    'programas': true,
    'retencion': true,
    'certificacion': true,
    'competencias': true,
    'poblaciones': true,
    'otrasPoblaciones': true,
    'agencia': true,
    'emprendimiento': true,
    'contratos': true,
    'campesena': true,
    'fullPopular': true,
    'feec': true,
    'primerCurso': true
  };

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

  // Flags para estrategia híbrida
  usarAPI = true;  // Por defecto intentar usar API
  metasDisponibles = false;

  constructor(
    private http: HttpClient,
    private exportExcelService: ExportExcelService,
    private xlsbApi: XlsbApiService,
    private transformer: DataTransformerService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.inicializarDatosDummy();
  }

  cargarDatos(): void {
    this.cargando = true;

    if (this.usarAPI) {
      // Estrategia 1: Intentar cargar desde API
      this.cargarMetasDesdeAPI();
    } else {
      // Estrategia 2: Cargar desde JSON (fallback)
      this.cargarDesdeJSON();
    }
  }

  /**
   * Carga metas y ejecución desde la API de MongoDB
   * Si falla, hace fallback a JSON
   */
  cargarMetasDesdeAPI(): void {
    console.log('📡 Cargando metas y ejecución desde API...');

    // Cargar metas regionales, metas centros, ejecución regional y ejecución centros en paralelo
    forkJoin({
      metasRegional: this.xlsbApi.getMetasRegional().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando metas regionales desde API:', err);
          return of([]);
        })
      ),
      metasCentros: this.xlsbApi.getMetasCentros().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando metas de centros desde API:', err);
          return of([]);
        })
      ),
      ejecucionRegional: this.xlsbApi.getEjecucionRegional().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando ejecución regional desde API:', err);
          return of([]);
        })
      ),
      ejecucionCentros: this.xlsbApi.getEjecucionCentros().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando ejecución de centros desde API:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ metasRegional, metasCentros, ejecucionRegional, ejecucionCentros }) => {
        if (metasRegional.length === 0 && metasCentros.length === 0) {
          console.warn('⚠️ No se obtuvieron metas desde API, usando JSON');
          this.cargarDesdeJSON();
          return;
        }

        console.log(`Metas cargadas: ${metasRegional.length} regionales, ${metasCentros.length} centros`);
        console.log(`Ejecución cargada: ${ejecucionRegional.length} regionales, ${ejecucionCentros.length} centros`);
        this.metasDisponibles = true;

        // Construir estructura de regionales combinando metas y ejecución
        this.construirEstructuraDesdeAPI(metasRegional, metasCentros, ejecucionRegional, ejecucionCentros);
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando datos desde API:', err);
        console.log('Fallback a JSON...');
        this.cargarDesdeJSON();
      }
    });
  }

  /**
   * Construye la estructura de regionales y centros desde datos de la API
   * Combina metas con datos de ejecución para calcular porcentajes
   */
  construirEstructuraDesdeAPI(
    metasRegional: MetasData[],
    metasCentros: MetasData[],
    ejecucionRegional: any[],
    ejecucionCentros: any[]
  ): void {
    const regionalesMap = new Map<number, RegionalConSeguimiento>();

    // Procesar metas regionales combinando con ejecución
    metasRegional.forEach(metaData => {
      // Buscar datos de ejecución correspondientes
      const ejecucion = ejecucionRegional.find(e => e.COD_REGIONAL === metaData.COD_REGIONAL);

      // Transformar combinando metas y ejecución
      const seguimiento = this.transformer.transformarMetasParaComponente(metaData, ejecucion);

      const regional: RegionalConSeguimiento = {
        codigo: metaData.COD_REGIONAL,
        nombre: metaData.REGIONAL,
        centros: [],
        seguimiento: this.transformer.ordenarSeguimiento(seguimiento)
      };

      regionalesMap.set(metaData.COD_REGIONAL, regional);
    });

    // Procesar metas de centros combinando con ejecución
    metasCentros.forEach(metaData => {
      if (!metaData.COD_CENTRO) return;

      // Buscar datos de ejecución correspondientes
      const ejecucion = ejecucionCentros.find(e => e.COD_CENTRO === metaData.COD_CENTRO);

      // Transformar combinando metas y ejecución
      const seguimiento = this.transformer.transformarMetasParaComponente(metaData, ejecucion);

      const centro: CentroConSeguimiento = {
        codigo: metaData.COD_CENTRO,
        nombre: metaData.CENTRO || `Centro ${metaData.COD_CENTRO}`,
        seguimiento: this.transformer.ordenarSeguimiento(seguimiento)
      };

      // Añadir centro a su regional
      const regional = regionalesMap.get(metaData.COD_REGIONAL);
      if (regional) {
        regional.centros.push(centro);
      }
    });

    // Convertir map a array
    this.regionales = Array.from(regionalesMap.values());

    // Ordenar regionales por código
    this.regionales.sort((a, b) => a.codigo - b.codigo);

    // Ordenar centros dentro de cada regional
    this.regionales.forEach(regional => {
      regional.centros.sort((a, b) => a.codigo - b.codigo);
    });

    // Seleccionar primera regional
    if (this.regionales.length > 0) {
      this.regionalSeleccionada = this.regionales[0].codigo;
      this.onRegionalChange();
    }

    console.log(`Estructura construida: ${this.regionales.length} regionales con datos combinados`);
  }

  /**
   * Carga datos desde archivo JSON (fallback)
   */
  cargarDesdeJSON(): void {
    console.log('📁 Cargando desde JSON...');
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
          console.log(`Datos cargados desde JSON: ${this.regionales.length} regionales`);
        },
        error: (err) => {
          console.error('❌ Error cargando datos desde JSON:', err);
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

  toggleTabla(tabla: string): void {
    this.tablasExpandidas[tabla] = !this.tablasExpandidas[tabla];
  }

  /**
   * Exporta con ambos (Regional + Centro)
   */
  exportarCompleto(): void {
    if (!this.regionalActual) {
      alert('Por favor selecciona una regional');
      return;
    }

    if (this.centroSeleccionado === 0) {
      alert('⚠️ Por favor selecciona un centro para exportar ambos datos\n\nO usa "Descargar Solo Regional" si solo quieres los datos de la regional.');
      return;
    }

    this.exportExcelService.exportarSeguimientoMetas(
      this.regionalActual.nombre,
      this.regionalActual.codigo,
      this.centroActual?.nombre,
      this.centroActual?.codigo,
      this.datosRegional,
      this.datosCentro,
      false  // Exportar ambos
    ).catch(error => {
      console.error('Error en exportación:', error);
    });
  }

  /**
   * Exporta solo la Regional
   */
  exportarRegionalSolo(): void {
    if (!this.regionalActual) {
      alert('Por favor selecciona una regional');
      return;
    }

    this.exportExcelService.exportarSeguimientoMetas(
      this.regionalActual.nombre,
      this.regionalActual.codigo,
      this.centroActual?.nombre,
      this.centroActual?.codigo,
      this.datosRegional,
      this.datosCentro,
      true  // Solo regional
    ).catch(error => {
      console.error('Error en exportación:', error);
    });
  }

  /**
   * Inicializa datos dummy para las tablas adicionales
   */
  inicializarDatosDummy(): void {
    // Tabla 2: Programas Relevantes
    this.datosProgramasRelevantes = [
      { concepto: 'Total Formación Profesional CampeSENA', meta: 26651, ejecucion: 27611, porcentaje: 103.60 },
      { concepto: 'Total Formación Profesional Full Popular', meta: 2765, ejecucion: 3936, porcentaje: 142.35 },
      { concepto: 'Total Formación Profesional Integral - Virtual', meta: 53274, ejecucion: 39934, porcentaje: 74.96 }
    ];

    // Tabla 3: Retención
    this.datosRetencion = [
      { concepto: 'FORMACIÓN LABORAL - Presencial', meta: '90%', ejecucion: '94.41%', porcentaje: 104.90 },
      { concepto: 'FORMACIÓN LABORAL - Virtual', meta: '84%', ejecucion: '88.96%', porcentaje: 105.90 },
      { concepto: 'TOTAL FORMACIÓN LABORAL', meta: '87%', ejecucion: '94.20%', porcentaje: 108.28 },
      { concepto: 'EDUCACION SUPERIOR - Presencial', meta: '92%', ejecucion: '91.71%', porcentaje: 99.68 },
      { concepto: 'EDUCACION SUPERIOR - Virtual', meta: '87%', ejecucion: '89.86%', porcentaje: 103.29 },
      { concepto: 'TOTAL EDUCACION SUPERIOR', meta: '90%', ejecucion: '91.10%', porcentaje: 101.78 },
      { concepto: 'TOTAL TITULADA - Presencial', meta: '91%', ejecucion: '93.77%', porcentaje: 103.04 },
      { concepto: 'TOTAL TITULADA - Virtual', meta: '86%', ejecucion: '89.68%', porcentaje: 104.89 },
      { concepto: 'TOTAL TITULADA', meta: '88%', ejecucion: '93.24%', porcentaje: 105.66 },
      { concepto: 'COMPLEMENTARIA - Presencial', meta: '85%', ejecucion: '88.36%', porcentaje: 103.95 },
      { concepto: 'COMPLEMENTARIA - Virtual', meta: '28%', ejecucion: '33.07%', porcentaje: 118.09 },
      { concepto: 'TOTAL COMPLEMENTARIA', meta: '57%', ejecucion: '77.08%', porcentaje: 136.43 }
    ];

    // Tabla 4: Certificación
    this.datosCertificacion = [
      { concepto: 'FORMACIÓN LABORAL', meta: 11036, ejecucion: 2379, porcentaje: 21.56 },
      { concepto: 'EDUCACIÓN SUPERIOR', meta: 3010, ejecucion: 1349, porcentaje: 44.82 },
      { concepto: 'TOTAL FORMACIÓN TITULADA', meta: 14046, ejecucion: 3728, porcentaje: 26.54 },
      { concepto: 'TOTAL FORMACIÓN COMPLEMENTARIA', meta: 100223, ejecucion: 105251, porcentaje: 105.02 },
      { concepto: 'TOTAL FORMACIÓN PROFESIONAL INTEGRAL', meta: 114269, ejecucion: 108979, porcentaje: 95.37 },
      { concepto: 'ARTICULACION CON LA MEDIA', meta: 6971, ejecucion: 1025, porcentaje: 14.70 },
      { concepto: 'CampeSENA', meta: 20509, ejecucion: 13581, porcentaje: 66.22 },
      { concepto: 'Full Popular', meta: 1678, ejecucion: 3175, porcentaje: 189.21 }
    ];

    // Tabla 5: Competencias Laborales
    this.datosCompetenciasLaborales = [
      { concepto: 'Certificaciones CampeSENA', meta: 2113, ejecucion: 2219, porcentaje: 105.02 },
      { concepto: 'Certificaciones Full Popular', meta: 1454, ejecucion: 1736, porcentaje: 119.39 },
      { concepto: 'Certificaciones Regular', meta: 3169, ejecucion: 2521, porcentaje: 79.55 },
      { concepto: 'Total Certificaciones', meta: 6736, ejecucion: 6476, porcentaje: 96.14 },
      { concepto: 'No. de Evaluaciones', meta: 6806, ejecucion: 6953, porcentaje: 102.16 },
      { concepto: 'Personas Evaluadas', meta: 6545, ejecucion: 6578, porcentaje: 100.50 },
      { concepto: 'Personas Certificadas', meta: 6392, ejecucion: 6180, porcentaje: 96.68 },
      { concepto: 'Instrumentos de evaluación construidos', meta: 27, ejecucion: 22, porcentaje: 81.48 }
    ];

    // Tabla 6: Poblaciones Vulnerables
    this.datosPoblacionesVulnerables = [
      { concepto: 'DESPLAZADOS POR LA VIOLENCIA', meta: 29692, ejecucion: 65305, porcentaje: 219.94 },
      { concepto: 'HECHOS VICTIMIZANTES', meta: 1658, ejecucion: 2041, porcentaje: 123.10 },
      { concepto: 'TOTAL VICTIMAS', meta: 31350, ejecucion: 67346, porcentaje: 214.82 },
      { concepto: 'OTRAS POBLACIONES VULNERABLES', meta: 62917, ejecucion: 56386, porcentaje: 89.62 },
      { concepto: 'TOTAL POBLACIONES VULNERABLES', meta: 94267, ejecucion: 123732, porcentaje: 131.26 }
    ];

    // Tabla 7: Otras Poblaciones
    this.datosOtrasPoblaciones = [
      { concepto: 'Personas en condición de Discapacidad', meta: 586, ejecucion: 376, porcentaje: 64.16 },
      { concepto: 'Indígenas', meta: 1391, ejecucion: 1049, porcentaje: 75.41 },
      { concepto: 'INPEC', meta: 812, ejecucion: 1086, porcentaje: 133.74 },
      { concepto: 'Jóvenes Vulnerables', meta: 47327, ejecucion: 37819, porcentaje: 79.91 },
      { concepto: 'Adolescente en Conflicto con la Ley Penal', meta: 37, ejecucion: 123, porcentaje: 332.43 },
      { concepto: 'Mujer Cabeza de Hogar', meta: 8334, ejecucion: 9829, porcentaje: 117.94 },
      { concepto: 'Negritudes (Negros)', meta: 900, ejecucion: 649, porcentaje: 72.11 },
      { concepto: 'Afrocolombianos', meta: 1494, ejecucion: 1432, porcentaje: 95.85 },
      { concepto: 'Raizales', meta: 0, ejecucion: 14, porcentaje: 0 },
      { concepto: 'Palenqueros', meta: 0, ejecucion: 11, porcentaje: 0 },
      { concepto: 'Proceso de Reintegración', meta: 135, ejecucion: 46, porcentaje: 34.07 },
      { concepto: 'Tercera Edad', meta: 596, ejecucion: 899, porcentaje: 150.84 },
      { concepto: 'Adolescente Trabajador', meta: 1305, ejecucion: 1923, porcentaje: 147.36 }
    ];

    // Tabla 8: Agencia Empleo
    this.datosAgenciaEmpleo = [
      { concepto: 'INSCRITOS', meta: 37736, ejecucion: 37367, porcentaje: 99.02 },
      { concepto: 'VACANTES', meta: 15808, ejecucion: 13698, porcentaje: 86.65 },
      { concepto: 'COLOCACIONES EGRESADOS SENA', meta: 4877, ejecucion: 5853, porcentaje: 120.01 },
      { concepto: 'COLOCACIONES NO SENA', meta: 4142, ejecucion: 4487, porcentaje: 108.33 },
      { concepto: 'TOTAL COLOCACIONES', meta: 9019, ejecucion: 10340, porcentaje: 114.65 },
      { concepto: 'ORIENTADOS DESEMPLEADOS', meta: 41534, ejecucion: 42825, porcentaje: 103.11 },
      { concepto: 'ORIENTADOS DESPLAZADOS', meta: 16752, ejecucion: 18235, porcentaje: 108.85 },
      { concepto: 'TOTAL ORIENTADOS', meta: 58286, ejecucion: 61060, porcentaje: 104.76 },
      { concepto: 'TASA DE COLOCACION (%)', meta: 63, ejecucion: 75.49, porcentaje: 119.82 }
    ];

    // Tabla 9: Emprendimiento
    this.datosEmprendimiento = [
      { concepto: 'Planes de Negocio Desplazados', meta: 183, ejecucion: 176, porcentaje: 96.17 },
      { concepto: 'Unidades Productivas Desplazados', meta: 100, ejecucion: 101, porcentaje: 101.00 },
      { concepto: 'Emprendimientos Asesorados', meta: 92, ejecucion: 77, porcentaje: 83.70 },
      { concepto: 'Planes de Negocio Formulados', meta: 83, ejecucion: 30, porcentaje: 36.14 },
      { concepto: 'Emprendedores Orientados', meta: 7711, ejecucion: 6934, porcentaje: 89.92 },
      { concepto: 'Empresas en Fortalecimiento', meta: 52, ejecucion: 54, porcentaje: 103.85 },
      { concepto: 'Empleos Fortalecimiento', meta: 26, ejecucion: 24, porcentaje: 92.31 },
      { concepto: 'Campesinos atendidos en emprendimiento', meta: 2723, ejecucion: 3199, porcentaje: 117.48 },
      { concepto: 'Full Popular en emprendimiento', meta: 102, ejecucion: 916, porcentaje: 898.04 }
    ];

    // Tabla 10: Contratos Aprendizaje
    this.datosContratosAprendizaje = [
      { concepto: 'Empresas con Cuotas Reguladas', meta: 295, ejecucion: 312, porcentaje: 105.76 },
      { concepto: 'Empresas con Cuota Voluntaria', meta: 60, ejecucion: 61, porcentaje: 101.67 },
      { concepto: 'Aprendices SENA Con Contrato', meta: 3937, ejecucion: 3485, porcentaje: 88.52 },
      { concepto: 'Aprendices NO SENA', meta: 1308, ejecucion: 1772, porcentaje: 135.47 },
      { concepto: 'Total Aprendices Con Contrato', meta: 5245, ejecucion: 5257, porcentaje: 100.23 },
      { concepto: 'Contratos Voluntarios', meta: 358, ejecucion: 251, porcentaje: 70.11 }
    ];

    // Tabla 11: CampeSENA
    this.datosCampesena = [
      { concepto: 'Tecnólogos CampeSENA', meta: 43, ejecucion: 57, porcentaje: 132.56 },
      { concepto: 'Operarios CampeSENA', meta: 30, ejecucion: 84, porcentaje: 280.00 },
      { concepto: 'Auxiliares CampeSENA', meta: 15, ejecucion: 15, porcentaje: 100.00 },
      { concepto: 'Técnico Laboral CampeSENA', meta: 897, ejecucion: 956, porcentaje: 106.58 },
      { concepto: 'Formación Complementaria CampeSENA', meta: 25666, ejecucion: 26499, porcentaje: 103.25 },
      { concepto: 'Total Formación Profesional CampeSENA', meta: 26651, ejecucion: 27611, porcentaje: 103.60 },
      { concepto: 'Retención CampeSENA', meta: 92, ejecucion: 89, porcentaje: 96.22 },
      { concepto: 'Certificación CampeSENA', meta: 20509, ejecucion: 13581, porcentaje: 66.22 },
      { concepto: 'Unidades productivas creadas', meta: 128, ejecucion: 0, porcentaje: 0.00 },
      { concepto: 'Unidades productivas fortalecidas', meta: 206, ejecucion: 131, porcentaje: 63.59 },
      { concepto: 'Proyectos productivos beneficiados', meta: 45, ejecucion: 0, porcentaje: 0.00 },
      { concepto: 'Proyectos productivos formulados', meta: 64, ejecucion: 63, porcentaje: 98.44 }
    ];

    // Tabla 12: Full Popular
    this.datosFullPopular = [
      { concepto: 'Tecnólogos Full Popular', meta: 0, ejecucion: 0, porcentaje: 0 },
      { concepto: 'Operarios Full Popular', meta: 0, ejecucion: 0, porcentaje: 0 },
      { concepto: 'Auxiliares Full Popular', meta: 15, ejecucion: 0, porcentaje: 0.00 },
      { concepto: 'Técnico Laboral Full Popular', meta: 0, ejecucion: 0, porcentaje: 0 },
      { concepto: 'Formación Complementaria Full Popular', meta: 2750, ejecucion: 3936, porcentaje: 143.13 },
      { concepto: 'Total Formación Profesional Full Popular', meta: 2765, ejecucion: 3936, porcentaje: 142.35 },
      { concepto: 'Retención Full Popular', meta: 61, ejecucion: 91, porcentaje: 148.87 },
      { concepto: 'Certificación Full Popular', meta: 1678, ejecucion: 3175, porcentaje: 189.21 }
    ];

    // Tabla 13: FEEC
    this.datosFeec = [
      { concepto: 'Estrategia FEEC', meta: 1246, ejecucion: 43, porcentaje: 3.45 },
      { concepto: 'Total Estrategia FEEC', meta: 1246, ejecucion: 43, porcentaje: 3.45 }
    ];

    // Tabla 14: Primer Curso
    this.datosPrimerCurso = [
      { concepto: 'Tecnólogos Primer Curso', meta: 5280, ejecucion: 2851, porcentaje: 54.00 }
    ];
  }
}