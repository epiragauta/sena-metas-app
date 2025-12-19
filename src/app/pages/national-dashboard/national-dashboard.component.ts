import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MongoDBService } from '../../services/mongodb.service';
import { MetasService } from '../../services/metas.service';
import { XlsbApiService } from '../../services/xlsb-api.service';
import { SeccionesInfoService } from '../../services/secciones-info.service';
import { SeccionInfoDialogComponent } from '../../components/seccion-info-dialog.component';
import {
  Meta,
  Jerarquia,
  FormacionPorNivel,
  ProgramaRelevante,
  MetasPrimerCurso
} from '../../models/meta.model';

// Interfaz para el nodo jerárquico de Metas
export interface MetaNode extends Meta {
  children: MetaNode[];
  isCollapsed: boolean;
  level: number;
}

// Interfaz para el nodo jerárquico de Niveles de Formación
export interface NivelNode extends FormacionPorNivel {
  children: NivelNode[];
  isCollapsed: boolean;
  level: number;
}

// Interfaz para el nodo jerárquico basado en IDs
export interface HierarchyNode {
  id: string;
  descripcion: string;
  meta: number;
  ejecucion: number;
  porcentaje: number;
  children: HierarchyNode[];
  isCollapsed: boolean;
  level: number;
}

// Interfaz para el nodo de formación por estrategia
export interface FormacionEstrategiaNode {
  id: string;
  nivelFormacion: string;
  regularMeta: number | null;
  regularEjecucion: number | null;
  campesenaMeta: number | null;
  campesenaEjecucion: number | null;
  fullPopularMeta: number | null;
  fullPopularEjecucion: number | null;
  totalMeta: number;
  totalEjecucion: number;
  children: FormacionEstrategiaNode[];
  isCollapsed: boolean;
  level: number;
}

// Type for tab IDs
export type TabId = 'formacion-integral' | 'sistema-nacional-formacion-para-el-trabajo' | 'campesena-y-full-popular' | 'direccion-empleo-y-trabajo' | 'relaciones-corporativas';

export interface DashboardData {
  nationalGoals?: MetaNode[];
  formacionPorNivelTree?: NivelNode[];
  programasRelevantes?: ProgramaRelevante[];
  metasPrimerCurso?: MetasPrimerCurso;
  hierarchyTree?: HierarchyNode[];
  hierarchyRoot?: HierarchyNode | any;
  formacionEstrategiaTree?: FormacionEstrategiaNode[];
  formacionEstrategiaRoot?: FormacionEstrategiaNode;
  retencionTree?: any[];
  retencionPadres?: any[];
  certificacionTree?: any[];
  certificacionRoot?: any;
  competenciasLaboralesRoot?: HierarchyNode;
  competenciasLaboralesOtros?: HierarchyNode[];  // IDs 2-7
  productividadCampesena?: HierarchyNode[];  // 4 elementos sin jerarquía
  productividadFullPopular?: HierarchyNode[];  // Árbol completo Full Popular (IDs 1, 2, 3, 4)
  productividadFullPopularRoot?: HierarchyNode;  // ID=1 para tarjeta principal con detalles
  poblacionesVulnerablesRoot?: HierarchyNode;  // ID=1 para tarjeta
  poblacionesVulnerablesTree?: HierarchyNode[];  // Todos los nodos para tree-table
  agenciaPublicaEmpleoNivel1?: HierarchyNode[];  // 5 tarjetas nivel 1 (IDs 1, 2, 3, 4, 5)
  cuposFICTree?: HierarchyNode[];  // Árbol completo de Cupos FIC (Tabla 15)
  cuposFICRoot?: HierarchyNode;  // ID=1 para tarjeta principal
  fondoEmprender?: HierarchyNode[];  // 4 métricas planas (Tabla 12)
  contratosAprendizaje?: HierarchyNode[];  // 6 métricas con ID=3 principal (Tabla 13)
  contratosAprendizajePrincipal?: HierarchyNode;  // ID=3 (Total Aprendices)
  formacionProfesionalIntegral?: any;  // Datos FPI desde MongoDB
  arbolRetencion?: any;  // Datos Retención desde MongoDB
  arbolCertificacion?: any;  // Datos Certificación desde MongoDB
}

@Component({
  selector: 'app-national-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, PercentPipe, CurrencyPipe, MatIconModule, MatButtonModule, FormsModule, MatDialogModule],
  templateUrl: './national-dashboard.component.html',
  styleUrls: ['./national-dashboard.component.scss']
})
export class NationalDashboardComponent implements OnInit {

  public dashboardData$!: Observable<DashboardData>;
  public cargando = true;
  public selectedNodeForTree: HierarchyNode | null = null;
  public selectedEstrategiaNodeForTree: FormacionEstrategiaNode | null = null;
  public selectedEstrategiaType: 'regular' | 'campesena' | 'fullPopular' | null = null;
  public selectedRetencionNode: HierarchyNode | null = null;
  public selectedCertificacionNode: HierarchyNode | null = null;
  public showCompetenciasLaboralesDetails = false;
  public selectedFullPopularNode: HierarchyNode | null = null;
  public selectedPoblacionesVulnerablesNode: HierarchyNode | null = null;
  public selectedAgenciaPublicaEmpleoNode: HierarchyNode | null = null;
  public selectedCuposFICNode: HierarchyNode | null = null;
  public selectedContratosAprendizajeNode: HierarchyNode | null = null;
  public showMetaEjecucionModal = false;
  public modalData: { estrategia: string; meta: number | null; ejecucion: number | null; porcentaje: number } | null = null;

