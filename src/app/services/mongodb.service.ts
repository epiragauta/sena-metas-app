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
    private readonly mongoURL = 'http://127.0.0.1:8000/mongodb/collections/ejecucion_fpi_regional';
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
                ejecucion: ejecucion
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
}