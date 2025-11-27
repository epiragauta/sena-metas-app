/**
 * Modelos de datos para la aplicación de seguimiento de metas SENA
 */

export interface Meta {
  id: number;
  descripcion: string;
  meta: number;
  ejecucion: number;
  porcentaje: number;
  esSubtotal: boolean;
  esTotal: boolean;
  nivelJerarquia: number;
}

export interface FormacionPorNivel {
  id: number;
  nivelFormacion: string;
  regularMeta: number | null;
  regularEjecucion: number | null;
  regularPorcentaje: number | null;
  campesenaMeta: number | null;
  campesenaEjecucion: number | null;
  campesenaPorcentaje: number | null;
  fullPopularMeta: number | null;
  fullPopularEjecucion: number | null;
  fullPopularPorcentaje: number | null;
  totalMeta: number;
  esTotal: boolean;
}

export interface ProgramaRelevante {
  id: number;
  descripcion: string;
  meta: number;
  ejecucion: number;
  porcentaje: number;
  tipo: string;
}

export interface MetasPrimerCurso {
  id: number;
  descripcion: string;
  meta: number;
  ejecucion: number;
  porcentaje: number;
  tipo: string;
}

export interface RangoSemaforo {
  id: number;
  agrupador: string;
  nombreIndicador: string;
  mes: string;
  minBaja: number;
  maxBaja: number;
  minVulnerable: number;
  maxVulnerable: number;
  minBuena: number;
  maxBuena: number;
  sobreejecucionSuperiorA: number;
}

export interface MetricaAdicional {
  id: number;
  nombreMetrica: string;
  meta: number | null;
  ejecucion: number | null;
  tipoDato: string;
  esTotal: boolean;
}

export interface MetricasPorCategoria {
  [categoria: string]: MetricaAdicional[];
}

export interface Jerarquia {
  id: number;
  tablaOrigen: string;
  idPadre: number;
  nombrePadre: string;
  idHijo: number;
  nombreHijo: string;
  tablaHijo: string;
  operacion: string;
}

export interface KPI {
  titulo: string;
  meta: number;
  ejecucion: number;
  porcentaje: number;
  estado: 'success' | 'warning' | 'danger';
}

export interface Modalidad {
  estrategia: string;
  meta: number;
  ejecucion: number;
  porcentaje: number;
}

export interface DashboardData {
  kpis: KPI[];
  estrategias: Modalidad[];
  topCumplimiento: Meta[];
  mayorBrecha: {
    descripcion: string;
    meta: number;
    ejecucion: number;
    brecha: number;
    porcentaje: number;
  }[];
  fechaElaboracion?: string;
}

export interface Referencias {
  version: string;
  periodo: string;
  descripcion: string;
  jerarquias: {
    [nombre: string]: {
      tipo: string;
      componentes: string[];
      tabla: string;
    };
  };
  totales: any;
  calculos: any;
  programas_especiales: any[];
  indicadores_transversales: any;
}

export type EstadoSemaforo = 'bajo' | 'vulnerable' | 'buena' | 'sobreejecucion';

export interface CategorizacionSemaforo {
  indicador: string;
  porcentaje: number;
  categoria: EstadoSemaforo;
  color: string;
}

/**
 * Interfaz para filtros combinados de metas
 */
export interface FiltrosMetas {
  niveles?: number[];
  tipo?: 'total' | 'subtotal' | 'detalle' | 'todos';
  porcentajeMin?: number;
  porcentajeMax?: number;
  estadoSemaforo?: EstadoSemaforo;
  textoBusqueda?: string;
  padreId?: number;
  padreNombre?: string;
  estrategia?: 'regular' | 'campesena' | 'fullpopular';
}