  // Search functionality
  public searchTerm: string = '';

  // Tabs management
  public activeTab: TabId = 'formacion-integral';
  public tabs = [
    { id: 'formacion-integral' as TabId, label: 'Formación Profesional Integral', icon: 'school' },
    { id: 'sistema-nacional-formacion-para-el-trabajo' as TabId, label: 'Sistema Nacional de Formación para el Trabajo', icon: 'verified' },
    { id: 'direccion-empleo-y-trabajo' as TabId, label: 'Dirección de Empleo y Trabajo', icon: 'business_center' },
    { id: 'campesena-y-full-popular' as TabId, label: 'CampeSENA y Full Popular', icon: 'agriculture' },    
    { id: 'relaciones-corporativas' as TabId, label: 'Relaciones Corporativas', icon: 'handshake' }
  ];

  constructor(
    private metasService: MetasService,
    private mongoDBService: MongoDBService,
    private xlsbApi: XlsbApiService,
    private seccionesInfoService: SeccionesInfoService,
    private dialog: MatDialog
  ) { }

  public selectTab(tabId: TabId): void {
    console.log('Cambiando a tab:', tabId);
    this.activeTab = tabId;
  }

  public isTabActive(tabId: TabId): boolean {
    const result = this.activeTab === tabId;
    if (result) {
      console.log('Tab activa:', tabId);
    }
    return result;
  }

