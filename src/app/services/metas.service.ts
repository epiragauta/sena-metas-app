import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, switchMap, forkJoin } from 'rxjs';
import {
  Meta,
  FormacionPorNivel,
  ProgramaRelevante,
  RangoSemaforo,
  Jerarquia,
  DashboardData,
  Referencias,
  EstadoSemaforo,
  CategorizacionSemaforo,
  MetasPrimerCurso,
  FiltrosMetas
} from '../models/meta.model';
import { XlsbApiService } from './xlsb-api.service';

@Injectable({
  providedIn: 'root'
})
export class MetasService {
  private readonly basePath = 'assets/data';

  // Cache de datos
  private metasCache$?: Observable<Meta[]>;
  private dashboardCache$?: Observable<DashboardData>;
  private referenciasCache$?: Observable<Referencias>;

  constructor(
    private http: HttpClient,
    private xlsbApiService: XlsbApiService
  ) {}

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
   * Obtiene programas relevantes combinando estructura del JSON con datos de ejecución de la API
   */
  getProgramasRelevantesConAPI(): Observable<ProgramaRelevante[]> {
    return forkJoin({
      estructura: this.http.get<ProgramaRelevante[]>(`${this.basePath}/programas_relevantes.json`),
      ejecucionRegional: this.xlsbApiService.getEjecucionRegional()
    }).pipe(
      map(({ estructura, ejecucionRegional }) => {
        // Sumar datos de ejecución de todas las regionales
        const totales = {
          campesena: 0,      // TOT_FP_CAME
          fullPopular: 0,    // TOT_FP_FULL
          virtual: 0         // TOT_FP_VIRT
        };

        ejecucionRegional.forEach(regional => {
          totales.campesena += regional.TOT_FP_CAME || 0;
          totales.fullPopular += regional.TOT_FP_FULL || 0;
          totales.virtual += regional.TOT_FP_VIRT || 0;
        });

        // Actualizar cada programa con datos de la API
        return estructura.map(programa => {
          const programaActualizado = { ...programa };

          // Mapear según el ID
          switch (programa.id) {
            case 1:
              // Total Formación Profesional CampeSENA
              programaActualizado.ejecucion = totales.campesena;
              break;
            case 2:
              // Total Formación Profesional Full Popular
              programaActualizado.ejecucion = totales.fullPopular;
              break;
            case 3:
              // Total Formación Profesional Integral - Virtual
              programaActualizado.ejecucion = totales.virtual;
              break;
          }

          // Recalcular porcentaje
          if (programaActualizado.meta > 0) {
            programaActualizado.porcentaje = (programaActualizado.ejecucion / programaActualizado.meta) * 100;
          }

          return programaActualizado;
        });
      })
    );
  }

  /**
   * Obtiene primer curso desde referencias_totales.json (DEPRECATED)
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
   * Obtiene metas primer curso desde archivo JSON dedicado
   */
  getMetasPrimerCurso(): Observable<MetasPrimerCurso> {
    return this.http.get<MetasPrimerCurso>('../assets/metas_primer_curso.json');
  }

