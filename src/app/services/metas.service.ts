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
  CategorizacionSemaforo
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
}
