import { Injectable } from '@angular/core';
import { MetasData } from './xlsb-api.service';

/**
 * Interfaz para items de seguimiento (metas)
 */
export interface SeguimientoItem {
  categoria: string;
  subcategoria: string;
  anio: number;
  mes: number;
  cupos: number;
  ejecucion: number;
  porcentaje: number;
}

/**
 * Mapeo de campos M_* de la API a subcategorías del componente
 */
interface CampoMeta {
  campo: keyof MetasData;
  subcategoria: string;
  categoria: string;
  nivel: number;
  esSubtotal?: boolean;
  esTotal?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataTransformerService {
  /**
   * Mapeo para CENTROS (nombres originales/abreviados)
   */
  private readonly mapeoMetasCentros: CampoMeta[] = [
    // EDUCACIÓN SUPERIOR - Tecnólogos
    { campo: 'M_TEC_REG_PRE', subcategoria: 'Tecnólogos Regular - Presencial', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_REG_VIR', subcategoria: 'Tecnólogos Regular - Virtual', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_REG_A_D', subcategoria: 'Tecnólogos Regular - A Distancia', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_CAMPESE', subcategoria: 'Tecnólogos CampeSENA', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_FULL_PO', subcategoria: 'Tecnólogos Full Popular', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TECNOLOGOS', subcategoria: 'SubTotal Tecnólogos (E)', categoria: 'EDUCACION SUPERIOR', nivel: 1, esSubtotal: true },
    { campo: 'M_EDU_SUPERIO', subcategoria: 'TOTAL EDUCACION SUPERIOR (E)', categoria: 'EDUCACION SUPERIOR', nivel: 2, esTotal: true },

    // FORMACIÓN LABORAL - Operarios
    { campo: 'M_OPE_REGULAR', subcategoria: 'Operarios Regular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_OPE_CAMPESE', subcategoria: 'Operarios CampeSENA', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_OPE_FULL_PO', subcategoria: 'Operarios Full Popular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_SUB_TOT_OPE', subcategoria: 'SubTotal Operarios (B)', categoria: 'FORMACION LABORAL', nivel: 1, esSubtotal: true },

    // FORMACIÓN LABORAL - Auxiliares
    { campo: 'M_AUX_REGULAR', subcategoria: 'Auxiliares Regular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_AUX_CAMPESE', subcategoria: 'Auxiliares CampeSENA', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_AUX_FULL_PO', subcategoria: 'Auxiliares Full Popular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_SUB_TOT_AUX', subcategoria: 'SubTotal Auxiliares (A)', categoria: 'FORMACION LABORAL', nivel: 1, esSubtotal: true },

    // FORMACIÓN LABORAL - Técnicos
    { campo: 'M_TCO_REG_PRE', subcategoria: 'Técnico Laboral Regular - Presencial', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_REG_VIR', subcategoria: 'Técnico Laboral Regular - Virtual', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_CAMPESE', subcategoria: 'Técnico Laboral CampeSENA', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_FULL_PO', subcategoria: 'Técnico Laboral Full Popular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_ART_MED', subcategoria: 'Técnico Laboral Articulación con la Media', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_SUB_TCO_LAB', subcategoria: 'SubTotal Técnico Laboral (C)', categoria: 'FORMACION LABORAL', nivel: 1, esSubtotal: true },

    // TOTALES FORMACIÓN LABORAL
    { campo: 'M_TOT_FOR_LAB', subcategoria: 'TOTAL FORMACION LABORAL (D=A+B+C+T)', categoria: 'FORMACION LABORAL', nivel: 2, esTotal: true },

    // FORMACIÓN COMPLEMENTARIA
    { campo: 'M_COM_CAMPESE', subcategoria: 'Formación Complementaria CampeSENA', categoria: 'FORMACION COMPLEMENTARIA', nivel: 0 },
    { campo: 'M_COM_FULL_PO', subcategoria: 'Formación Complementaria Full Popular', categoria: 'FORMACION COMPLEMENTARIA', nivel: 0 },

    // TOTAL FORMACIÓN PROFESIONAL INTEGRAL
    { campo: 'M_TOT_PROF_IN', subcategoria: 'TOTAL FORMACION PROFESIONAL INTEGRAL', categoria: 'TOTAL FPI', nivel: 3, esTotal: true }
  ];

  /**
   * Mapeo para REGIONAL (nombres completos/nuevos)
   */
  private readonly mapeoMetasRegional: CampoMeta[] = [
    // EDUCACIÓN SUPERIOR - Tecnólogos
    { campo: 'M_TEC_REG_PRE', subcategoria: 'Tecnólogos Regular - Presencial', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_REG_VIR', subcategoria: 'Tecnólogos Regular - Virtual', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_REG_A_D', subcategoria: 'Tecnólogos Regular - A Distancia', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_CAMPESE', subcategoria: 'Tecnólogos CampeSENA', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    { campo: 'M_TEC_FULL_PO', subcategoria: 'Tecnólogos Full Popular', categoria: 'EDUCACION SUPERIOR', nivel: 0 },
    // ⭐ CAMBIO: Nombres completos para regional
    { campo: 'M_total_tecnologos_e' as keyof MetasData, subcategoria: 'SubTotal Tecnólogos (E)', categoria: 'EDUCACION SUPERIOR', nivel: 1, esSubtotal: true },
    { campo: 'M_total_educacion_superior_e' as keyof MetasData, subcategoria: 'TOTAL EDUCACION SUPERIOR (E)', categoria: 'EDUCACION SUPERIOR', nivel: 2, esTotal: true },

    // FORMACIÓN LABORAL - Operarios
    { campo: 'M_OPE_REGULAR', subcategoria: 'Operarios Regular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_OPE_CAMPESE', subcategoria: 'Operarios CampeSENA', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_OPE_FULL_PO', subcategoria: 'Operarios Full Popular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_total_operarios_b' as keyof MetasData, subcategoria: 'SubTotal Operarios (B)', categoria: 'FORMACION LABORAL', nivel: 1, esSubtotal: true },

    // FORMACIÓN LABORAL - Auxiliares
    { campo: 'M_AUX_REGULAR', subcategoria: 'Auxiliares Regular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_AUX_CAMPESE', subcategoria: 'Auxiliares CampeSENA', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_AUX_FULL_PO', subcategoria: 'Auxiliares Full Popular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_total_auxiliares_a' as keyof MetasData, subcategoria: 'SubTotal Auxiliares (A)', categoria: 'FORMACION LABORAL', nivel: 1, esSubtotal: true },

    // FORMACIÓN LABORAL - Técnicos
    { campo: 'M_TCO_REG_PRE', subcategoria: 'Técnico Laboral Regular - Presencial', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_REG_VIR', subcategoria: 'Técnico Laboral Regular - Virtual', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_CAMPESE', subcategoria: 'Técnico Laboral CampeSENA', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_FULL_PO', subcategoria: 'Técnico Laboral Full Popular', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_TCO_ART_MED', subcategoria: 'Técnico Laboral Articulación con la Media', categoria: 'FORMACION LABORAL', nivel: 0 },
    { campo: 'M_total_tecnico_laboral_c' as keyof MetasData, subcategoria: 'SubTotal Técnico Laboral (C)', categoria: 'FORMACION LABORAL', nivel: 1, esSubtotal: true },

    // TOTALES FORMACIÓN LABORAL
    { campo: 'M_TOT_FOR_LAB', subcategoria: 'TOTAL FORMACION LABORAL (D=A+B+C+T)', categoria: 'FORMACION LABORAL', nivel: 2, esTotal: true },

    // FORMACIÓN COMPLEMENTARIA
    { campo: 'M_COM_CAMPESE', subcategoria: 'Formación Complementaria CampeSENA', categoria: 'FORMACION COMPLEMENTARIA', nivel: 0 },
    { campo: 'M_COM_FULL_PO', subcategoria: 'Formación Complementaria Full Popular', categoria: 'FORMACION COMPLEMENTARIA', nivel: 0 },

    // TOTAL FORMACIÓN PROFESIONAL INTEGRAL
    { campo: 'M_TOT_PROF_IN', subcategoria: 'TOTAL FORMACION PROFESIONAL INTEGRAL', categoria: 'TOTAL FPI', nivel: 3, esTotal: true }
  ];

  constructor() { }

  /**
   * Detecta si los datos son de CENTROS o REGIONAL
   * @param metasData Datos desde la API
   * @returns true si es de centros, false si es de regional
   */
  private esDataDeCentros(metasData: MetasData): boolean {
    // Si tiene COD_CENTRO, es de centros
    return !!metasData.COD_CENTRO;
  }

  /**
   * Obtiene el mapeo correcto según el tipo de datos
   * @param metasData Datos desde la API
   * @returns El mapeo correspondiente (centros o regional)
   */
  private obtenerMapeoCorrect(metasData: MetasData): CampoMeta[] {
    return this.esDataDeCentros(metasData) ? this.mapeoMetasCentros : this.mapeoMetasRegional;
  }

  /**
   * Transforma datos de metas de la API al formato SeguimientoItem
   * @param metasData Datos de metas desde la API
   * @param ejecucionData Datos de ejecución (opcional)
   * @returns Array de SeguimientoItem
   */
  transformarMetasParaComponente(
    metasData: MetasData,
    ejecucionData?: any
  ): SeguimientoItem[] {
    const resultado: SeguimientoItem[] = [];
    const anioActual = parseInt(metasData.PERIODO) || new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;

    // ⭐ MEJORADO: Obtener el mapeo correcto según el tipo de datos
    const mapeoActual = this.obtenerMapeoCorrect(metasData);

    // Iterar sobre el mapeo y crear items de seguimiento
    mapeoActual.forEach(mapeo => {
      const cupos = metasData[mapeo.campo] as number || 0;

      // Solo incluir si tiene valor
      if (cupos !== null && cupos !== undefined) {
        const item: SeguimientoItem = {
          categoria: mapeo.categoria,
          subcategoria: mapeo.subcategoria,
          anio: anioActual,
          mes: mesActual,
          cupos: cupos,
          ejecucion: 0, // Se completará con datos de ejecución
          porcentaje: 0
        };

        // Si hay datos de ejecución, intentar encontrar el valor correspondiente
        if (ejecucionData) {
          const ejecucionValor = this.extraerEjecucion(ejecucionData, mapeo.campo);
          item.ejecucion = ejecucionValor;
          item.porcentaje = cupos > 0 ? (ejecucionValor / cupos) * 100 : 0;
        }

        resultado.push(item);
      }
    });

    return resultado;
  }

  /**
   * Mapeo de campos de metas (M_*) a campos de ejecución (sin prefijo)
   */
  private readonly mapeoEjecucion: Record<string, string> = {
    // Educación Superior - Tecnólogos
    'M_TEC_REG_PRE': 'TEC_REG_PRE',
    'M_TEC_REG_VIR': 'TEC_REG_VIR',
    'M_TEC_REG_A_D': 'TEC_REG_A_D',
    'M_TEC_CAMPESE': 'TEC_CAMPESE',
    'M_TEC_FULL_PO': 'TEC_FULL_PO',
    'M_TECNOLOGOS': 'TECNOLOGOS',
    'M_total_tecnologos_e': 'TECNOLOGOS',
    'M_EDU_SUPERIO': 'EDU_SUPERIO',
    'M_total_educacion_superior_e': 'EDU_SUPERIO',

    // Formación Laboral - Operarios
    'M_OPE_REGULAR': 'OPE_REGULAR',
    'M_OPE_CAMPESE': 'OPE_CAMPESE',
    'M_OPE_FULL_PO': 'OPE_FULL_PO',
    'M_SUB_TOT_OPE': 'SUB_TOT_OPE',
    'M_total_operarios_b': 'SUB_TOT_OPE',

    // Formación Laboral - Auxiliares
    'M_AUX_REGULAR': 'AUX_REGULAR',
    'M_AUX_CAMPESE': 'AUX_CAMPESE',
    'M_AUX_FULL_PO': 'AUX_FULL_PO',
    'M_SUB_TOT_AUX': 'SUB_TOT_AUX',
    'M_total_auxiliares_a': 'SUB_TOT_AUX',

    // Formación Laboral - Técnicos
    'M_TCO_REG_PRE': 'TCO_REG_PRE',
    'M_TCO_REG_VIR': 'TCO_REG_VIR',
    'M_TCO_CAMPESE': 'TCO_CAMPESE',
    'M_TCO_FULL_PO': 'TCO_FULL_PO',
    'M_TCO_ART_MED': 'TCO_ART_MED',
    'M_SUB_TCO_LAB': 'SUB_TCO_LAB',
    'M_total_tecnico_laboral_c': 'SUB_TCO_LAB',

    // Totales Formación Laboral
    'M_profundizacion_tecnica_t': 'PROF_TECNIC',
    'M_TOT_FOR_LAB': 'TOT_FOR_LAB',

    // Formación Complementaria
    'M_formacion_complementaria_virtual_sin_bilinguismo_g': 'COM_VIR_SBI',
    'M_formacion_complementaria_presencial_sin_bilinguismo_h': 'COM_PRE_SBI',
    'M_programa_de_bilinguismo_virtual_i': 'COM_BIL_VIR',
    'M_programa_de_bilinguismo_presencial_j': 'COM_BIL_PRE',
    'M_subtotal_programa_de_bilinguismo_k_i_j': 'SUB_PRO_BIN',
    'M_COM_CAMPESE': 'COM_CAMPESE',
    'M_COM_FULL_PO': 'COM_FULL_PO',
    'M_total_formacion_complementaria_n_g_h_k_l_m': 'TOT_COMPLEM',

    // Total FPI
    'M_TOT_PROF_IN': 'TOT_PROF_IN',
    'M_total_formacion_complementaria_n_g_h_k_l_m_incluye_los_cupos_de_formacion_continua_especial_campesina': 'TOT_COMPLEM'
  };

  /**
   * Extrae el valor de ejecución correspondiente a un campo de meta
   * @param ejecucionData Datos de ejecución desde la API
   * @param campoMeta Campo de meta (con prefijo M_)
   * @returns Valor de ejecución correspondiente
   */
  private extraerEjecucion(ejecucionData: any, campoMeta: keyof MetasData): number {
    if (!ejecucionData) {
      return 0;
    }

    // Buscar el campo de ejecución correspondiente
    const campoEjecucion = this.mapeoEjecucion[campoMeta as string];

    if (campoEjecucion && ejecucionData[campoEjecucion] !== undefined) {
      return Number(ejecucionData[campoEjecucion]) || 0;
    }

    // Si no hay mapeo, retornar 0
    return 0;
  }

  /**
   * Transforma un array completo de metas (por regional o centro)
   */
  transformarArrayMetas(
    metasArray: MetasData[],
    ejecucionArray?: any[]
  ): Map<string, SeguimientoItem[]> {
    const resultado = new Map<string, SeguimientoItem[]>();

    metasArray.forEach(metasData => {
      const key = metasData.COD_CENTRO
        ? `centro_${metasData.COD_CENTRO}`
        : `regional_${metasData.COD_REGIONAL}`;

      // Buscar datos de ejecución correspondientes
      const ejecucion = ejecucionArray?.find(e =>
        (metasData.COD_CENTRO && e.COD_CENTRO === metasData.COD_CENTRO) ||
        (!metasData.COD_CENTRO && e.COD_REGIONAL === metasData.COD_REGIONAL)
      );

      const items = this.transformarMetasParaComponente(metasData, ejecucion);
      resultado.set(key, items);
    });

    return resultado;
  }

  /**
   * Filtra seguimiento por categoría
   */
  filtrarPorCategoria(items: SeguimientoItem[], categoria: string): SeguimientoItem[] {
    return items.filter(item => item.categoria === categoria);
  }

  /**
   * Filtra seguimiento solo totales
   */
  filtrarTotales(items: SeguimientoItem[]): SeguimientoItem[] {
    // Usar el mapeo de centros como referencia (es el que tiene los nombres base)
    const subcategoriasTotales = this.mapeoMetasCentros
      .filter(m => m.esTotal)
      .map(m => m.subcategoria);

    return items.filter(item => subcategoriasTotales.includes(item.subcategoria));
  }

  /**
   * Filtra seguimiento solo subtotales
   */
  filtrarSubtotales(items: SeguimientoItem[]): SeguimientoItem[] {
    const subcategoriasSubtotales = this.mapeoMetasCentros
      .filter(m => m.esSubtotal && !m.esTotal)
      .map(m => m.subcategoria);

    return items.filter(item => subcategoriasSubtotales.includes(item.subcategoria));
  }

  /**
   * Filtra seguimiento solo detalles (sin totales ni subtotales)
   */
  filtrarDetalles(items: SeguimientoItem[]): SeguimientoItem[] {
    const subcategoriasAgrupadas = this.mapeoMetasCentros
      .filter(m => m.esSubtotal || m.esTotal)
      .map(m => m.subcategoria);

    return items.filter(item => !subcategoriasAgrupadas.includes(item.subcategoria));
  }

  /**
   * Ordena seguimiento según el orden de mapeo
   */
  ordenarSeguimiento(items: SeguimientoItem[]): SeguimientoItem[] {
    return items.sort((a, b) => {
      // Usar mapeo de centros como referencia para el orden
      const indexA = this.mapeoMetasCentros.findIndex(m => m.subcategoria === a.subcategoria);
      const indexB = this.mapeoMetasCentros.findIndex(m => m.subcategoria === b.subcategoria);
      return indexA - indexB;
    });
  }

  /**
   * Obtiene el mapeo completo de metas
   */
  getMapeoMetas(): CampoMeta[] {
    return [...this.mapeoMetasCentros];
  }

  /**
   * Busca información de un campo en el mapeo
   */
  getInfoCampo(campo: keyof MetasData): CampoMeta | undefined {
    return this.mapeoMetasCentros.find(m => m.campo === campo);
  }

  /**
   * Busca información de una subcategoría en el mapeo
   */
  getInfoSubcategoria(subcategoria: string): CampoMeta | undefined {
    return this.mapeoMetasCentros.find(m => m.subcategoria === subcategoria);
  }
}