  ngOnInit(): void {
    this.dashboardData$ = forkJoin({
      metasRegional: this.xlsbApi.getMetasRegional().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando metas regionales desde API:', err);
          return of([]);
        })
      ),
      metasCentros: this.xlsbApi.getMetasCentros().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando metas de centros desde API:', err);
          return of([]);
        })
      ),
      ejecucionRegional: this.xlsbApi.getEjecucionRegional().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando ejecución regional desde API:', err);
          return of([]);
        })
      ),
      ejecucionCentros: this.xlsbApi.getEjecucionCentros().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando ejecución de centros desde API:', err);
          return of([]);
        })
      ),
      metasJerarquia: this.metasService.getMetasJerarquia(),
      formacionPorEstrategia: this.metasService.getFormacionPorEstrategia(),
      arbolRetencion: this.mongoDBService.getArbolRetencionConEjecuciones(),
      arbolCertificacion: this.mongoDBService.getArbolCertificacionConEjecuciones(),
      metasCompetenciasLaborales: this.metasService.getMetasCompetenciasLaborales(),
      jerarquiasCompetenciasLaborales: this.metasService.getJerarquiasCompetenciasLaborales(),
      metasProductividadCampesena: this.metasService.getMetasProductividadCampesena(),
      metasFullPopularCompleto: this.metasService.getMetasFullPopularCompleto(),
      metasPoblacionesVulnerables: this.metasService.getMetasPoblacionesVulnerables(),
      jerarquiasPoblacionesVulnerables: this.metasService.getJerarquiasPoblacionesVulnerables(),
      metasAgenciaPublicaEmpleo: this.metasService.getMetasAgenciaPublicaEmpleo(),
      jerarquiasAgenciaPublicaEmpleo: this.metasService.getJerarquiasAgenciaPublicaEmpleo(),
      metasCuposFIC: this.metasService.getMetasCuposFIC(),
      jerarquiasCuposFIC: this.metasService.getJerarquiasCuposFIC(),
      metasFondoEmprender: this.metasService.getMetasFondoEmprender(),
      metasContratosAprendizaje: this.metasService.getMetasContratosAprendizaje(),
      formacionProfesionalIntegral: this.mongoDBService.getArbolFPIConEjecuciones(),
      // Nuevas llamadas para programas relevantes y primer curso
      programasRelevantes: this.metasService.getProgramasRelevantes().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando programas relevantes:', err);
          return of([]);
        })
      ),
      metasPrimerCurso: this.metasService.getMetasPrimerCurso().pipe(
        catchError(err => {
          console.warn('⚠️ Error cargando metas primer curso:', err);
          return of(undefined);
        })
      )
    }).pipe(
      map(results => {
        this.cargando = false;
        console.log('✅ Datos cargados desde APIs');
        console.log('Metas regionales:', results.metasRegional.length);
        console.log('Metas centros:', results.metasCentros.length);

        const hierarchyTree = this.buildHierarchyTree(results.metasJerarquia);
        const hierarchyRoot = results.formacionProfesionalIntegral;

        const formacionEstrategiaTree = this.buildFormacionEstrategiaTree(results.formacionPorEstrategia);
        const formacionEstrategiaRoot = formacionEstrategiaTree.length > 0 ? formacionEstrategiaTree[0] : undefined;

        const retencionTree = results.arbolRetencion.children || [];
        const retencionPadres = retencionTree.filter(node => node.level === 0);
        console.log('Retención - Total nodos:', retencionTree.length, 'Nivel 0:', retencionPadres.length);

        const certificacionTree = results.arbolCertificacion.children || [];
        const certificacionRoot = results.arbolCertificacion;
        console.log('Certificación - Total nodos:', certificacionTree.length, 'Root:', certificacionRoot?.id);

        const competenciasLaboralesTree = this.buildCompetenciasLaboralesTree(results.metasCompetenciasLaborales, results.jerarquiasCompetenciasLaborales);
        const competenciasLaboralesRoot = competenciasLaboralesTree.find(node => node.id === '1');
        const competenciasLaboralesOtros = competenciasLaboralesTree.filter(node => ['2', '3', '4', '5', '6', '7'].includes(node.id));
        console.log('Competencias Laborales - Total nodos:', competenciasLaboralesTree.length, 'Root:', competenciasLaboralesRoot?.id, 'Otros:', competenciasLaboralesOtros.length);

        const productividadCampesena = this.buildProductividadCampesenaNodes(results.metasProductividadCampesena);
        const productividadFullPopular = this.buildProductividadFullPopularNodes(results.metasFullPopularCompleto);
        const productividadFullPopularRoot = productividadFullPopular.find(node => node.id === '1');
        console.log('Full Popular - Total nodos:', productividadFullPopular.length, 'Root:', productividadFullPopularRoot?.id);

        const poblacionesVulnerablesTree = this.buildPoblacionesVulnerablesTree(results.metasPoblacionesVulnerables, results.jerarquiasPoblacionesVulnerables);
        const poblacionesVulnerablesRoot = poblacionesVulnerablesTree.find(node => node.id === '1');

        const agenciaPublicaEmpleoTree = this.buildAgenciaPublicaEmpleoTree(results.metasAgenciaPublicaEmpleo, results.jerarquiasAgenciaPublicaEmpleo);
        const agenciaPublicaEmpleoNivel1 = agenciaPublicaEmpleoTree.filter(node => node.level === 0);

        const cuposFICTree = this.buildCuposFICTree(results.metasCuposFIC, results.jerarquiasCuposFIC);
        const cuposFICRoot = cuposFICTree.find(node => node.id === '1');
        console.log('Cupos FIC - Total nodos:', cuposFICTree.length, 'Root:', cuposFICRoot?.id);

        const fondoEmprender = this.buildFondoEmprenderNodes(results.metasFondoEmprender);
        console.log('Fondo Emprender - Total tarjetas:', fondoEmprender.length);

        const contratosAprendizaje = this.buildContratosAprendizajeNodes(results.metasContratosAprendizaje);
        const contratosAprendizajePrincipal = contratosAprendizaje.find(node => node.id === '3');
        console.log('Contratos Aprendizaje - Total nodos:', contratosAprendizaje.length, 'Principal:', contratosAprendizajePrincipal?.id);

        // DEBUG: Log de programas relevantes y metas primer curso
        console.group('🔍 DEBUG - Construcción de DashboardData');
        console.log('📊 programasRelevantes asignado:', results.programasRelevantes);
        console.log('   - Length:', results.programasRelevantes?.length || 0);
        console.log('📈 metasPrimerCurso asignado:', results.metasPrimerCurso);
        console.log('   - Existe:', !!results.metasPrimerCurso);
        console.groupEnd();

        return {
          nationalGoals: [],
          formacionPorNivelTree: [],
          programasRelevantes: results.programasRelevantes,
          metasPrimerCurso: results.metasPrimerCurso,
          hierarchyTree: hierarchyTree,
          hierarchyRoot: hierarchyRoot,
          formacionEstrategiaTree: formacionEstrategiaTree,
          formacionEstrategiaRoot: formacionEstrategiaRoot,
          retencionTree: retencionTree,
          retencionPadres: retencionPadres,
          certificacionTree: certificacionTree,
          certificacionRoot: certificacionRoot,
          competenciasLaboralesRoot: competenciasLaboralesRoot,
          competenciasLaboralesOtros: competenciasLaboralesOtros,
          productividadCampesena: productividadCampesena,
          productividadFullPopular: productividadFullPopular,
          productividadFullPopularRoot: productividadFullPopularRoot,
          poblacionesVulnerablesRoot: poblacionesVulnerablesRoot,
          poblacionesVulnerablesTree: poblacionesVulnerablesTree,
          agenciaPublicaEmpleoNivel1: agenciaPublicaEmpleoNivel1,
          cuposFICTree: cuposFICTree,
          cuposFICRoot: cuposFICRoot,
          fondoEmprender: fondoEmprender,
          contratosAprendizaje: contratosAprendizaje,
          contratosAprendizajePrincipal: contratosAprendizajePrincipal,
          formacionProfesionalIntegral: results.formacionProfesionalIntegral,
          arbolRetencion: results.arbolRetencion,
          arbolCertificacion: results.arbolCertificacion
        } as DashboardData;
      })
    );
  }

  private buildTree(metas: Meta[], jerarquias: Jerarquia[]): MetaNode[] {
    const metasMap = new Map<number, MetaNode>();

    metas.forEach(meta => {
      metasMap.set(meta.id, {
        ...meta,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    jerarquias.forEach(relacion => {
      const padre = metasMap.get(relacion.idPadre);
      const hijo = metasMap.get(relacion.idHijo);
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    const allHijos = new Set(jerarquias.map(j => j.idHijo));
    const rootNodes: MetaNode[] = [];
    metasMap.forEach(node => {
      if (!allHijos.has(node.id)) {
        rootNodes.push(node);
      }
      node.children.sort((a, b) => (b.meta || 0) - (a.meta || 0));
    });

    rootNodes.forEach(root => this.assignLevel(root, 0));

    const granTotal = metasMap.get(33); // ID de TOTAL FORMACION PROFESIONAL INTEGRAL
    return granTotal ? [granTotal] : rootNodes;
  }

  private assignLevel(node: MetaNode, level: number): void {
    node.level = level;

    // Ordenes independientes por nivel
    if (level === 0) {
      // Level 0 (children): menor a mayor
      node.children.sort((a, b) => (a.meta || 0) - (b.meta || 0));
    } else if (level === 1) {
      // Level 1 (grandchildren): mayor a menor
      node.children.sort((a, b) => (b.meta || 0) - (a.meta || 0));
    } else if (level === 2) {
      // Level 2: menor a mayor
      node.children.sort((a, b) => (a.meta || 0) - (b.meta || 0));
    }
    // Agregar más niveles si necesitas...

    node.children.forEach(child => this.assignLevel(child, level + 1));
  }

  public toggleNode(node: MetaNode): void {
    node.isCollapsed = !node.isCollapsed;
  }

  private buildNivelTree(niveles: FormacionPorNivel[]): NivelNode[] {
    const nivelMap = new Map<string, NivelNode>();
    const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();

    niveles.forEach(nivel => {
      nivelMap.set(normalize(nivel.nivelFormacion), {
        ...nivel,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    const childSet = new Set<string>();
    const addAsChild = (parentName: string, childName: string) => {
      const parent = nivelMap.get(normalize(parentName));
      const child = nivelMap.get(normalize(childName));
      if (parent && child) {
        parent.children.push(child);
        childSet.add(normalize(childName));
      }
    };

    // Definir la jerarquía completa
    addAsChild('TOTAL FORMACION LABORAL', 'TÉCNICO');
    addAsChild('TOTAL FORMACION LABORAL', 'ARTICULACIÓN CON LA MEDIA TECNICA');
    addAsChild('TOTAL FORMACION LABORAL', 'OPERARIO');
    addAsChild('TOTAL FORMACION LABORAL', 'AUXILIAR');
    addAsChild('TOTAL FORMACION LABORAL', 'PROFUNDIZACIÓN TÉCNICA');

    addAsChild('TOTAL FORMACION EDUCACION SUPERIOR', 'TECNÓLOGO');

    addAsChild('TOTAL FORMACION TITULADA', 'TOTAL FORMACION EDUCACION SUPERIOR');
    addAsChild('TOTAL FORMACION TITULADA', 'TOTAL FORMACION LABORAL');

    addAsChild('TOTAL FORMACION COMPLEMENTARIA', 'COMPLEMENTARIA');
    addAsChild('TOTAL FORMACION COMPLEMENTARIA', 'Programa de Formación Continua Especializada');
    addAsChild('TOTAL FORMACION COMPLEMENTARIA', 'Estrategia Formación Continua Especial Campesina (En el marco de FEEC)');
    addAsChild('TOTAL FORMACION COMPLEMENTARIA', 'Formación Continua Especial Popular (En el marco de FEP)');

    addAsChild('TOTAL FORMACIÓN PROFESIONAL INTEGRAL', 'TOTAL FORMACION COMPLEMENTARIA');
    addAsChild('TOTAL FORMACIÓN PROFESIONAL INTEGRAL', 'TOTAL FORMACION TITULADA');

    const rootNodes: NivelNode[] = [];
    nivelMap.forEach((node, name) => {
      if (!childSet.has(name)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles y ordenar hijos
    rootNodes.forEach(root => {
      this.assignNivelLevel(root, 0);
    });

    const granTotal = rootNodes.find(n => normalize(n.nivelFormacion) === 'TOTAL FORMACIÓN PROFESIONAL INTEGRAL');
    return granTotal ? [granTotal] : rootNodes;
  }

  private assignNivelLevel(node: NivelNode, level: number): void {
    node.level = level;
    // Ordenar hijos por totalMeta descendente
    node.children.sort((a, b) => b.totalMeta - a.totalMeta);
    node.children.forEach(child => this.assignNivelLevel(child, level + 1));
  }

  public toggleNivelNode(node: NivelNode): void {
    node.isCollapsed = !node.isCollapsed;
  }

  private buildHierarchyTree(data: any[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos con porcentaje calculado
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

    // Construir jerarquía basada en los IDs
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      const parts = id.split('.');

      if (parts.length === 1) {
        // Es un nodo raíz
        rootNodes.push(node);
      } else {
        // Encontrar el padre
        const parentId = parts.slice(0, -1).join('.');
        const parent = nodesMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  private assignHierarchyLevel(node: HierarchyNode, level: number): void {
    node.level = level;
    node.children.forEach(child => this.assignHierarchyLevel(child, level + 1));
  }

  private buildFormacionEstrategiaTree(data: any[]): FormacionEstrategiaNode[] {
    const nodesMap = new Map<string, FormacionEstrategiaNode>();

    // Crear nodos con totalEjecucion calculado
    data.forEach(item => {
      const totalEjecucion = (item.regularEjecucion || 0) + (item.campesenaEjecucion || 0) + (item.fullPopularEjecucion || 0);
      nodesMap.set(item.id, {
        id: item.id,
        nivelFormacion: item.nivelFormacion,
        regularMeta: item.regularMeta,
        regularEjecucion: item.regularEjecucion,
        campesenaMeta: item.campesenaMeta,
        campesenaEjecucion: item.campesenaEjecucion,
        fullPopularMeta: item.fullPopularMeta,
        fullPopularEjecucion: item.fullPopularEjecucion,
        totalMeta: item.totalMeta,
        totalEjecucion: totalEjecucion,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía basada en los IDs
    const rootNodes: FormacionEstrategiaNode[] = [];
    nodesMap.forEach((node, id) => {
      const parts = id.split('.');

      if (parts.length === 1) {
        // Es un nodo raíz
        rootNodes.push(node);
      } else {
        // Encontrar el padre
        const parentId = parts.slice(0, -1).join('.');
        const parent = nodesMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignFormacionEstrategiaLevel(root, 0));

    return rootNodes;
  }

  private assignFormacionEstrategiaLevel(node: FormacionEstrategiaNode, level: number): void {
    node.level = level;
    node.children.forEach(child => this.assignFormacionEstrategiaLevel(child, level + 1));
  }

  /**
   * Construye el árbol de retención usando jerarquías explícitas
   */
  private buildRetencionTree(metas: Meta[], jerarquias: Jerarquia[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos
    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía usando las relaciones
    jerarquias.forEach(relacion => {
      const padre = nodesMap.get(relacion.idPadre.toString());
      const hijo = nodesMap.get(relacion.idHijo.toString());
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    // Encontrar nodos raíz (que no son hijos de nadie)
    const allHijos = new Set(jerarquias.map(j => j.idHijo.toString()));
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (!allHijos.has(id)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  /**
   * Construye el árbol de competencias laborales usando jerarquías explícitas
   */
  private buildCompetenciasLaboralesTree(metas: Meta[], jerarquias: Jerarquia[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos
    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía usando las relaciones
    jerarquias.forEach(relacion => {
      const padre = nodesMap.get(relacion.idPadre.toString());
      const hijo = nodesMap.get(relacion.idHijo.toString());
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    // Encontrar nodos raíz (que no son hijos de nadie)
    const allHijos = new Set(jerarquias.map(j => j.idHijo.toString()));
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (!allHijos.has(id)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  /**
   * Construye nodos de productividad CampeSENA (sin jerarquía)
   */
  private buildProductividadCampesenaNodes(metas: Meta[]): HierarchyNode[] {
    return metas.map(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      return {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      };
    });
  }

  /**
   * Construye árbol jerárquico de Full Popular basado en IDs con patrón de punto
   */
  private buildProductividadFullPopularNodes(metas: Meta[]): HierarchyNode[] {
    // Crear mapa de nodos
    const nodesMap = new Map<string, HierarchyNode>();

    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía basada en patrón de IDs (1, 1.1, 1.2, etc.)
    const rootNodes: HierarchyNode[] = [];

    nodesMap.forEach((node, id) => {
      // Si el ID contiene un punto, buscar el padre
      if (id.includes('.')) {
        const parentId = id.substring(0, id.lastIndexOf('.'));
        const parent = nodesMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        // IDs sin punto son nodos raíz
        rootNodes.push(node);
      }
    });

    // Asignar niveles jerárquicos
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  private buildFondoEmprenderNodes(metas: Meta[]): HierarchyNode[] {
    return metas.map(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      return {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      };
    });
  }

  private buildContratosAprendizajeNodes(metas: Meta[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear todos los nodos
    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía: ID=3 tiene hijos 3.1 y 3.2
    const padre = nodesMap.get('3');
    const hijo1 = nodesMap.get('3.1');
    const hijo2 = nodesMap.get('3.2');

    if (padre && hijo1) {
      padre.children.push(hijo1);
      hijo1.level = 1;
    }
    if (padre && hijo2) {
      padre.children.push(hijo2);
      hijo2.level = 1;
    }

    // Retornar todos los nodos de nivel 0 (1, 2, 3, 4)
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (node.level === 0) {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  /**
   * Construye el árbol de poblaciones vulnerables usando jerarquías explícitas
   */
  private buildPoblacionesVulnerablesTree(metas: Meta[], jerarquias: Jerarquia[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos
    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía usando las relaciones
    jerarquias.forEach(relacion => {
      const padre = nodesMap.get(relacion.idPadre.toString());
      const hijo = nodesMap.get(relacion.idHijo.toString());
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    // Encontrar nodos raíz (que no son hijos de nadie)
    const allHijos = new Set(jerarquias.map(j => j.idHijo.toString()));
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (!allHijos.has(id)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  /**
   * Construye el árbol de certificación usando jerarquías explícitas
   */
  private buildCertificacionTree(metas: Meta[], jerarquias: Jerarquia[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos
    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía usando las relaciones
    jerarquias.forEach(relacion => {
      const padre = nodesMap.get(relacion.idPadre.toString());
      const hijo = nodesMap.get(relacion.idHijo.toString());
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    // Encontrar nodos raíz (que no son hijos de nadie)
    const allHijos = new Set(jerarquias.map(j => j.idHijo.toString()));
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (!allHijos.has(id)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  public toggleHierarchyNode(node: HierarchyNode | any): void {
    node.isCollapsed = !node.isCollapsed;

    // Si se contrae el nodo raíz (nivel 0), cerrar la tabla de detalles
    if (node.level === 0 && node.isCollapsed) {
      this.selectedNodeForTree = null;
    }
  }

  public selectNodeForTree(node: HierarchyNode): void {
    // Si ya está seleccionado, deseleccionar
    if (this.selectedNodeForTree?.id === node.id) {
      this.selectedNodeForTree = null;
    } else {
      this.selectedNodeForTree = node;
    }
  }

  public isNodeSelectedForTree(node: HierarchyNode): boolean {
    return this.selectedNodeForTree?.id === node.id;
  }

  public getSecondLevelChildren(root: HierarchyNode | any | undefined): (HierarchyNode | any)[] {
    if (!root) return [];
    return this.filterHierarchyNodes(root.children);
  }

  public trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  public trackByHierarchyId(index: number, item: HierarchyNode): string {
    return item.id;
  }

  public calcularPorcentaje(meta: number | null, ejecucion: number | null): number {
    if (meta === 0 || meta === null || ejecucion === null) {
      return 0;
    }
    return (ejecucion / meta);
  }

  public calcularTotalEjecucion(item: FormacionPorNivel): number {
    return (item.regularEjecucion || 0) + (item.campesenaEjecucion || 0) + (item.fullPopularEjecucion || 0);
  }

  getClasePorcentaje(porcentaje: number): string {
    return this.metasService.getClasePorcentaje(porcentaje * 100);
  }

  getClaseSemaforo(porcentaje: number): string {
    const porcentajeReal = porcentaje * 100;

    if (porcentajeReal > 100.59) {
      return 'semaforo-sobreejecucion';
    } else if (porcentajeReal >= 90) {
      return 'semaforo-buena';
    } else if (porcentajeReal >= 83) {
      return 'semaforo-vulnerable';
    } else {
      return 'semaforo-bajo';
    }
  }

  public removeParentheses(text: string): string {
    // Elimina todo el texto desde el primer paréntesis de apertura
    const index = text.indexOf('(');
    return index > 0 ? text.substring(0, index).trim() : text;
  }

  public toggleFormacionEstrategiaNode(node: FormacionEstrategiaNode): void {
    node.isCollapsed = !node.isCollapsed;

    // Si se contrae el nodo raíz (nivel 0), cerrar la tabla de detalles
    if (node.level === 0 && node.isCollapsed) {
      this.selectedEstrategiaNodeForTree = null;
    }
  }

  public selectEstrategiaNodeForTree(node: FormacionEstrategiaNode, estrategia: 'regular' | 'campesena' | 'fullPopular'): void {
    // Si ya está seleccionado el mismo nodo y estrategia, deseleccionar
    if (this.selectedEstrategiaNodeForTree?.id === node.id && this.selectedEstrategiaType === estrategia) {
      this.selectedEstrategiaNodeForTree = null;
      this.selectedEstrategiaType = null;
    } else {
      this.selectedEstrategiaNodeForTree = node;
      this.selectedEstrategiaType = estrategia;
    }
  }

  public isEstrategiaNodeSelectedForTree(node: FormacionEstrategiaNode): boolean {
    return this.selectedEstrategiaNodeForTree?.id === node.id;
  }

  public isEstrategiaTypeSelected(node: FormacionEstrategiaNode, estrategia: 'regular' | 'campesena' | 'fullPopular'): boolean {
    return this.selectedEstrategiaNodeForTree?.id === node.id && this.selectedEstrategiaType === estrategia;
  }

  public isFormacionComplementaria(node: FormacionEstrategiaNode): boolean {
    const nivelNormalizado = node.nivelFormacion.toUpperCase().trim();
    return nivelNormalizado.includes('FORMACION COMPLEMENTARIA') ||
           nivelNormalizado.includes('COMPLEMENTARIA') ||
           nivelNormalizado.includes('FORMACIÓN COMPLEMENTARIA');
  }

  /**
   * Filtra los hijos de FORMACION COMPLEMENTARIA según la estrategia seleccionada
   * - Todas las estrategias incluyen: COMPLEMENTARIA
   * - Regular: Programa de Formación Continua Especializada
   * - CampeSENA: Estrategia Formación Continua Especial Campesina
   * - Full Popular: Formación Continua Especial Popular
   */
  public getFilteredChildrenByEstrategia(): FormacionEstrategiaNode[] {
    if (!this.selectedEstrategiaNodeForTree || !this.selectedEstrategiaType) {
      return [];
    }

    // Si NO es FORMACION COMPLEMENTARIA, devolver todos los hijos
    if (!this.isFormacionComplementaria(this.selectedEstrategiaNodeForTree)) {
      return this.selectedEstrategiaNodeForTree.children;
    }

    // Filtrar hijos según la estrategia seleccionada
    return this.selectedEstrategiaNodeForTree.children.filter(child => {
      const nivelNormalizado = child.nivelFormacion.toUpperCase().trim();

      // COMPLEMENTARIA se incluye en todas las estrategias
      if (nivelNormalizado === 'COMPLEMENTARIA') {
        return true;
      }

      switch (this.selectedEstrategiaType) {
        case 'regular':
          return nivelNormalizado.includes('PROGRAMA DE FORMACION CONTINUA ESPECIALIZADA') ||
                 nivelNormalizado.includes('PROGRAMA DE FORMACIÓN CONTINUA ESPECIALIZADA');

        case 'campesena':
          return nivelNormalizado.includes('ESTRATEGIA FORMACION CONTINUA ESPECIAL CAMPESINA') ||
                 nivelNormalizado.includes('ESTRATEGIA FORMACIÓN CONTINUA ESPECIAL CAMPESINA') ||
                 nivelNormalizado.includes('FEEC');

        case 'fullPopular':
          return nivelNormalizado.includes('FORMACION CONTINUA ESPECIAL POPULAR') ||
                 nivelNormalizado.includes('FORMACIÓN CONTINUA ESPECIAL POPULAR') ||
                 nivelNormalizado.includes('FEP');

        default:
          return false;
      }
    });
  }

  public showMetaEjecucionPopup(estrategia: string, meta: number | null, ejecucion: number | null): void {
    const porcentaje = (meta && meta > 0 && ejecucion !== null) ? (ejecucion / meta) * 100 : 0;
    this.modalData = { estrategia, meta, ejecucion, porcentaje };
    this.showMetaEjecucionModal = true;
  }

  public closeMetaEjecucionModal(): void {
    this.showMetaEjecucionModal = false;
    this.modalData = null;
  }

  public trackByEstrategiaId(index: number, item: FormacionEstrategiaNode): string {
    return item.id;
  }

  // Métodos para Retención
  public selectRetencionNode(node: HierarchyNode): void {
    if (this.selectedRetencionNode?.id === node.id) {
      this.selectedRetencionNode = null;
    } else {
      this.selectedRetencionNode = node;
    }
  }

  public isRetencionNodeSelected(node: HierarchyNode): boolean {
    return this.selectedRetencionNode?.id === node.id;
  }

  public getRetencionColumnIndex(node: HierarchyNode): number {
    const id = parseInt(node.id);
    return id <= 6 ? 0 : 1;
  }

  // Métodos para Certificación
  public selectCertificacionNode(node: HierarchyNode): void {
    if (this.selectedCertificacionNode?.id === node.id) {
      this.selectedCertificacionNode = null;
    } else {
      this.selectedCertificacionNode = node;
    }
  }

  public isCertificacionNodeSelected(node: HierarchyNode): boolean {
    return this.selectedCertificacionNode?.id === node.id;
  }

  // Métodos para Full Popular
  public selectFullPopularNode(node: HierarchyNode): void {
    if (this.selectedFullPopularNode?.id === node.id) {
      this.selectedFullPopularNode = null;
    } else {
      this.selectedFullPopularNode = node;
    }
  }

  public isFullPopularNodeSelected(node: HierarchyNode): boolean {
    return this.selectedFullPopularNode?.id === node.id;
  }

  public toggleCompetenciasLaboralesDetails(): void {
    this.showCompetenciasLaboralesDetails = !this.showCompetenciasLaboralesDetails;
  }

  public selectPoblacionesVulnerablesNode(node: HierarchyNode): void {
    if (this.selectedPoblacionesVulnerablesNode?.id === node.id) {
      this.selectedPoblacionesVulnerablesNode = null;
    } else {
      this.selectedPoblacionesVulnerablesNode = node;
    }
  }

  public isPoblacionesVulnerablesNodeSelected(node: HierarchyNode): boolean {
    return this.selectedPoblacionesVulnerablesNode?.id === node.id;
  }

  /**
   * Construye el árbol de agencia pública de empleo usando jerarquías explícitas
   */
  private buildCuposFICTree(metas: Meta[], jerarquias: Jerarquia[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos
    metas.forEach(meta => {
      const porcentaje = (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía usando las relaciones
    jerarquias.forEach(relacion => {
      const padre = nodesMap.get(relacion.idPadre.toString());
      const hijo = nodesMap.get(relacion.idHijo.toString());
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    // Encontrar nodos raíz (que no son hijos de nadie)
    const allHijos = new Set(jerarquias.map(j => j.idHijo.toString()));
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (!allHijos.has(id)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  private buildAgenciaPublicaEmpleoTree(metas: Meta[], jerarquias: Jerarquia[]): HierarchyNode[] {
    const nodesMap = new Map<string, HierarchyNode>();

    // Crear nodos
    metas.forEach(meta => {
      const porcentaje = meta.esTasa ? meta.ejecucion : (meta.meta > 0) ? (meta.ejecucion / meta.meta) * 100 : 0;
      nodesMap.set(meta.id.toString(), {
        id: meta.id.toString(),
        descripcion: meta.descripcion,
        meta: meta.meta,
        ejecucion: meta.ejecucion,
        porcentaje: porcentaje,
        children: [],
        isCollapsed: true,
        level: 0
      });
    });

    // Construir jerarquía usando las relaciones
    jerarquias.forEach(relacion => {
      const padre = nodesMap.get(relacion.idPadre.toString());
      const hijo = nodesMap.get(relacion.idHijo.toString());
      if (padre && hijo) {
        padre.children.push(hijo);
      }
    });

    // Encontrar nodos raíz (que no son hijos de nadie)
    const allHijos = new Set(jerarquias.map(j => j.idHijo.toString()));
    const rootNodes: HierarchyNode[] = [];
    nodesMap.forEach((node, id) => {
      if (!allHijos.has(id)) {
        rootNodes.push(node);
      }
    });

    // Asignar niveles
    rootNodes.forEach(root => this.assignHierarchyLevel(root, 0));

    return rootNodes;
  }

  public selectAgenciaPublicaEmpleoNode(node: HierarchyNode): void {
    if (this.selectedAgenciaPublicaEmpleoNode?.id === node.id) {
      this.selectedAgenciaPublicaEmpleoNode = null;
    } else {
      this.selectedAgenciaPublicaEmpleoNode = node;
    }
  }

  public isAgenciaPublicaEmpleoNodeSelected(node: HierarchyNode): boolean {
    return this.selectedAgenciaPublicaEmpleoNode?.id === node.id;
  }

  public selectCuposFICNode(node: HierarchyNode): void {
    if (this.selectedCuposFICNode?.id === node.id) {
      this.selectedCuposFICNode = null;
    } else {
      this.selectedCuposFICNode = node;
    }
  }

  public isCuposFICNodeSelected(node: HierarchyNode): boolean {
    return this.selectedCuposFICNode?.id === node.id;
  }

  public selectContratosAprendizajeNode(node: HierarchyNode): void {
    if (this.selectedContratosAprendizajeNode?.id === node.id) {
      this.selectedContratosAprendizajeNode = null;
    } else {
      this.selectedContratosAprendizajeNode = node;
    }
  }

  public isContratosAprendizajeNodeSelected(node: HierarchyNode): boolean {
    return this.selectedContratosAprendizajeNode?.id === node.id;
  }

  // ====================================
  // SEARCH FUNCTIONALITY
  // ====================================

  /**
   * Filtra nodos jerárquicos (HierarchyNode) basándose en el término de búsqueda
   * Busca recursivamente en todos los niveles de la jerarquía
   */
  /**
   * Filtra nodos jerárquicos (HierarchyNode | any) basándose en el término de búsqueda
   * Busca recursivamente en todos los niveles de la jerarquía
   */
  public filterHierarchyNodes(nodes: (HierarchyNode | any)[] | undefined): (HierarchyNode | any)[] {
    if (!nodes || !this.searchTerm) {
      return nodes || [];
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return nodes;
    }

    return nodes.filter(node => this.matchesSearchRecursive(node, term)).map(node => {
      const filteredChildren = this.filterHierarchyNodes(node.children);
      return { ...node, children: filteredChildren };
    });
  }

  /**
   * Verifica si un nodo o sus hijos coinciden con el término de búsqueda
   */
  private matchesSearchRecursive(node: HierarchyNode | any, term: string): boolean {
    // Verificar si la descripción del nodo actual coincide
    if (node.descripcion.toLowerCase().includes(term)) {
      return true;
    }

    // Verificar recursivamente en los hijos
    if (node.children && node.children.length > 0) {
      return node.children.some((child: any) => this.matchesSearchRecursive(child, term));
    }

    return false;
  }

  /**
   * Filtra nodos de formación por estrategia
   */
  public filterFormacionEstrategiaNodes(nodes: FormacionEstrategiaNode[] | undefined): FormacionEstrategiaNode[] {
    if (!nodes || !this.searchTerm) {
      return nodes || [];
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return nodes;
    }

    return nodes.filter(node => this.matchesFormacionEstrategiaSearchRecursive(node, term)).map(node => {
      const filteredChildren = this.filterFormacionEstrategiaNodes(node.children);
      return { ...node, children: filteredChildren };
    });
  }

  private matchesFormacionEstrategiaSearchRecursive(node: FormacionEstrategiaNode, term: string): boolean {
    if (node.nivelFormacion.toLowerCase().includes(term)) {
      return true;
    }

    if (node.children && node.children.length > 0) {
      return node.children.some(child => this.matchesFormacionEstrategiaSearchRecursive(child, term));
    }

    return false;
  }

  /**
   * Filtra array simple de programas relevantes
   */
  public filterProgramasRelevantes(programas: ProgramaRelevante[] | undefined): ProgramaRelevante[] {
    if (!programas || !this.searchTerm) {
      return programas || [];
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return programas;
    }

    return programas.filter(programa =>
      programa.descripcion.toLowerCase().includes(term)
    );
  }

  /**
   * Verifica si un nodo individual coincide con la búsqueda
   */
  public matchesSearch(descripcion: string): boolean {
    if (!this.searchTerm) {
      return true;
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return true;
    }

    return descripcion.toLowerCase().includes(term);
  }

  /**
   * Limpia el término de búsqueda
   */
  public clearSearch(): void {
    this.searchTerm = '';
  }

  /**
   * Verifica si hay una búsqueda activa
   */
  public get hasActiveSearch(): boolean {
    return !!(this.searchTerm && this.searchTerm.trim().length > 0);
  }

  // ====================================
  // INFO DIALOG
  // ====================================

  /**
   * Método para debug: Loggea información sobre programas relevantes y metas primer curso
   */
  public logProgramasData(data: DashboardData): string {
    console.group('🔍 DEBUG - Metas Programas Relevantes y Primer Curso');
    console.log('📊 programasRelevantes:', data.programasRelevantes);
    console.log('   - Existe:', !!data.programasRelevantes);
    console.log('   - Length:', data.programasRelevantes?.length || 0);
    console.log('   - Datos:', data.programasRelevantes);
    console.log('📈 metasPrimerCurso:', data.metasPrimerCurso);
    console.log('   - Existe:', !!data.metasPrimerCurso);
    console.log('   - Datos:', data.metasPrimerCurso);
    console.log('✅ Condición *ngIf evaluada:', (data.programasRelevantes && data.programasRelevantes.length > 0) || data.metasPrimerCurso);
    console.groupEnd();
    return ''; // Retorna string vacío para no mostrar nada en el template
  }

  /**
   * Abre el diálogo de información para una sección específica
   */
  public openSeccionInfo(seccionId: string): void {
    this.seccionesInfoService.getSeccionInfoById(seccionId).pipe(
      take(1)
    ).subscribe({
      next: (seccionInfo) => {
        if (seccionInfo) {
          this.dialog.open(SeccionInfoDialogComponent, {
            width: '600px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: seccionInfo,
            autoFocus: true,
            restoreFocus: true
          });
        } else {
          console.warn(`No se encontró información para la sección: ${seccionId}`);
        }
      },
      error: (error) => {
        console.error('Error al cargar información de la sección:', error);
      }
    });
  }
}