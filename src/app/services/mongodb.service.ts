import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

export interface FPINode {
    id: string;
    descripcion: string;
    meta: number;
    ejecucion: number;
    porcentaje: number;
    children?: FPINode[];
    isCollapsed?: boolean;
    level?: number;
}

export interface EjecucionRegional {
    Orden: number;
    PERIODO: number;
    COD_REGIONAL: number;
    REGIONAL: string;
    [key: string]: any;
}

export interface MongoDBResponse {
    collection_name: string;
    total_records: number;
    returned_records: number;
    offset: number;
    limit: any;
    data: EjecucionRegional[];
}

@Injectable({
    providedIn: 'root'
})
export class MongoDBService {
    private readonly mongoURL = 'https://sena-metas-procesador.vercel.app/mongodb/collections/ejecucion_fpi_regional';
    private arbolFPICache$?: Observable<FPINode>;

    // MAPEO EXACTO: campos MongoDB → IDs de jerarquía
    private readonly camposMongoDBMapping: { [mongoField: string]: string } = {
        // Nivel 5 - Detalle
        'TEC_REG_PRE': '1.1.1.1.1',
        'TEC_REG_VIR': '1.1.1.1.2',
        'TEC_REG_A_D': '1.1.1.1.3',
        'TEC_CAMPESE': '1.1.1.1.4',
        'TEC_FULL_PO': '1.1.1.1.5',
        'OPE_REGULAR': '1.1.2.1.1',
        'OPE_CAMPESE': '1.1.2.1.2',
        'OPE_FULL_PO': '1.1.2.1.3',
        'AUX_REGULAR': '1.1.2.2.1',
        'AUX_CAMPESE': '1.1.2.2.2',
        'AUX_FULL_PO': '1.1.2.2.3',
        'TCO_REG_PRE': '1.1.2.3.1',
        'TCO_REG_VIR': '1.1.2.3.2',
        'TCO_CAMPESE': '1.1.2.3.3',
        'TCO_FULL_PO': '1.1.2.3.4',
        'TCO_ART_MED': '1.1.2.3.5',
        'PROF_TECNIC': '1.1.2.4',
        'COM_VIR_SBI': '1.2.1',
        'COM_PRE_SBI': '1.2.2',
        'COM_BIL_VIR': '1.2.3.1',
        'COM_BIL_PRE': '1.2.3.2',
        'COM_CAMPESE': '1.2.4',
        'COM_FULL_PO': '1.2.5',
        // Nivel 4 - Subtotales (ya sumados en MongoDB)
        'TECNOLOGOS': '1.1.1.1',
        'EDU_SUPERIO': '1.1.1',
        'SUB_TOT_OPE': '1.1.2.1',
        'SUB_TOT_AUX': '1.1.2.2',
        'SUB_TCO_LAB': '1.1.2.3',
        'SUB_PRO_BIN': '1.2.3',
        // Nivel 3+ - Totales
        'TOT_FOR_LAB': '1.1.2',
        'TOT_FOR_TIT': '1.1',
        'TOT_COMPLEM': '1.2',
        'TOT_PROF_IN': '1'
    };

