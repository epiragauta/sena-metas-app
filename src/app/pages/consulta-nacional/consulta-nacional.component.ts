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

  constructor(private http: HttpClient) {}

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

    // Tabla 2: Programas Relevantes (escalado nacional)
    this.datosProgramasRelevantes = [
      { concepto: 'Total Formación Profesional CampeSENA', meta: 26651 * 33, ejecucion: 27611 * 33, porcentaje: 103.60 },
      { concepto: 'Total Formación Profesional Full Popular', meta: 2765 * 33, ejecucion: 3936 * 33, porcentaje: 142.35 },
      { concepto: 'Total Formación Profesional Integral - Virtual', meta: 53274 * 33, ejecucion: 39934 * 33, porcentaje: 74.96 }
    ];

    // Tabla 3: Retención (porcentajes consolidados)
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

    // Tabla 4: Certificación (escalado nacional)
    this.datosCertificacion = [
      { concepto: 'FORMACIÓN LABORAL', meta: 11036 * 33, ejecucion: 2379 * 33, porcentaje: 21.56 },
      { concepto: 'EDUCACIÓN SUPERIOR', meta: 3010 * 33, ejecucion: 1349 * 33, porcentaje: 44.82 },
      { concepto: 'TOTAL FORMACIÓN TITULADA', meta: 14046 * 33, ejecucion: 3728 * 33, porcentaje: 26.54 },
      { concepto: 'TOTAL FORMACIÓN COMPLEMENTARIA', meta: 100223 * 33, ejecucion: 105251 * 33, porcentaje: 105.02 },
      { concepto: 'TOTAL FORMACIÓN PROFESIONAL INTEGRAL', meta: 114269 * 33, ejecucion: 108979 * 33, porcentaje: 95.37 },
      { concepto: 'ARTICULACION CON LA MEDIA', meta: 6971 * 33, ejecucion: 1025 * 33, porcentaje: 14.70 },
      { concepto: 'CampeSENA', meta: 20509 * 33, ejecucion: 13581 * 33, porcentaje: 66.22 },
      { concepto: 'Full Popular', meta: 1678 * 33, ejecucion: 3175 * 33, porcentaje: 189.21 }
    ];

    // Tabla 5: Competencias Laborales (escalado nacional)
    this.datosCompetenciasLaborales = [
      { concepto: 'Certificaciones CampeSENA', meta: 2113 * 33, ejecucion: 2219 * 33, porcentaje: 105.02 },
      { concepto: 'Certificaciones Full Popular', meta: 1454 * 33, ejecucion: 1736 * 33, porcentaje: 119.39 },
      { concepto: 'Certificaciones Regular', meta: 3169 * 33, ejecucion: 2521 * 33, porcentaje: 79.55 },
      { concepto: 'Total Certificaciones', meta: 6736 * 33, ejecucion: 6476 * 33, porcentaje: 96.14 },
      { concepto: 'No. de Evaluaciones', meta: 6806 * 33, ejecucion: 6953 * 33, porcentaje: 102.16 },
      { concepto: 'Personas Evaluadas', meta: 6545 * 33, ejecucion: 6578 * 33, porcentaje: 100.50 },
      { concepto: 'Personas Certificadas', meta: 6392 * 33, ejecucion: 6180 * 33, porcentaje: 96.68 },
      { concepto: 'Instrumentos de evaluación construidos', meta: 27 * 33, ejecucion: 22 * 33, porcentaje: 81.48 }
    ];

    // Tabla 6: Poblaciones Vulnerables (escalado nacional)
    this.datosPoblacionesVulnerables = [
      { concepto: 'Discapacidad', meta: 1975 * 33, ejecucion: 2179 * 33, porcentaje: 110.33 },
      { concepto: 'Remitidos por Agencia Pública de Empleo (APE)', meta: 1548 * 33, ejecucion: 1253 * 33, porcentaje: 80.94 },
      { concepto: 'Víctimas del Conflicto Armado', meta: 4183 * 33, ejecucion: 3816 * 33, porcentaje: 91.23 },
      { concepto: 'Adolescentes en Conflicto con la Ley Penal', meta: 41 * 33, ejecucion: 15 * 33, porcentaje: 36.59 },
      { concepto: 'Remitidos por el Instituto Colombiano de Bienestar Familiar (ICBF)', meta: 3082 * 33, ejecucion: 2467 * 33, porcentaje: 80.05 },
      { concepto: 'Proceso de Reintegración y/o Reincorporación', meta: 60 * 33, ejecucion: 40 * 33, porcentaje: 66.67 },
      { concepto: 'Población de escasos recursos', meta: 24000 * 33, ejecucion: 26500 * 33, porcentaje: 110.42 }
    ];

    // Tabla 7: Otras Poblaciones (escalado nacional)
    this.datosOtrasPoblaciones = [
      { concepto: 'Grupos Étnicos', meta: 3256 * 33, ejecucion: 2891 * 33, porcentaje: 88.79 },
      { concepto: 'Mujeres Cabeza de Familia', meta: 8712 * 33, ejecucion: 9254 * 33, porcentaje: 106.22 },
      { concepto: 'Población Recluida en Centros Penitenciarios', meta: 1235 * 33, ejecucion: 987 * 33, porcentaje: 79.92 },
      { concepto: 'Adolescentes y Jóvenes en riesgo social', meta: 5421 * 33, ejecucion: 4987 * 33, porcentaje: 91.99 },
      { concepto: 'Adultos Mayores', meta: 2156 * 33, ejecucion: 2387 * 33, porcentaje: 110.72 }
    ];

    // Tabla 8: Agencia Pública de Empleo (escalado nacional)
    this.datosAgenciaEmpleo = [
      { concepto: 'Personas registradas APE', meta: 45000 * 33, ejecucion: 48500 * 33, porcentaje: 107.78 },
      { concepto: 'Vacantes gestionadas', meta: 12000 * 33, ejecucion: 11200 * 33, porcentaje: 93.33 },
      { concepto: 'Personas orientadas', meta: 35000 * 33, ejecucion: 37800 * 33, porcentaje: 108.00 },
      { concepto: 'Remisiones efectivas', meta: 8000 * 33, ejecucion: 7450 * 33, porcentaje: 93.13 }
    ];

    // Tabla 9: Emprendimiento (escalado nacional)
    this.datosEmprendimiento = [
      { concepto: 'Planes de negocio asesorados', meta: 2500 * 33, ejecucion: 2687 * 33, porcentaje: 107.48 },
      { concepto: 'Unidades productivas fortalecidas', meta: 1800 * 33, ejecucion: 1654 * 33, porcentaje: 91.89 },
      { concepto: 'Emprendedores capacitados', meta: 5600 * 33, ejecucion: 6120 * 33, porcentaje: 109.29 }
    ];

    // Tabla 10: Contratos de Aprendizaje (escalado nacional)
    this.datosContratosAprendizaje = [
      { concepto: 'Contratos de Aprendizaje Vigentes', meta: 85000 * 33, ejecucion: 87500 * 33, porcentaje: 102.94 },
      { concepto: 'Empresas con contratos', meta: 12000 * 33, ejecucion: 11800 * 33, porcentaje: 98.33 },
      { concepto: 'Aprendices en etapa práctica', meta: 62000 * 33, ejecucion: 64500 * 33, porcentaje: 104.03 }
    ];

    // Tabla 11: CampeSENA (escalado nacional)
    this.datosCampesena = [
      { concepto: 'Tecnólogos CampeSENA', meta: 8500 * 33, ejecucion: 8890 * 33, porcentaje: 104.59 },
      { concepto: 'Técnicos CampeSENA', meta: 12000 * 33, ejecucion: 11450 * 33, porcentaje: 95.42 },
      { concepto: 'Operarios CampeSENA', meta: 3500 * 33, ejecucion: 3720 * 33, porcentaje: 106.29 },
      { concepto: 'Formación Complementaria CampeSENA', meta: 2651 * 33, ejecucion: 2890 * 33, porcentaje: 108.98 }
    ];

    // Tabla 12: Full Popular (escalado nacional)
    this.datosFullPopular = [
      { concepto: 'Tecnólogos Full Popular', meta: 1200 * 33, ejecucion: 1450 * 33, porcentaje: 120.83 },
      { concepto: 'Técnicos Full Popular', meta: 950 * 33, ejecucion: 1180 * 33, porcentaje: 124.21 },
      { concepto: 'Operarios Full Popular', meta: 615 * 33, ejecucion: 756 * 33, porcentaje: 122.93 },
      { concepto: 'Formación Complementaria Full Popular', meta: 1850 * 33, ejecucion: 2150 * 33, porcentaje: 116.22 }
    ];

    // Tabla 13: FEEC (escalado nacional)
    this.datosFeec = [
      { concepto: 'Formación Especial Campesina - Titulada', meta: 4500 * 33, ejecucion: 4780 * 33, porcentaje: 106.22 },
      { concepto: 'Formación Especial Campesina - Complementaria', meta: 6800 * 33, ejecucion: 7150 * 33, porcentaje: 105.15 }
    ];

    // Tabla 14: Primer Curso (escalado nacional)
    this.datosPrimerCurso = [
      { concepto: 'Aprendices en Primer Curso - Titulada', meta: 125000 * 33, ejecucion: 128500 * 33, porcentaje: 102.80 },
      { concepto: 'Aprendices en Primer Curso - Complementaria', meta: 180000 * 33, ejecucion: 175000 * 33, porcentaje: 97.22 }
    ];
  }
}
