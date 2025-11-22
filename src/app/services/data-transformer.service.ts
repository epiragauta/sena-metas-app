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
   * Mapeo completo de campos M_* a subcategorías
   */
  private readonly mapeoMetas: CampoMeta[] = [
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

  constructor() {}

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

    // Iterar sobre el mapeo y crear items de seguimiento
    this.mapeoMetas.forEach(mapeo => {
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
   * Extrae el valor de ejecución correspondiente a un campo de meta
   * Esta función debe adaptarse según la estructura real de los datos de ejecución
   */
  private extraerEjecucion(ejecucionData: any, campoMeta: keyof MetasData): number {
    // TODO: Implementar mapeo de campos de ejecución
    // Por ahora retorna 0, debe adaptarse cuando se integre con datos de ejecución

    // Ejemplo de cómo podría funcionar:
    // const mapeoEjecucion: Record<string, string> = {
    //   'M_TEC_REG_PRE': 'TEC_REG_PRE_EJEC',
    //   'M_TEC_REG_VIR': 'TEC_REG_VIR_EJEC',
    //   // ...
    // };
    // const campoEjecucion = mapeoEjecucion[campoMeta];
    // return ejecucionData[campoEjecucion] || 0;

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
    const subcategoriasTotales = this.mapeoMetas
      .filter(m => m.esTotal)
      .map(m => m.subcategoria);

    return items.filter(item => subcategoriasTotales.includes(item.subcategoria));
  }

  /**
   * Filtra seguimiento solo subtotales
   */
  filtrarSubtotales(items: SeguimientoItem[]): SeguimientoItem[] {
    const subcategoriasSubtotales = this.mapeoMetas
      .filter(m => m.esSubtotal && !m.esTotal)
      .map(m => m.subcategoria);

    return items.filter(item => subcategoriasSubtotales.includes(item.subcategoria));
  }

  /**
   * Filtra seguimiento solo detalles (sin totales ni subtotales)
   */
  filtrarDetalles(items: SeguimientoItem[]): SeguimientoItem[] {
    const subcategoriasAgrupadas = this.mapeoMetas
      .filter(m => m.esSubtotal || m.esTotal)
      .map(m => m.subcategoria);

    return items.filter(item => !subcategoriasAgrupadas.includes(item.subcategoria));
  }

  /**
   * Ordena seguimiento según el orden de mapeo
   */
  ordenarSeguimiento(items: SeguimientoItem[]): SeguimientoItem[] {
    return items.sort((a, b) => {
      const indexA = this.mapeoMetas.findIndex(m => m.subcategoria === a.subcategoria);
      const indexB = this.mapeoMetas.findIndex(m => m.subcategoria === b.subcategoria);
      return indexA - indexB;
    });
  }

  /**
   * Obtiene el mapeo completo de metas
   */
  getMapeoMetas(): CampoMeta[] {
    return [...this.mapeoMetas];
  }

  /**
   * Busca información de un campo en el mapeo
   */
  getInfoCampo(campo: keyof MetasData): CampoMeta | undefined {
    return this.mapeoMetas.find(m => m.campo === campo);
  }

  /**
   * Busca información de una subcategoría en el mapeo
   */
  getInfoSubcategoria(subcategoria: string): CampoMeta | undefined {
    return this.mapeoMetas.find(m => m.subcategoria === subcategoria);
  }
}