    // METAS Y DESCRIPCIONES - EXACTAS DEL JSON
    private readonly datosEstructura: { [id: string]: { descripcion: string; meta: number } } = {
        '1.1.1.1.1': { descripcion: 'Tecnólogos Regular - Presencial', meta: 277973 },
        '1.1.1.1.2': { descripcion: 'Tecnólogos Regular - Virtual', meta: 165919 },
        '1.1.1.1.3': { descripcion: 'Tecnólogos Regular - A Distancia', meta: 14650 },
        '1.1.1.1.4': { descripcion: 'Tecnólogos CampeSENA', meta: 2399 },
        '1.1.1.1.5': { descripcion: 'Tecnólogos Full Popular', meta: 678 },
        '1.1.1.1': { descripcion: 'SubTotal Tecnólogos ( E)', meta: 461619 },
        '1.1.1': { descripcion: 'EDUCACION SUPERIOR (=E)', meta: 461619 },
        '1.1.2.1.1': { descripcion: 'Operarios Regular', meta: 18889 },
        '1.1.2.1.2': { descripcion: 'Operarios CampeSENA', meta: 1920 },
        '1.1.2.1.3': { descripcion: 'Operarios Full Popular', meta: 1504 },
        '1.1.2.1': { descripcion: 'SubTotal Operarios (B)', meta: 22313 },
        '1.1.2.2.1': { descripcion: 'Auxiliares Regular', meta: 7067 },
        '1.1.2.2.2': { descripcion: 'Auxiliares CampeSENA', meta: 945 },
        '1.1.2.2.3': { descripcion: 'Auxiliares Full Popular', meta: 1091 },
        '1.1.2.2': { descripcion: 'SubTotal Auxiliares (A)', meta: 9103 },
        '1.1.2.3.1': { descripcion: 'Técnico Laboral Regular - Presencial', meta: 260961 },
        '1.1.2.3.2': { descripcion: 'Técnico Laboral Regular - Virtual', meta: 57855 },
        '1.1.2.3.3': { descripcion: 'Técnico Laboral CampeSENA', meta: 24795 },
        '1.1.2.3.4': { descripcion: 'Técnico Laboral Full Popular', meta: 3881 },
        '1.1.2.3.5': { descripcion: 'Técnico Laboral Articulación con la Media', meta: 475067 },
        '1.1.2.3': { descripcion: 'SubTotal Técnico Laboral (C)', meta: 822559 },
        '1.1.2.4': { descripcion: 'Profundización Técnica (T)', meta: 1320 },
        '1.1.2': { descripcion: 'TOTAL FORMACIÓN LABORAL (D=A+B+C+T)', meta: 855295 },
        '1.1': { descripcion: 'TOTAL FORMACION TITULADA (F = D+E)', meta: 1316914 },
        '1.2.1': { descripcion: 'Formación Complementaria - Virtual  (Sin Bilingüismo) (G)', meta: 2420160 },
        '1.2.2': { descripcion: 'Formación Complementaria - Presencial (Sin Bilingüismo) (H)', meta: 2864984 },
        '1.2.3.1': { descripcion: 'Programa de Bilingüismo - Virtual (I)', meta: 917760 },
        '1.2.3.2': { descripcion: 'Programa de Bilingüismo - Presencial (J)', meta: 111822 },
        '1.2.3': { descripcion: 'SubTotal Programa de Bilinguïsmo (K = I + J)', meta: 1029582 },
        '1.2.4': { descripcion: 'Formación Complementaria CampeSENA (L)', meta: 619134 },
        '1.2.5': { descripcion: 'Formación Complementaria Full Popular (M)', meta: 94200 },
        '1.2': { descripcion: 'TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)', meta: 7028060 },
        '1': { descripcion: 'TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)', meta: 8344974 }
    };

    constructor(private http: HttpClient) { }

    private getEjecucionesRegionales(): Observable<EjecucionRegional[]> {
        return this.http.get<MongoDBResponse>(this.mongoURL).pipe(
            map(response => response.data),
            catchError(error => {
                console.error('Error al consumir MongoDB:', error);
                return of([]);
            }),
            shareReplay(1)
        );
    }

    private sumarizarCampo(datos: EjecucionRegional[], campo: string): number {
        return datos.reduce((suma, regional) => {
            const valor = regional[campo];
            return suma + (typeof valor === 'number' ? valor : 0);
        }, 0);
    }

    private promediarCampo(datos: EjecucionRegional[], campo: string): number {
        if (datos.length === 0) return 0;
        const suma = datos.reduce((total, regional) => {
            const valor = regional[campo];
            return total + (typeof valor === 'number' ? valor : 0);
        }, 0);
        // (suma / cantidad de regionales) * 100 = porcentaje, redondeado a 2 decimales
        const porcentaje = (suma / datos.length) * 100;
        return Math.round(porcentaje * 100) / 100;
    }

