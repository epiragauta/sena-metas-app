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
      return 'bueno';
    } else if (porcentaje > rangos.sobreejecucionSuperiorA) {
      return 'sobreejecucion';
    } else {
      return 'excelente';
    }
  }

  /**
   * Obtiene el color asociado a una categoría de semáforo
   */
  getColorSemaforo(categoria: EstadoSemaforo): string {
    const colores = {
      bajo: '#F44336',
      vulnerable: '#FF9800',
      bueno: '#8BC34A',
      excelente: '#4CAF50',
      sobreejecucion: '#2196F3'
    };
    return colores[categoria];
  }

  /**
   * Obtiene la clase CSS asociada a un porcentaje
   */
  getClasePorcentaje(porcentaje: number): string {
    if (porcentaje >= 90) return 'success';
    if (porcentaje >= 70) return 'warning';
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
   * Filtra formación por nivel según modalidad
   */
  filtrarFormacionPorModalidad(modalidad: 'regular' | 'campesena' | 'fullpopular'): Observable<FormacionPorNivel[]> {
    return this.getFormacionPorNivel().pipe(
      map(niveles => niveles.filter(nivel => {
        if (modalidad === 'regular') {
          return nivel.regularMeta !== null && nivel.regularMeta > 0;
        } else if (modalidad === 'campesena') {
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
