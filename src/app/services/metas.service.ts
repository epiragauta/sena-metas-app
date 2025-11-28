import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import {
  Meta,
  FormacionPorNivel,
  ProgramaRelevante,
  RangoSemaforo,
  MetricasPorCategoria,
  Jerarquia,
  DashboardData,
  Referencias,
  EstadoSemaforo,
  CategorizacionSemaforo,
  MetasPrimerCurso,
  FiltrosMetas
} from '../models/meta.model';

@Injectable({
  providedIn: 'root'
})
export class MetasService {
  private readonly basePath = 'assets/data';

  // Cache de datos
  private metasCache$?: Observable<Meta[]>;
  private dashboardCache$?: Observable<DashboardData>;
  private referenciasCache$?: Observable<Referencias>;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las metas de formación profesional integral
   */
  getMetas(): Observable<Meta[]> {
    if (!this.metasCache$) {
      this.metasCache$ = this.http
        .get<Meta[]>(`${this.basePath}/metas_fpi.json`)
        .pipe(shareReplay(1));
    }
    return this.metasCache$;
  }

  /**
   * Obtiene las metas filtradas por nivel jerárquico
   */
  getMetasPorNivel(nivel: number): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => metas.filter(m => m.nivelJerarquia === nivel))
    );
  }

  /**
   * Obtiene solo los totales principales
   */
  getTotalesPrincipales(): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => metas.filter(m => m.esTotal))
    );
  }

  /**
   * Obtiene solo los detalles (sin totales ni subtotales)
   */
  getDetalles(): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => metas.filter(m => !m.esTotal && !m.esSubtotal))
    );
  }

  /**
   * Obtiene formación por nivel y programa
   */
  getFormacionPorNivel(): Observable<FormacionPorNivel[]> {
    return this.http.get<FormacionPorNivel[]>(`${this.basePath}/formacion_por_nivel.json`);
  }

  /**
   * Obtiene programas relevantes
   */
  getProgramasRelevantes(): Observable<ProgramaRelevante[]> {
    return this.http.get<ProgramaRelevante[]>(`${this.basePath}/programas_relevantes.json`);
  }

  /**
   * Obtiene primer curso
   */
  getPrimerCurso(): Observable<MetasPrimerCurso> {
    return this.http.get<any>(`${this.basePath}/referencias_totales.json`).pipe(
      map(data => {
        const primerCurso = data.programas_especiales?.find((p: any) => p.tipo === 'Primer curso');
        if (primerCurso) {
          const porcentaje = primerCurso.meta > 0 ? (primerCurso.ejecucion / primerCurso.meta) * 100 : 0;
          return {
            id: 1,
            descripcion: primerCurso.descripcion,
            meta: primerCurso.meta,
            ejecucion: primerCurso.ejecucion,
            porcentaje: porcentaje,
            tipo: primerCurso.tipo
          };
        }
        // Valor por defecto si no se encuentra
        return {
          id: 1,
          descripcion: 'Tecnólogos Primer Curso',
          meta: 0,
          ejecucion: 0,
          porcentaje: 0,
          tipo: 'Primer curso'
        };
      })
    );
  }

  /**
   * Obtiene rangos de semáforo
   */
  getRangosSemaforo(): Observable<RangoSemaforo[]> {
    return this.http.get<RangoSemaforo[]>(`${this.basePath}/rangos_semaforo.json`);
  }

  /**
   * Obtiene métricas adicionales agrupadas por categoría
   */
  getMetricasAdicionales(): Observable<MetricasPorCategoria> {
    return this.http.get<MetricasPorCategoria>(`${this.basePath}/metricas_adicionales.json`);
  }

  /**
   * Obtiene jerarquías
   */
  getJerarquias(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias.json`);
  }

  /**
   * Obtiene metas con jerarquía basada en IDs
   */
  getMetasJerarquia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}/metas_jerarquia.json`);
  }

  /**
   * Obtiene formación por estrategia
   */
  getFormacionPorEstrategia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}/formacion_por_estrategia.json`);
  }

  /**
   * Obtiene metas de retención
   */
  getMetasRetencion(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_retencion.json`);
  }

  /**
   * Obtiene jerarquías de retención
   */
  getJerarquiasRetencion(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias_retencion.json`);
  }

  /**
   * Obtiene metas de certificación
   */
  getMetasCertificacion(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_certificacion.json`);
  }

  /**
   * Obtiene jerarquías de certificación
   */
  getJerarquiasCertificacion(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias_certificacion.json`);
  }

  /**
   * Obtiene metas de competencias laborales
   */
  getMetasCompetenciasLaborales(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_competencias_laborales.json`);
  }

  /**
   * Obtiene jerarquías de competencias laborales
   */
  getJerarquiasCompetenciasLaborales(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias_competencias_laborales.json`);
  }

  /**
   * Obtiene metas de productividad CampeSENA
   */
  getMetasProductividadCampesena(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_productividad_campesena.json`);
  }

  /**
   * Obtiene metas de poblaciones vulnerables
   */
  getMetasPoblacionesVulnerables(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_poblaciones_vulnerables.json`);
  }

  /**
   * Obtiene jerarquías de poblaciones vulnerables
   */
  getJerarquiasPoblacionesVulnerables(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias_poblaciones_vulnerables.json`);
  }

  /**
   * Obtiene metas de agencia pública de empleo
   */
  getMetasAgenciaPublicaEmpleo(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_agencia_publica_empleo.json`);
  }

  /**
   * Obtiene jerarquías de agencia pública de empleo
   */
  getJerarquiasAgenciaPublicaEmpleo(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias_agencia_publica_empleo.json`);
  }

  /**
   * Obtiene datos para el dashboard principal
   */
  getDashboardData(): Observable<DashboardData> {
    if (!this.dashboardCache$) {
      this.dashboardCache$ = this.http
        .get<DashboardData>(`${this.basePath}/dashboard.json`)
        .pipe(shareReplay(1));
    }
    return this.dashboardCache$;
  }

  /**
   * Obtiene referencias de totales y fórmulas
   */
  getReferencias(): Observable<Referencias> {
    if (!this.referenciasCache$) {
      this.referenciasCache$ = this.http
        .get<Referencias>(`${this.basePath}/referencias_totales.json`)
        .pipe(shareReplay(1));
    }
    return this.referenciasCache$;
  }

  /**
   * Obtiene los componentes de un indicador padre
   */
  getComponentes(nombrePadre: string): Observable<Meta[]> {
    return this.getJerarquias().pipe(
      map(jerarquias => {
        const hijos = jerarquias
          .filter(j => j.nombrePadre === nombrePadre)
          .map(j => j.nombreHijo);
        return hijos;
      }),
      switchMap(hijosNombres => {
        return this.getMetas().pipe(
          map(metas => metas.filter(m => hijosNombres.includes(m.descripcion)))
        );
      })
    );
  }

  /**
   * Categoriza un porcentaje según los rangos de semáforo
   */
  categorizarPorcentaje(porcentaje: number, rangos: RangoSemaforo): EstadoSemaforo {
    if (porcentaje < rangos.minBaja) {
      return 'bajo';
    } else if (porcentaje >= rangos.minBaja && porcentaje <= rangos.maxBaja) {
      return 'bajo';
    } else if (porcentaje >= rangos.minVulnerable && porcentaje <= rangos.maxVulnerable) {
      return 'vulnerable';
    } else if (porcentaje >= rangos.minBuena && porcentaje <= rangos.maxBuena) {
      return 'buena';
    } else if (porcentaje > rangos.sobreejecucionSuperiorA) {
      return 'sobreejecucion';
    } else {
      return 'buena';
    }
  }

  /**
   * Obtiene el color asociado a una categoría de semáforo
   */
  getColorSemaforo(categoria: EstadoSemaforo): string {
    const colores = {
      bajo: '#ff0000',
      vulnerable: '#FFFF00',
      buena: '#92D050',
      sobreejecucion: '#FFC000'
    };
    return colores[categoria];
  }

  /**
   * Obtiene la clase CSS asociada a un porcentaje
   */
  getClasePorcentaje(porcentaje: number): string {
    if (porcentaje > 100.59) return 'over'
    if (porcentaje >= 90 && porcentaje <= 100.59) return 'success';
    if (porcentaje >= 83 && porcentaje <= 89.99) return 'warning';
    return 'danger';
  }

  // ========================================
  // MÉTODOS AVANZADOS DE FILTRADO
  // ========================================

  /**
   * Filtra metas por múltiples niveles jerárquicos
   */
  filtrarPorNiveles(niveles: number[]): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => metas.filter(m => niveles.includes(m.nivelJerarquia)))
    );
  }

  /**
   * Filtra metas por rango de porcentaje
   */
  filtrarPorRangoPorcentaje(min: number, max: number): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => metas.filter(m => m.porcentaje >= min && m.porcentaje <= max))
    );
  }

  /**
   * Filtra metas por estado de semáforo
   */
  filtrarPorEstadoSemaforo(estado: EstadoSemaforo, rangos: RangoSemaforo): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => metas.filter(m => this.categorizarPorcentaje(m.porcentaje, rangos) === estado))
    );
  }

  /**
   * Filtra metas por tipo (total, subtotal, detalle)
   */
  filtrarPorTipo(tipo: 'total' | 'subtotal' | 'detalle' | 'todos'): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => {
        if (tipo === 'todos') return metas;
        if (tipo === 'total') return metas.filter(m => m.esTotal);
        if (tipo === 'subtotal') return metas.filter(m => m.esSubtotal && !m.esTotal);
        return metas.filter(m => !m.esTotal && !m.esSubtotal);
      })
    );
  }

  /**
   * Busca metas por texto en la descripción
   */
  buscarPorTexto(texto: string): Observable<Meta[]> {
    const textoNormalizado = texto.toLowerCase().trim();
    return this.getMetas().pipe(
      map(metas => metas.filter(m =>
        m.descripcion.toLowerCase().includes(textoNormalizado)
      ))
    );
  }

  /**
   * Obtiene todas las metas que son hijas de un padre específico (por ID)
   */
  filtrarHijosPorPadreId(padreId: number): Observable<Meta[]> {
    return this.getJerarquias().pipe(
      map(jerarquias => {
        const hijosIds = jerarquias
          .filter(j => j.idPadre === padreId)
          .map(j => j.idHijo);
        return hijosIds;
      }),
      switchMap(hijosIds => {
        return this.getMetas().pipe(
          map(metas => metas.filter(m => hijosIds.includes(m.id)))
        );
      })
    );
  }

  /**
   * Obtiene todas las metas que son padres (tienen al menos un hijo)
   */
  obtenerMetasPadres(): Observable<Meta[]> {
    return this.getJerarquias().pipe(
      map(jerarquias => {
        const padresIds = [...new Set(jerarquias.map(j => j.idPadre))];
        return padresIds;
      }),
      switchMap(padresIds => {
        return this.getMetas().pipe(
          map(metas => metas.filter(m => padresIds.includes(m.id)))
        );
      })
    );
  }

  /**
   * Obtiene todas las metas que son hojas (no tienen hijos)
   */
  obtenerMetasHojas(): Observable<Meta[]> {
    return this.getJerarquias().pipe(
      map(jerarquias => {
        const padresIds = new Set(jerarquias.map(j => j.idPadre));
        return padresIds;
      }),
      switchMap(padresIds => {
        return this.getMetas().pipe(
          map(metas => metas.filter(m => !padresIds.has(m.id)))
        );
      })
    );
  }

  /**
   * Obtiene el camino jerárquico completo de una meta (desde la raíz hasta ella)
   */
  obtenerCaminoJerarquico(metaId: number): Observable<Meta[]> {
    return this.getJerarquias().pipe(
      switchMap(jerarquias => {
        const camino: number[] = [metaId];
        let actualId = metaId;

        // Recorrer hacia arriba en la jerarquía
        let encontrado = true;
        while (encontrado) {
          encontrado = false;
          const relacion = jerarquias.find(j => j.idHijo === actualId);
          if (relacion) {
            camino.unshift(relacion.idPadre);
            actualId = relacion.idPadre;
            encontrado = true;
          }
        }

        return this.getMetas().pipe(
          map(metas => metas.filter(m => camino.includes(m.id)))
        );
      })
    );
  }

  /**
   * Aplica filtros combinados a las metas
   */
  aplicarFiltrosCombinados(filtros: FiltrosMetas): Observable<Meta[]> {
    return this.getMetas().pipe(
      map(metas => {
        let resultado = metas;

        // Filtrar por niveles jerárquicos
        if (filtros.niveles && filtros.niveles.length > 0) {
          resultado = resultado.filter(m => filtros.niveles!.includes(m.nivelJerarquia));
        }

        // Filtrar por tipo
        if (filtros.tipo && filtros.tipo !== 'todos') {
          if (filtros.tipo === 'total') {
            resultado = resultado.filter(m => m.esTotal);
          } else if (filtros.tipo === 'subtotal') {
            resultado = resultado.filter(m => m.esSubtotal && !m.esTotal);
          } else {
            resultado = resultado.filter(m => !m.esTotal && !m.esSubtotal);
          }
        }

        // Filtrar por rango de porcentaje
        if (filtros.porcentajeMin !== undefined) {
          resultado = resultado.filter(m => m.porcentaje >= filtros.porcentajeMin!);
        }
        if (filtros.porcentajeMax !== undefined) {
          resultado = resultado.filter(m => m.porcentaje <= filtros.porcentajeMax!);
        }

        // Filtrar por búsqueda de texto
        if (filtros.textoBusqueda) {
          const textoNormalizado = filtros.textoBusqueda.toLowerCase().trim();
          resultado = resultado.filter(m =>
            m.descripcion.toLowerCase().includes(textoNormalizado)
          );
        }

        return resultado;
      })
    );
  }

  /**
   * Filtra formación por nivel según estrategia
   */
  filtrarFormacionPorModalidad(estrategia: 'regular' | 'campesena' | 'fullpopular'): Observable<FormacionPorNivel[]> {
    return this.getFormacionPorNivel().pipe(
      map(niveles => niveles.filter(nivel => {
        if (estrategia === 'regular') {
          return nivel.regularMeta !== null && nivel.regularMeta > 0;
        } else if (estrategia === 'campesena') {
          return nivel.campesenaMeta !== null && nivel.campesenaMeta > 0;
        } else {
          return nivel.fullPopularMeta !== null && nivel.fullPopularMeta > 0;
        }
      }))
    );
  }

  /**
   * Obtiene estadísticas de filtrado
   */
  obtenerEstadisticasFiltradas(filtros: FiltrosMetas): Observable<{
    total: number;
    totales: number;
    subtotales: number;
    detalles: number;
    promedioEjecucion: number;
    promedioCumplimiento: number;
  }> {
    return this.aplicarFiltrosCombinados(filtros).pipe(
      map(metas => {
        const total = metas.length;
        const totales = metas.filter(m => m.esTotal).length;
        const subtotales = metas.filter(m => m.esSubtotal && !m.esTotal).length;
        const detalles = metas.filter(m => !m.esTotal && !m.esSubtotal).length;

        const sumaEjecucion = metas.reduce((acc, m) => acc + m.ejecucion, 0);
        const sumaPorcentaje = metas.reduce((acc, m) => acc + m.porcentaje, 0);

        return {
          total,
          totales,
          subtotales,
          detalles,
          promedioEjecucion: total > 0 ? sumaEjecucion / total : 0,
          promedioCumplimiento: total > 0 ? sumaPorcentaje / total : 0
        };
      })
    );
  }
}