    private redondear(valor: number, decimales: number = 2): number {
        const factor = Math.pow(10, decimales);
        return Math.round(valor * factor) / factor;
    }

    public getArbolFPIConEjecuciones(): Observable<FPINode> {
        if (!this.arbolFPICache$) {
            this.arbolFPICache$ = this.getEjecucionesRegionales().pipe(
                map(datos => {
                    // Crear datos para el árbol
                    const datosParaArbol = this.construirDatosParaArbol(datos);

                    // Usar buildHierarchyTree
                    const arbol = this.buildHierarchyTree(datosParaArbol);

                    return arbol.length > 0 ? arbol[0] : this.nodoVacio();
                }),
                catchError(error => {
                    console.error('Error al construir árbol FPI:', error);
                    return of(this.nodoVacio());
                }),
                shareReplay(1)
            );
        }

        return this.arbolFPICache$;
    }

    private construirDatosParaArbol(datos: EjecucionRegional[]): any[] {
        const resultado: any[] = [];

        // Para cada ID en la estructura
        for (const [id, info] of Object.entries(this.datosEstructura)) {
            let ejecucion = 0;

            // Buscar campo MongoDB que corresponda a este ID
            for (const [mongoField, idMapeado] of Object.entries(this.camposMongoDBMapping)) {
                if (idMapeado === id) {
                    // Sumar el campo MongoDB
                    ejecucion = this.sumarizarCampo(datos, mongoField);
                    break;
                }
            }

            resultado.push({
                id: id,
                descripcion: info.descripcion,
                meta: info.meta,
                ejecucion: this.redondear(ejecucion, 2)
            });
        }

        return resultado;
    }

    private buildHierarchyTree(data: any[]): FPINode[] {
        const nodesMap = new Map<string, FPINode>();

        // Crear nodos
        data.forEach(item => {
            const porcentaje = (item.meta > 0) ? (item.ejecucion / item.meta) * 100 : 0;
            nodesMap.set(item.id, {
                id: item.id,
                descripcion: item.descripcion,
                meta: item.meta,
                ejecucion: item.ejecucion,
                porcentaje: porcentaje,
                children: [],
                isCollapsed: true,
                level: 0
            });
        });

        // Construir jerarquía basada en IDs
        const rootNodes: FPINode[] = [];
        nodesMap.forEach((node, id) => {
            const parts = id.split('.');

            if (parts.length === 1) {
                rootNodes.push(node);
            } else {
                const parentId = parts.slice(0, -1).join('.');
                const parent = nodesMap.get(parentId);
                if (parent) {
                    parent.children!.push(node);
                }
            }
        });

        // Asignar niveles
        rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

        return rootNodes;
    }

    private assignHierarchyLevel(node: FPINode, level: number): void {
        node.level = level;
        if (node.children) {
            node.children.forEach(child => this.assignHierarchyLevel(child, level + 1));
        }
    }

    private nodoVacio(): FPINode {
        return {
            id: '1',
            descripcion: 'TOTAL FORMACION PROFESIONAL INTEGRAL',
            meta: 0,
            ejecucion: 0,
            porcentaje: 0,
            children: [],
            isCollapsed: true,
            level: 0
        };
    }

    public getEjecucionesRegionalesData(): Observable<EjecucionRegional[]> {
        return this.getEjecucionesRegionales();
    }

    // ==================== RETENCIÓN ====================

    private arbolRetencionCache$?: Observable<FPINode>;