  /**
   * Obtiene rangos de semáforo
   */
  getRangosSemaforo(): Observable<RangoSemaforo[]> {
    return this.http.get<RangoSemaforo[]>(`${this.basePath}/rangos_semaforo.json`);
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
   * Obtiene formación por estrategia (desde JSON estático)
   */
  getFormacionPorEstrategia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}/formacion_por_estrategia.json`);
  }

  /**
   * Obtiene formación por estrategia combinando estructura del JSON con datos de ejecución de la API
   */
  getFormacionPorEstrategiaConAPI(): Observable<any[]> {
    return forkJoin({
      estructura: this.http.get<any[]>(`${this.basePath}/formacion_por_estrategia.json`),
      ejecucionRegional: this.xlsbApiService.getEjecucionRegional()
    }).pipe(
      map(({ estructura, ejecucionRegional }) => {
        // Sumar datos de ejecución de todas las regionales
        const totales = {
          campesenaEjecucion: 0,
          fullPopularEjecucion: 0
        };

        ejecucionRegional.forEach(regional => {
          totales.campesenaEjecucion += regional.COM_CAMPESE || 0;
          totales.fullPopularEjecucion += regional.COM_FULL_PO || 0;
        });

        // Calcular subtotales específicos de estrategias COMPLEMENTARIA
        const subTotales = {
          subComFCEC: 0,  // Estrategia Formación Continua Especial Campesina
          subComFCEF: 0   // Formación Continua Especial Popular
        };

        ejecucionRegional.forEach(regional => {
          subTotales.subComFCEC += regional.SUB_COM_FCEC || 0;
          subTotales.subComFCEF += regional.SUB_COM_FCEF || 0;
        });

        // Calcular totales de FORMACION TITULADA
        const totalesFormacionTitulada = {
          // AUXILIAR
          auxRegular: 0,
          auxCampese: 0,
          auxFullPo: 0,
          // OPERARIO
          opeRegular: 0,
          opeCampese: 0,
          opeFullPo: 0,
          // PROFUNDIZACIÓN TÉCNICA
          profTecnic: 0,
          // ARTICULACIÓN CON LA MEDIA TECNICA
          tcoArtMed: 0,
          // TÉCNICO
          tcoRegular: 0,  // TCO_REG_PRE + TCO_REG_VIR
          tcoCampese: 0,
          tcoFullPo: 0,
          // TECNÓLOGO
          tecRegular: 0,  // TEC_REG_PRE + TEC_REG_VIR + TEC_REG_A_D
          tecCampese: 0,
          tecFullPo: 0
        };

        ejecucionRegional.forEach(regional => {
          // AUXILIAR
          totalesFormacionTitulada.auxRegular += regional.AUX_REGULAR || 0;
          totalesFormacionTitulada.auxCampese += regional.AUX_CAMPESE || 0;
          totalesFormacionTitulada.auxFullPo += regional.AUX_FULL_PO || 0;
          // OPERARIO
          totalesFormacionTitulada.opeRegular += regional.OPE_REGULAR || 0;
          totalesFormacionTitulada.opeCampese += regional.OPE_CAMPESE || 0;
          totalesFormacionTitulada.opeFullPo += regional.OPE_FULL_PO || 0;
          // PROFUNDIZACIÓN TÉCNICA
          totalesFormacionTitulada.profTecnic += regional.PROF_TECNIC || 0;
          // ARTICULACIÓN CON LA MEDIA TECNICA
          totalesFormacionTitulada.tcoArtMed += regional.TCO_ART_MED || 0;
          // TÉCNICO (suma de dos campos)
          totalesFormacionTitulada.tcoRegular += (regional.TCO_REG_PRE || 0) + (regional.TCO_REG_VIR || 0);
          totalesFormacionTitulada.tcoCampese += regional.TCO_CAMPESE || 0;
          totalesFormacionTitulada.tcoFullPo += regional.TCO_FULL_PO || 0;
          // TECNÓLOGO (suma de tres campos)
          totalesFormacionTitulada.tecRegular += (regional.TEC_REG_PRE || 0) + (regional.TEC_REG_VIR || 0) + (regional.TEC_REG_A_D || 0);
          totalesFormacionTitulada.tecCampese += regional.TEC_CAMPESE || 0;
          totalesFormacionTitulada.tecFullPo += regional.TEC_FULL_PO || 0;
        });

        // Actualizar nodos con datos de la API
        return estructura.map(nodo => {
          const nodoActualizado = { ...nodo };
          const nivelNormalizado = nodo.nivelFormacion?.toUpperCase().trim() || '';

          // Verificar si el nodo es de FORMACION COMPLEMENTARIA o TITULADA
          const esFormacionComplementaria = nodo.id?.startsWith('1.2');
          const esFormacionTitulada = nodo.id?.startsWith('1.1');

          // FORMACION COMPLEMENTARIA
          if (esFormacionComplementaria) {
            // Actualizar ejecución de CampeSENA según el nivel específico
            if (nodo.campesenaMeta !== null && nodo.campesenaMeta !== undefined) {
              if (nivelNormalizado.includes('ESTRATEGIA FORMACION CONTINUA ESPECIAL CAMPESINA') ||
                  nivelNormalizado.includes('FEEC')) {
                nodoActualizado.campesenaEjecucion = subTotales.subComFCEC;
              } else {
                nodoActualizado.campesenaEjecucion = totales.campesenaEjecucion;
              }
            }

            // Actualizar ejecución de Full Popular según el nivel específico
            if (nodo.fullPopularMeta !== null && nodo.fullPopularMeta !== undefined) {
              if (nivelNormalizado.includes('FORMACION CONTINUA ESPECIAL POPULAR') ||
                  nivelNormalizado.includes('FEP')) {
                nodoActualizado.fullPopularEjecucion = subTotales.subComFCEF;
              } else {
                nodoActualizado.fullPopularEjecucion = totales.fullPopularEjecucion;
              }
            }
          }

          // FORMACION TITULADA
          if (esFormacionTitulada) {
            // AUXILIAR (1.1.1.1)
            if (nodo.id === '1.1.1.1') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.auxRegular;
              nodoActualizado.campesenaEjecucion = totalesFormacionTitulada.auxCampese;
              nodoActualizado.fullPopularEjecucion = totalesFormacionTitulada.auxFullPo;
            }
            // OPERARIO (1.1.1.2)
            else if (nodo.id === '1.1.1.2') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.opeRegular;
              nodoActualizado.campesenaEjecucion = totalesFormacionTitulada.opeCampese;
              nodoActualizado.fullPopularEjecucion = totalesFormacionTitulada.opeFullPo;
            }
            // PROFUNDIZACIÓN TÉCNICA (1.1.1.3)
            else if (nodo.id === '1.1.1.3') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.profTecnic;
            }
            // ARTICULACIÓN CON LA MEDIA TECNICA (1.1.1.4)
            else if (nodo.id === '1.1.1.4') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.tcoArtMed;
            }
            // TÉCNICO (1.1.1.5)
            else if (nodo.id === '1.1.1.5') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.tcoRegular;
              nodoActualizado.campesenaEjecucion = totalesFormacionTitulada.tcoCampese;
              nodoActualizado.fullPopularEjecucion = totalesFormacionTitulada.tcoFullPo;
            }
            // TECNÓLOGO (1.1.2.1)
            else if (nodo.id === '1.1.2.1') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.tecRegular;
              nodoActualizado.campesenaEjecucion = totalesFormacionTitulada.tecCampese;
              nodoActualizado.fullPopularEjecucion = totalesFormacionTitulada.tecFullPo;
            }
            // TOTAL FORMACION LABORAL (1.1.1) = suma de todos los niveles laborales
            else if (nodo.id === '1.1.1') {
              nodoActualizado.regularEjecucion =
                totalesFormacionTitulada.auxRegular +
                totalesFormacionTitulada.opeRegular +
                totalesFormacionTitulada.profTecnic +
                totalesFormacionTitulada.tcoArtMed +
                totalesFormacionTitulada.tcoRegular;
              nodoActualizado.campesenaEjecucion =
                totalesFormacionTitulada.auxCampese +
                totalesFormacionTitulada.opeCampese +
                totalesFormacionTitulada.tcoCampese;
              nodoActualizado.fullPopularEjecucion =
                totalesFormacionTitulada.auxFullPo +
                totalesFormacionTitulada.opeFullPo +
                totalesFormacionTitulada.tcoFullPo;
            }
            // TOTAL FORMACION EDUCACION SUPERIOR (1.1.2) = solo tecnólogo
            else if (nodo.id === '1.1.2') {
              nodoActualizado.regularEjecucion = totalesFormacionTitulada.tecRegular;
              nodoActualizado.campesenaEjecucion = totalesFormacionTitulada.tecCampese;
              nodoActualizado.fullPopularEjecucion = totalesFormacionTitulada.tecFullPo;
            }
            // TOTAL FORMACION TITULADA (1.1) = suma de formación laboral + educación superior
            else if (nodo.id === '1.1') {
              const totalLaboral = {
                regular: totalesFormacionTitulada.auxRegular + totalesFormacionTitulada.opeRegular +
                         totalesFormacionTitulada.profTecnic + totalesFormacionTitulada.tcoArtMed +
                         totalesFormacionTitulada.tcoRegular,
                campese: totalesFormacionTitulada.auxCampese + totalesFormacionTitulada.opeCampese +
                         totalesFormacionTitulada.tcoCampese,
                fullPo: totalesFormacionTitulada.auxFullPo + totalesFormacionTitulada.opeFullPo +
                        totalesFormacionTitulada.tcoFullPo
              };
              nodoActualizado.regularEjecucion = totalLaboral.regular + totalesFormacionTitulada.tecRegular;
              nodoActualizado.campesenaEjecucion = totalLaboral.campese + totalesFormacionTitulada.tecCampese;
              nodoActualizado.fullPopularEjecucion = totalLaboral.fullPo + totalesFormacionTitulada.tecFullPo;
            }
          }

          return nodoActualizado;
        });
      })
    );
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
   * Obtiene metas de poblaciones vulnerables combinando estructura del JSON con datos de ejecución de la API
   */
  getMetasPoblacionesVulnerablesConAPI(): Observable<Meta[]> {
    return forkJoin({
      estructura: this.http.get<Meta[]>(`${this.basePath}/metas_poblaciones_vulnerables.json`),
      ejecucionPoblaciones: this.xlsbApiService.getEjecucionPoblacionesVulnerables()
    }).pipe(
      map(({ estructura, ejecucionPoblaciones }) => {
        // Sumar datos de ejecución de todas las regionales
        const totales = {
          desplazados: 0,           // DESPLAZADOS
          hechosVictimizantes: 0,   // HECHOS_VICT
          totalVictimas: 0,         // TO_VICTIMAS
          conDiscapacidad: 0,       // CON_DISCAPA
          indigenas: 0,             // INDIGENAS
          inpec: 0,                 // INPEC
          jovenVulnerable: 0,       // JOVEN_VULNE
          adolescenteLeyPenal: 0,   // ADO_LEY_PEN
          mujerCabezaHogar: 0,      // MUJER_CA_HO
          negros: 0,                // NEGROS
          afrocolombianos: 0,       // AFROCOLOMBI
          raizales: 0,              // RAIZALES
          palenqueros: 0,           // PALENQUEROS
          procesoReintegracion: 0,  // PR_RE_AD_DE
          terceraEdad: 0,           // TERCERA_EDA
          adolescenteTrabajador: 0, // ADO_TRABAJA
          rom: 0,                   // ROM
          otrasVulnerables: 0,      // OTRAS_VULNE
          totalVulnerables: 0       // TO_VULNERAB
        };

        ejecucionPoblaciones.forEach(regional => {
          totales.desplazados += regional.DESPLAZADOS || 0;
          totales.hechosVictimizantes += regional.HECHOS_VICT || 0;
          totales.totalVictimas += regional.TO_VICTIMAS || 0;
          totales.conDiscapacidad += regional.CON_DISCAPA || 0;
          totales.indigenas += regional.INDIGENAS || 0;
          totales.inpec += regional.INPEC || 0;
          totales.jovenVulnerable += regional.JOVEN_VULNE || 0;
          totales.adolescenteLeyPenal += regional.ADO_LEY_PEN || 0;
          totales.mujerCabezaHogar += regional.MUJER_CA_HO || 0;
          totales.negros += regional.NEGROS || 0;
          totales.afrocolombianos += regional.AFROCOLOMBI || 0;
          totales.raizales += regional.RAIZALES || 0;
          totales.palenqueros += regional.PALENQUEROS || 0;
          totales.procesoReintegracion += regional.PR_RE_AD_DE || 0;
          totales.terceraEdad += regional.TERCERA_EDA || 0;
          totales.adolescenteTrabajador += regional.ADO_TRABAJA || 0;
          totales.rom += regional.ROM || 0;
          totales.otrasVulnerables += regional.OTRAS_VULNE || 0;
          totales.totalVulnerables += regional.TO_VULNERAB || 0;
        });

        // Actualizar nodos con datos de la API
        return estructura.map(nodo => {
          const nodoActualizado = { ...nodo };
          const idStr = String(nodo.id);

          // Mapear según el ID del nodo
          switch (idStr) {
            case '1':
              // TOTAL POBLACIONES VULNERABLES
              nodoActualizado.ejecucion = totales.totalVulnerables;
              break;
            case '1.1':
              // TOTAL VICTIMAS
              nodoActualizado.ejecucion = totales.totalVictimas;
              break;
            case '1.1.1':
              // DESPLAZADOS POR LA VIOLENCIA
              nodoActualizado.ejecucion = totales.desplazados;
              break;
            case '1.1.2':
              // HECHOS VICTIMIZANTES
              nodoActualizado.ejecucion = totales.hechosVictimizantes;
              break;
            case '1.2':
              // OTRAS POBLACIONES VULNERABLES
              nodoActualizado.ejecucion = totales.otrasVulnerables;
              break;
            case '1.2.1':
              // Personas en condición de Discapacidad
              nodoActualizado.ejecucion = totales.conDiscapacidad;
              break;
            case '1.2.2':
              // Indígenas
              nodoActualizado.ejecucion = totales.indigenas;
              break;
            case '1.2.3':
              // INPEC
              nodoActualizado.ejecucion = totales.inpec;
              break;
            case '1.2.4':
              // Jóvenes Vulnerables
              nodoActualizado.ejecucion = totales.jovenVulnerable;
              break;
            case '1.2.5':
              // Adolescente en Conflicto con la Ley Penal
              nodoActualizado.ejecucion = totales.adolescenteLeyPenal;
              break;
            case '1.2.6':
              // Mujer Cabeza de Hogar
              nodoActualizado.ejecucion = totales.mujerCabezaHogar;
              break;
            case '1.2.7':
              // Negritudes (Negros)
              nodoActualizado.ejecucion = totales.negros;
              break;
            case '1.2.8':
              // Afrocolombianos
              nodoActualizado.ejecucion = totales.afrocolombianos;
              break;
            case '1.2.9':
              // Raizales
              nodoActualizado.ejecucion = totales.raizales;
              break;
            case '1.2.10':
              // Palenqueros
              nodoActualizado.ejecucion = totales.palenqueros;
              break;
            case '1.2.11':
              // Proceso de Reintegración y Adolescentes desvinculados
              nodoActualizado.ejecucion = totales.procesoReintegracion;
              break;
            case '1.2.12':
              // Tercera Edad
              nodoActualizado.ejecucion = totales.terceraEdad;
              break;
            case '1.2.13':
              // Adolescente Trabajador
              nodoActualizado.ejecucion = totales.adolescenteTrabajador;
              break;
            case '1.2.14':
              // Rom
              nodoActualizado.ejecucion = totales.rom;
              break;
          }

          return nodoActualizado;
        });
      })
    );
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
   * Obtiene metas de emprendimiento y fortalecimiento (Tabla 11)
   */
  getMetasEmprendimiento(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_emprendimiento.json`);
  }

  /**
   * Obtiene metas del fondo emprender (Tabla 12)
   */
  getMetasFondoEmprender(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_fondo_emprender.json`);
  }

  /**
   * Obtiene metas de contratos de aprendizaje (Tabla 13)
   */
  getMetasContratosAprendizaje(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_contratos_aprendizaje.json`);
  }

  /**
   * Obtiene metas de internacionalización (Tabla 14)
   */
  getMetasInternacionalizacion(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_internacionalizacion.json`);
  }

  /**
   * Obtiene metas de cupos autorizados FIC (Tabla 15)
   */
  getMetasCuposFIC(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_cupos_fic.json`);
  }

  /**
   * Obtiene metas de cupos autorizados FIC combinando estructura del JSON con datos de ejecución de la API
   */
  getMetasCuposFICConAPI(): Observable<Meta[]> {
    return forkJoin({
      estructura: this.http.get<Meta[]>(`${this.basePath}/metas_cupos_fic.json`),
      ejecucionFIC: this.xlsbApiService.getEjecucionFIC()
    }).pipe(
      map(({ estructura, ejecucionFIC }) => {
        // Sumar datos de ejecución de todos los centros
        const totales = {
          tecnologos: 0,
          operarios: 0,
          tecnicoLaboral: 0,
          formacionTitulada: 0,
          formacionComplementaria: 0,
          totalFPI: 0
        };

        ejecucionFIC.forEach(centro => {
          totales.tecnologos += centro.TECNOLOGOS || 0;
          totales.operarios += centro.SUB_TOT_OPE || 0;
          totales.tecnicoLaboral += centro.SUB_TCO_LAB || 0;
          totales.formacionTitulada += centro.TOT_FOR_TIT || 0;
          totales.formacionComplementaria += centro.TOT_COMPLEM || 0;
          totales.totalFPI += centro.TOT_PROF_IN || 0;
        });

        // Actualizar nodos con datos de la API
        return estructura.map(nodo => {
          const nodoActualizado = { ...nodo };
          const idStr = String(nodo.id);

          // Mapear según el ID del nodo
          switch (idStr) {
            case '1':
              // TOTAL FORMACION PROFESIONAL INTEGRAL FIC
              nodoActualizado.ejecucion = totales.totalFPI;
              break;
            case '1.1':
              // FORMACION TITULADA FIC
              nodoActualizado.ejecucion = totales.formacionTitulada;
              break;
            case '1.1.1':
              // TECNOLOGOS FIC
              nodoActualizado.ejecucion = totales.tecnologos;
              break;
            case '1.1.2':
              // OPERARIOS FIC
              nodoActualizado.ejecucion = totales.operarios;
              break;
            case '1.1.3':
              // TECNICO LABORAL FIC
              nodoActualizado.ejecucion = totales.tecnicoLaboral;
              break;
            case '1.2':
              // FORMACION COMPLEMENTARIA FIC
              nodoActualizado.ejecucion = totales.formacionComplementaria;
              break;
          }

          return nodoActualizado;
        });
      })
    );
  }

  /**
   * Obtiene jerarquías de cupos FIC
   */
  getJerarquiasCuposFIC(): Observable<Jerarquia[]> {
    return this.http.get<Jerarquia[]>(`${this.basePath}/jerarquias_cupos_fic.json`);
  }

  /**
   * Obtiene metas completas de CampeSENA (Tabla 16)
   */
  getMetasCampesenaCompleto(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_campesena_completo.json`);
  }

  /**
   * Obtiene metas completas de Full Popular (Tabla 17)
   */
  getMetasFullPopularCompleto(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_full_popular_completo.json`);
  }

  /**
   * Obtiene metas completas de Full Popular combinando estructura del JSON con datos de ejecución de la API
   */
  getMetasFullPopularCompletoConAPI(): Observable<Meta[]> {
    return forkJoin({
      estructura: this.http.get<Meta[]>(`${this.basePath}/metas_full_popular_completo.json`),
      ejecucionRegional: this.xlsbApiService.getEjecucionRegional()
    }).pipe(
      map(({ estructura, ejecucionRegional }) => {
        // Sumar datos de ejecución de todas las regionales
        const totales = {
          totalFullPopular: 0,     // TOT_FP_FULL
          tecnologos: 0,            // TEC_FULL_PO
          operarios: 0,             // OPE_FULL_PO
          auxiliares: 0,            // AUX_FULL_PO
          tecnicoLaboral: 0,        // TCO_FULL_PO
          complementaria: 0,        // COM_FULL_PO
          retencion: 0,             // R_FULL
          certificacion: 0          // C_FULL
        };

        ejecucionRegional.forEach(regional => {
          totales.totalFullPopular += regional.TOT_FP_FULL || 0;
          totales.tecnologos += regional.TEC_FULL_PO || 0;
          totales.operarios += regional.OPE_FULL_PO || 0;
          totales.auxiliares += regional.AUX_FULL_PO || 0;
          totales.tecnicoLaboral += regional.TCO_FULL_PO || 0;
          totales.complementaria += regional.COM_FULL_PO || 0;
          totales.retencion += regional.R_FULL || 0;
          totales.certificacion += regional.C_FULL || 0;
        });

        // Actualizar nodos con datos de la API
        return estructura.map(nodo => {
          const nodoActualizado = { ...nodo };
          const idStr = String(nodo.id);

          // Mapear según el ID del nodo
          switch (idStr) {
            case '1':
              // Total Formación Profesional Full Popular
              nodoActualizado.ejecucion = totales.totalFullPopular;
              break;
            case '1.1':
              // Tecnólogos Full Popular
              nodoActualizado.ejecucion = totales.tecnologos;
              break;
            case '1.2':
              // Operarios Full Popular
              nodoActualizado.ejecucion = totales.operarios;
              break;
            case '1.3':
              // Auxiliares Full Popular
              nodoActualizado.ejecucion = totales.auxiliares;
              break;
            case '1.4':
              // Técnico Laboral Full Popular
              nodoActualizado.ejecucion = totales.tecnicoLaboral;
              break;
            case '1.5':
              // Formación Complementaria Full Popular
              nodoActualizado.ejecucion = totales.complementaria;
              break;
            case '4':
              // Retención - Full Popular (es tasa, se maneja como porcentaje)
              nodoActualizado.ejecucion = totales.retencion;
              break;
            case '2':
              // Certificación - Full Popular
              nodoActualizado.ejecucion = totales.certificacion;
              break;
            // case '3': Certificaciones de competencia laboral - NO disponible en API, mantener del JSON
          }

          // Recalcular porcentaje solo si no es tasa
          if (!nodoActualizado.esTasa && nodoActualizado.meta > 0) {
            nodoActualizado.porcentaje = (nodoActualizado.ejecucion / nodoActualizado.meta) * 100;
          }

          return nodoActualizado;
        });
      })
    );
  }

  /**
   * Obtiene metas de FEEC (Tabla 18)
   */
  getMetasFEEC(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.basePath}/metas_feec.json`);
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
