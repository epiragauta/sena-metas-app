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
  selector: 'app-consulta-nacional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-nacional.component.html',
  styleUrl: './consulta-nacional.component.scss'
})
export class ConsultaNacionalComponent implements OnInit {
  cargando = true;
  regionales: RegionalConSeguimiento[] = [];

  datosNacionales: any[] = [];

  // Datos dummy para las demás tablas
  datosProgramasRelevantes: any[] = [];
  datosPrimerCurso: any[] = [];
  datosOtrasMetas: any[] = [];
  datosCertificacion: any[] = [];
  datosCompetenciasLaborales: any[] = [];
  datosProductividadCampesena: any[] = [];
  datosPoblacionesVulnerables: any[] = [];
  datosOtrasPoblaciones: any[] = [];
  datosAgenciaEmpleo: any[] = [];
  datosEmprendimiento: any[] = [];
  datosFondoEmprender: any[] = [];
  datosContratosAprendizaje: any[] = [];
  datosInternacionalizacion: any[] = [];
  datosCuposFIC: any[] = [];
  datosCampesena: any[] = [];
  datosProductividadCampesenaDetalle: any[] = [];
  datosFullPopular: any[] = [];
  datosEstrategiaFormacion: any[] = [];

  // Estado de expansión/colapso de las tablas
  tablasExpandidas: { [key: string]: boolean } = {
    'formacion': true,
    'programas': true,
    'primerCurso': true,
    'otrasMetas': true,
    'certificacion': true,
    'competencias': true,
    'productividadCampesena': true,
    'poblaciones': true,
    'otrasPoblaciones': true,
    'agencia': true,
    'emprendimiento': true,
    'fondoEmprender': true,
    'contratos': true,
    'internacionalizacion': true,
    'cuposFIC': true,
    'campesena': true,
    'productividadCampesenaDetalle': true,
    'fullPopular': true,
    'estrategiaFormacion': true
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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.http.get<DatosJerarquicos>('assets/data/seguimiento_metas_por_regional.json').subscribe({
      next: (datos) => {
        this.regionales = datos.regionales;
        this.datosNacionales = this.consolidarDatosNacionales();
        this.inicializarDatosDummy();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Consolida los datos de todas las regionales en un consolidado nacional
   */
  consolidarDatosNacionales(): any[] {
    // Mapa para acumular por subcategoría
    const mapaAcumulado = new Map<string, SeguimientoItem>();

    // Recorrer todas las regionales y sumar sus datos
    this.regionales.forEach(regional => {
      regional.seguimiento.forEach(item => {
        const key = item.subcategoria;

        if (mapaAcumulado.has(key)) {
          const acumulado = mapaAcumulado.get(key)!;
          acumulado.cupos += item.cupos;
          acumulado.ejecucion += item.ejecucion;
          // Recalcular porcentaje
          acumulado.porcentaje = acumulado.cupos > 0
            ? (acumulado.ejecucion / acumulado.cupos * 100)
            : 0;
        } else {
          mapaAcumulado.set(key, { ...item });
        }
      });
    });

    // Calcular SubTotal Tecnólogos (E) si no existe
    const tecnologosItems = [
      'Tecnólogos Regular - Presencial',
      'Tecnologos Regular - Presencial',
      'Tecnólogos Regular - Virtual',
      'Tecnólogos Regular - A Distancia',
      'Tecnólogos CampeSENA',
      'Tecnólogos Full Popular'
    ];

    let subtotalTecnologos: SeguimientoItem | null = null;
    if (!mapaAcumulado.has('SubTotal Tecnólogos (E)')) {
      let totalCupos = 0;
      let totalEjecucion = 0;
      let encontrados = 0;
      let anio = 2025;
      let mes = 9;
      let categoria = '';

      tecnologosItems.forEach(item => {
        const dato = mapaAcumulado.get(item);
        if (dato) {
          totalCupos += dato.cupos;
          totalEjecucion += dato.ejecucion;
          encontrados++;
          anio = dato.anio;
          mes = dato.mes;
          categoria = dato.categoria;
        }
      });

      if (encontrados > 0) {
        const porcentaje = totalCupos > 0 ? (totalEjecucion / totalCupos * 100) : 0;
        subtotalTecnologos = {
          categoria,
          subcategoria: 'SubTotal Tecnólogos (E)',
          anio,
          mes,
          cupos: totalCupos,
          ejecucion: totalEjecucion,
          porcentaje: parseFloat(porcentaje.toFixed(2))
        };
      }
    }

    // Ordenar según el array de ordenSubcategorias
    const resultado: any[] = [];
    this.ordenSubcategorias.forEach(orden => {
      let dato = mapaAcumulado.get(orden.nombre);

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
    if (porcentaje >= 100.6) return 'badge-over';
    if (porcentaje >= 90) return 'badge-success';
    if (porcentaje >= 83) return 'badge-warning';
    return 'badge-danger';
  }

  toggleTabla(tabla: string): void {
    this.tablasExpandidas[tabla] = !this.tablasExpandidas[tabla];
  }

  /**
   * Inicializa datos dummy para las tablas adicionales (consolidado nacional)
   * Estos son datos de ejemplo escalados para el nivel nacional
   */
  inicializarDatosDummy(): void {
    const numRegionales = this.regionales.length || 33; // Número de regionales SENA

    // Tabla 2: Metas Programas Relevantes
    this.datosProgramasRelevantes = [
      { concepto: 'Total Formación Profesional CampeSENA', meta: 26651 * numRegionales, ejecucion: 27611 * numRegionales, porcentaje: 103.60 },
      { concepto: 'Total Formación Profesional Full Popular', meta: 2765 * numRegionales, ejecucion: 3936 * numRegionales, porcentaje: 142.35 },
      { concepto: 'Total Formación Profesional Integral - Virtual', meta: 53274 * numRegionales, ejecucion: 39934 * numRegionales, porcentaje: 74.96 }
    ];

    // Tabla 3: Primer Curso
    this.datosPrimerCurso = [
      { concepto: 'Aprendices en Primer Curso - Titulada', meta: 125000 * numRegionales, ejecucion: 128500 * numRegionales, porcentaje: 102.80 },
      { concepto: 'Aprendices en Primer Curso - Complementaria', meta: 180000 * numRegionales, ejecucion: 175000 * numRegionales, porcentaje: 97.22 }
    ];

    // Tabla 4: Otras Metas Relacionadas con Formación Profesional
    this.datosOtrasMetas = [
      { concepto: 'Seguimiento a aprendices en empresas', meta: 95000 * numRegionales, ejecucion: 98500 * numRegionales, porcentaje: 103.68 },
      { concepto: 'Evaluación y acreditación de competencias', meta: 75000 * numRegionales, ejecucion: 72800 * numRegionales, porcentaje: 97.07 },
      { concepto: 'Asesoría técnica a empresas', meta: 12000 * numRegionales, ejecucion: 13200 * numRegionales, porcentaje: 110.00 }
    ];

    // Tabla 5: Certificación en Formación Profesional
    this.datosCertificacion = [
      { concepto: 'FORMACIÓN LABORAL', meta: 11036 * numRegionales, ejecucion: 2379 * numRegionales, porcentaje: 21.56 },
      { concepto: 'EDUCACIÓN SUPERIOR', meta: 3010 * numRegionales, ejecucion: 1349 * numRegionales, porcentaje: 44.82 },
      { concepto: 'TOTAL FORMACIÓN TITULADA', meta: 14046 * numRegionales, ejecucion: 3728 * numRegionales, porcentaje: 26.54 },
      { concepto: 'TOTAL FORMACIÓN COMPLEMENTARIA', meta: 100223 * numRegionales, ejecucion: 105251 * numRegionales, porcentaje: 105.02 },
      { concepto: 'TOTAL FORMACIÓN PROFESIONAL INTEGRAL', meta: 114269 * numRegionales, ejecucion: 108979 * numRegionales, porcentaje: 95.37 },
      { concepto: 'ARTICULACION CON LA MEDIA', meta: 6971 * numRegionales, ejecucion: 1025 * numRegionales, porcentaje: 14.70 },
      { concepto: 'CampeSENA', meta: 20509 * numRegionales, ejecucion: 13581 * numRegionales, porcentaje: 66.22 },
      { concepto: 'Full Popular', meta: 1678 * numRegionales, ejecucion: 3175 * numRegionales, porcentaje: 189.21 }
    ];

    // Tabla 6: Certificado de Competencias Laborales
    this.datosCompetenciasLaborales = [
      { concepto: 'Certificaciones CampeSENA', meta: 2113 * numRegionales, ejecucion: 2219 * numRegionales, porcentaje: 105.02 },
      { concepto: 'Certificaciones Full Popular', meta: 1454 * numRegionales, ejecucion: 1736 * numRegionales, porcentaje: 119.39 },
      { concepto: 'Certificaciones Regular', meta: 3169 * numRegionales, ejecucion: 2521 * numRegionales, porcentaje: 79.55 },
      { concepto: 'Total Certificaciones', meta: 6736 * numRegionales, ejecucion: 6476 * numRegionales, porcentaje: 96.14 },
      { concepto: 'No. de Evaluaciones', meta: 6806 * numRegionales, ejecucion: 6953 * numRegionales, porcentaje: 102.16 },
      { concepto: 'Personas Evaluadas', meta: 6545 * numRegionales, ejecucion: 6578 * numRegionales, porcentaje: 100.50 },
      { concepto: 'Personas Certificadas', meta: 6392 * numRegionales, ejecucion: 6180 * numRegionales, porcentaje: 96.68 }
    ];

    // Tabla 7: Productividad CampeSENA
    this.datosProductividadCampesena = [
      { concepto: 'Tecnólogos Producidos CampeSENA', meta: 8500 * numRegionales, ejecucion: 8890 * numRegionales, porcentaje: 104.59 },
      { concepto: 'Técnicos Producidos CampeSENA', meta: 12000 * numRegionales, ejecucion: 11450 * numRegionales, porcentaje: 95.42 },
      { concepto: 'Operarios Producidos CampeSENA', meta: 3500 * numRegionales, ejecucion: 3720 * numRegionales, porcentaje: 106.29 },
      { concepto: 'Total Formación Titulada CampeSENA', meta: 24000 * numRegionales, ejecucion: 24060 * numRegionales, porcentaje: 100.25 }
    ];

    // Tabla 8: Poblaciones Vulnerables
    this.datosPoblacionesVulnerables = [
      { concepto: 'Discapacidad', meta: 1975 * numRegionales, ejecucion: 2179 * numRegionales, porcentaje: 110.33 },
      { concepto: 'Remitidos por Agencia Pública de Empleo (APE)', meta: 1548 * numRegionales, ejecucion: 1253 * numRegionales, porcentaje: 80.94 },
      { concepto: 'Víctimas del Conflicto Armado', meta: 4183 * numRegionales, ejecucion: 3816 * numRegionales, porcentaje: 91.23 },
      { concepto: 'Adolescentes en Conflicto con la Ley Penal', meta: 41 * numRegionales, ejecucion: 15 * numRegionales, porcentaje: 36.59 },
      { concepto: 'Remitidos por el ICBF', meta: 3082 * numRegionales, ejecucion: 2467 * numRegionales, porcentaje: 80.05 },
      { concepto: 'Proceso de Reintegración y/o Reincorporación', meta: 60 * numRegionales, ejecucion: 40 * numRegionales, porcentaje: 66.67 },
      { concepto: 'Población de escasos recursos', meta: 24000 * numRegionales, ejecucion: 26500 * numRegionales, porcentaje: 110.42 }
    ];

    // Tabla 9: Desagregación Otras Poblaciones Vulnerables
    this.datosOtrasPoblaciones = [
      { concepto: 'Grupos Étnicos', meta: 3256 * numRegionales, ejecucion: 2891 * numRegionales, porcentaje: 88.79 },
      { concepto: 'Mujeres Cabeza de Familia', meta: 8712 * numRegionales, ejecucion: 9254 * numRegionales, porcentaje: 106.22 },
      { concepto: 'Población Recluida en Centros Penitenciarios', meta: 1235 * numRegionales, ejecucion: 987 * numRegionales, porcentaje: 79.92 },
      { concepto: 'Adolescentes y Jóvenes en riesgo social', meta: 5421 * numRegionales, ejecucion: 4987 * numRegionales, porcentaje: 91.99 },
      { concepto: 'Adultos Mayores', meta: 2156 * numRegionales, ejecucion: 2387 * numRegionales, porcentaje: 110.72 }
    ];

    // Tabla 10: Agencia Pública de Empleo
    this.datosAgenciaEmpleo = [
      { concepto: 'Personas registradas APE', meta: 45000 * numRegionales, ejecucion: 48500 * numRegionales, porcentaje: 107.78 },
      { concepto: 'Vacantes gestionadas', meta: 12000 * numRegionales, ejecucion: 11200 * numRegionales, porcentaje: 93.33 },
      { concepto: 'Personas orientadas', meta: 35000 * numRegionales, ejecucion: 37800 * numRegionales, porcentaje: 108.00 },
      { concepto: 'Remisiones efectivas', meta: 8000 * numRegionales, ejecucion: 7450 * numRegionales, porcentaje: 93.13 }
    ];

    // Tabla 11: Emprendimiento y Fortalecimiento
    this.datosEmprendimiento = [
      { concepto: 'Planes de negocio asesorados', meta: 2500 * numRegionales, ejecucion: 2687 * numRegionales, porcentaje: 107.48 },
      { concepto: 'Unidades productivas fortalecidas', meta: 1800 * numRegionales, ejecucion: 1654 * numRegionales, porcentaje: 91.89 },
      { concepto: 'Emprendedores capacitados', meta: 5600 * numRegionales, ejecucion: 6120 * numRegionales, porcentaje: 109.29 }
    ];

    // Tabla 12: Fondo Emprender
    this.datosFondoEmprender = [
      { concepto: 'Iniciativas apoyadas con recursos Fondo Emprender', meta: 800 * numRegionales, ejecucion: 640 * numRegionales, porcentaje: 80.00 },
      { concepto: 'Valor desembolsado (millones)', meta: 15000 * numRegionales, ejecucion: 12500 * numRegionales, porcentaje: 83.33 }
    ];

    // Tabla 13: Contratos de Aprendizaje
    this.datosContratosAprendizaje = [
      { concepto: 'Contratos de Aprendizaje Vigentes', meta: 85000 * numRegionales, ejecucion: 87500 * numRegionales, porcentaje: 102.94 },
      { concepto: 'Empresas con contratos', meta: 12000 * numRegionales, ejecucion: 11800 * numRegionales, porcentaje: 98.33 },
      { concepto: 'Aprendices en etapa práctica', meta: 62000 * numRegionales, ejecucion: 64500 * numRegionales, porcentaje: 104.03 }
    ];

    // Tabla 14: Internacionalización
    this.datosInternacionalizacion = [
      { concepto: 'Aprendices en movilidad internacional', meta: 1200 * numRegionales, ejecucion: 1350 * numRegionales, porcentaje: 112.50 },
      { concepto: 'Instructores en movilidad internacional', meta: 450 * numRegionales, ejecucion: 380 * numRegionales, porcentaje: 84.44 }
    ];

    // Tabla 15: Cupos autorizados FIC
    this.datosCuposFIC = [
      { concepto: 'Cupos autorizado FIC - Tecnólogos', meta: 15000 * numRegionales, ejecucion: 15500 * numRegionales, porcentaje: 103.33 },
      { concepto: 'Cupos autorizado FIC - Técnicos', meta: 25000 * numRegionales, ejecucion: 24200 * numRegionales, porcentaje: 96.80 },
      { concepto: 'Cupos autorizados FIC - Complementaria', meta: 60000 * numRegionales, ejecucion: 62500 * numRegionales, porcentaje: 104.17 }
    ];

    // Tabla 16: CampeSENA
    this.datosCampesena = [
      { concepto: 'Tecnólogos CampeSENA', meta: 8500 * numRegionales, ejecucion: 8890 * numRegionales, porcentaje: 104.59 },
      { concepto: 'Técnicos CampeSENA', meta: 12000 * numRegionales, ejecucion: 11450 * numRegionales, porcentaje: 95.42 },
      { concepto: 'Operarios CampeSENA', meta: 3500 * numRegionales, ejecucion: 3720 * numRegionales, porcentaje: 106.29 },
      { concepto: 'Formación Complementaria CampeSENA', meta: 2651 * numRegionales, ejecucion: 2890 * numRegionales, porcentaje: 108.98 }
    ];

    // Tabla 17: Productividad CampeSENA (Detalle)
    this.datosProductividadCampesenaDetalle = [
      { concepto: 'Productividad Tecnólogos CampeSENA', meta: '80%', ejecucion: '82%', porcentaje: 102.50 },
      { concepto: 'Productividad Técnicos CampeSENA', meta: '75%', ejecucion: '73%', porcentaje: 97.33 },
      { concepto: 'Productividad Operarios CampeSENA', meta: '78%', ejecucion: '80%', porcentaje: 102.56 }
    ];

    // Tabla 18: Full Popular
    this.datosFullPopular = [
      { concepto: 'Tecnólogos Full Popular', meta: 1200 * numRegionales, ejecucion: 1450 * numRegionales, porcentaje: 120.83 },
      { concepto: 'Técnicos Full Popular', meta: 950 * numRegionales, ejecucion: 1180 * numRegionales, porcentaje: 124.21 },
      { concepto: 'Operarios Full Popular', meta: 615 * numRegionales, ejecucion: 756 * numRegionales, porcentaje: 122.93 },
      { concepto: 'Formación Complementaria Full Popular', meta: 1850 * numRegionales, ejecucion: 2150 * numRegionales, porcentaje: 116.22 }
    ];

    // Tabla 19: Estrategia Formación Continua Especial Campesina (FEEC)
    this.datosEstrategiaFormacion = [
      { concepto: 'Formación Especial Campesina - Titulada', meta: 4500 * numRegionales, ejecucion: 4780 * numRegionales, porcentaje: 106.22 },
      { concepto: 'Formación Especial Campesina - Complementaria', meta: 6800 * numRegionales, ejecucion: 7150 * numRegionales, porcentaje: 105.15 },
      { concepto: 'TOTAL FEEC', meta: 11300 * numRegionales, ejecucion: 11930 * numRegionales, porcentaje: 105.58 }
    ];
  }
}