    private readonly datosRetencion: { [id: string]: { descripcion: string; meta: number } } = {
        '1': { descripcion: 'TOTAL FORMACIÓN LABORAL', meta: 85.05 },
        '1.1': { descripcion: 'FORMACIÓN LABORAL - Presencial', meta: 89.18 },
        '1.2': { descripcion: 'FORMACIÓN LABORAL - Virtual', meta: 78.96 },
        '2': { descripcion: 'TOTAL EDUCACION SUPERIOR', meta: 84.58 },
        '2.1': { descripcion: 'EDUCACION SUPERIOR - Presencial', meta: 87.42 },
        '2.2': { descripcion: 'EDUCACION SUPERIOR - Virtual', meta: 80.64 },
        '3': { descripcion: 'TOTAL TITULADA', meta: 84.01 },
        '3.1': { descripcion: 'TOTAL TITULADA - Presencial', meta: 88.30 },
        '3.2': { descripcion: 'TOTAL TITULADA - Virtual', meta: 78.53 },
        '4': { descripcion: 'TOTAL COMPLEMENTARIA', meta: 55.21 },
        '4.1': { descripcion: 'COMPLEMENTARIA - Presencial', meta: 83.48 },
        '4.2': { descripcion: 'COMPLEMENTARIA - Virtual', meta: 26.94 },
        '5': { descripcion: 'TOTAL FORMACIÓN PROFESIONAL', meta: 67.72 },
        '5.1': { descripcion: 'TOTAL FORMACIÓN PROFESIONAL - Presencial', meta: 85.89 },
        '5.2': { descripcion: 'TOTAL FORMACIÓN PROFESIONAL - Virtual', meta: 49.55 },
        '6': { descripcion: 'PROGRAMA DE BILINGÜISMO', meta: 52.67 },
        '6.1': { descripcion: 'PROGRAMA DE BILINGÜISMO - Presencial', meta: 81.41 },
        '6.2': { descripcion: 'PROGRAMA DE BILINGÜISMO - Virtual', meta: 31.78 },
        '7': { descripcion: 'CampeSENA', meta: 89.36 },
        '8': { descripcion: 'Full Popular', meta: 61.01 }
    };

    private readonly camposMongoDBRetencion: { [mongoField: string]: string } = {
        'R_FOR_LAB_P': '1.1',
        'R_FOR_LAB_V': '1.2',
        'R_FOR_LABOR': '1',
        'R_EDU_SUP_P': '2.1',
        'R_EDU_SUP_V': '2.2',
        'R_TOT_E_SUP': '2',
        'R_TOT_TIT_P': '3.1',
        'R_TOT_TIT_V': '3.2',
        'R_TOT_TITUL': '3',
        'R_COMPLEM_P': '4.1',
        'R_COMPLEM_V': '4.2',
        'R_COMPLEM_T': '4',
        'R_FRM_PRO_P': '5.1',
        'R_FRM_PRO_V': '5.2',
        'R_FRM_PRO_T': '5',
        'R_PRG_BIL_P': '6.1',
        'R_PRG_BIL_V': '6.2',
        'R_PRG_BIL_T': '6',
        'R_CAMPESENA': '7',
        'R_FULL': '8'
    };

    public getArbolRetencionConEjecuciones(): Observable<FPINode> {
        if (!this.arbolRetencionCache$) {
            this.arbolRetencionCache$ = this.getEjecucionesRegionales().pipe(
                map(datos => {
                    const datosParaArbol = this.construirDatosRetencion(datos);
                    const arbol = this.buildHierarchyTree(datosParaArbol);
                    return arbol.length > 0 ? this.encontrarRaizRetencion(arbol) : this.nodoVacio();
                }),
                catchError(error => {
                    console.error('Error al construir árbol Retención:', error);
                    return of(this.nodoVacio());
                }),
                shareReplay(1)
            );
        }

        return this.arbolRetencionCache$;
    }

    private construirDatosRetencion(datos: EjecucionRegional[]): any[] {
        const resultado: any[] = [];

        for (const [id, info] of Object.entries(this.datosRetencion)) {
            let ejecucion = 0;

            for (const [mongoField, idMapeado] of Object.entries(this.camposMongoDBRetencion)) {
                if (idMapeado === id) {
                    // Retención son tasas/porcentajes, se promedian
                    ejecucion = this.promediarCampo(datos, mongoField);
                    break;
                }
            }

            resultado.push({
                id: id,
                descripcion: info.descripcion,
                meta: info.meta,
                ejecucion: this.redondear(ejecucion, 2)
            });
        }

        return resultado;
    }

    private encontrarRaizRetencion(arbol: FPINode[]): FPINode {
        // Retención tiene múltiples raíces (1, 2, 3, 4, 5, 6, 7, 8)
        // Retornamos un nodo contenedor artificial
        const contenedor: FPINode = {
            id: '0',
            descripcion: 'RETENCIÓN',
            meta: 0,
            ejecucion: 0,
            porcentaje: 0,
            children: arbol,
            isCollapsed: true,
            level: 0
        };
        return contenedor;
    }

    // ==================== CERTIFICACIÓN ====================

    private arbolCertificacionCache$?: Observable<FPINode>;

    private readonly datosCertificacion: { [id: string]: { descripcion: string; meta: number } } = {
        '1': { descripcion: 'TOTAL FORMACIÓN PROFESIONAL INTEGRAL', meta: 3866963 },
        '1.1': { descripcion: 'TOTAL FORMACIÓN COMPLEMENTARIA', meta: 3420411 },
        '1.2': { descripcion: 'TOTAL FORMACIÓN TITULADA', meta: 446552 },
        '1.2.1': { descripcion: 'EDUCACIÓN SUPERIOR', meta: 94127 },
        '1.2.2': { descripcion: 'FORMACIÓN LABORAL', meta: 352425 },
        '2': { descripcion: 'ARTICULACION CON LA MEDIA - (Incluidas en Formación laboral)', meta: 184643 },
        '3': { descripcion: 'CampeSENA - (Incluidas en Formación Profesional Integral)', meta: 481818 },
        '4': { descripcion: 'Full Popular - (Incluidas en Formación Profesional Integral)', meta: 54421 }
    };

    private readonly camposMongoDBCertificacion: { [mongoField: string]: string } = {
        'C_FORMA_LAB': '1.2.2',
        'C_EDU_SUPER': '1.2.1',
        'C_FRM_TITUL': '1.2',
        'C_FRM_COMP': '1.1',
        'C_FRM_PR_IN': '1',
        'C_TCO_ARMED': '2',
        'C_CAMPESENA': '3',
        'C_FULL': '4'
    };

    public getArbolCertificacionConEjecuciones(): Observable<FPINode> {
        if (!this.arbolCertificacionCache$) {
            this.arbolCertificacionCache$ = this.getEjecucionesRegionales().pipe(
                map(datos => {
                    const datosParaArbol = this.construirDatosCertificacion(datos);
                    const arbol = this.buildHierarchyTree(datosParaArbol);
                    return arbol.length > 0 ? arbol[0] : this.nodoVacio();
                }),
                catchError(error => {
                    console.error('Error al construir árbol Certificación:', error);
                    return of(this.nodoVacio());
                }),
                shareReplay(1)
            );
        }

        return this.arbolCertificacionCache$;
    }

    private construirDatosCertificacion(datos: EjecucionRegional[]): any[] {
        const resultado: any[] = [];

        for (const [id, info] of Object.entries(this.datosCertificacion)) {
            let ejecucion = 0;

            for (const [mongoField, idMapeado] of Object.entries(this.camposMongoDBCertificacion)) {
                if (idMapeado === id) {
                    ejecucion = this.sumarizarCampo(datos, mongoField);
                    break;
                }
            }

            resultado.push({
                id: id,
                descripcion: info.descripcion,
                meta: info.meta,
                ejecucion: this.redondear(ejecucion, 2)
            });
        }

        return resultado;
    }
}