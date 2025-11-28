import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetasService } from '../../services/metas.service';
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
export type TabId = 'formacion-integral' | 'certificacion-retencion' | 'inclusion-social' | 'servicios-empleo';

export interface DashboardData {
  nationalGoals: MetaNode[];
  formacionPorNivelTree: NivelNode[];
  programasRelevantes: ProgramaRelevante[];
  metasPrimerCurso: MetasPrimerCurso;
  hierarchyTree?: HierarchyNode[];
  hierarchyRoot?: HierarchyNode;
  formacionEstrategiaTree?: FormacionEstrategiaNode[];
  formacionEstrategiaRoot?: FormacionEstrategiaNode;
  retencionTree?: HierarchyNode[];
  retencionPadres?: HierarchyNode[];  // Solo elementos nivel 1
  certificacionTree?: HierarchyNode[];
  certificacionRoot?: HierarchyNode;
  competenciasLaboralesRoot?: HierarchyNode;
  competenciasLaboralesOtros?: HierarchyNode[];  // IDs 2-7
  productividadCampesena?: HierarchyNode[];  // 4 elementos sin jerarquía
  poblacionesVulnerablesRoot?: HierarchyNode;  // ID=1 para tarjeta
  poblacionesVulnerablesTree?: HierarchyNode[];  // Todos los nodos para tree-table
  agenciaPublicaEmpleoNivel1?: HierarchyNode[];  // 5 tarjetas nivel 1 (IDs 1, 2, 3, 4, 5)
}

@Component({
  selector: 'app-national-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, PercentPipe, CurrencyPipe],
  templateUrl: './national-dashboard.component.html',
  styleUrls: ['./national-dashboard.component.scss']
})
export class NationalDashboardComponent implements OnInit {

  public dashboardData$!: Observable<DashboardData>;
  public cargando = true;
  public selectedNodeForTree: HierarchyNode | null = null;
  public selectedEstrategiaNodeForTree: FormacionEstrategiaNode | null = null;
  public selectedRetencionNode: HierarchyNode | null = null;
  public selectedCertificacionNode: HierarchyNode | null = null;
  public showCompetenciasLaboralesDetails = false;
  public selectedPoblacionesVulnerablesNode: HierarchyNode | null = null;
  public selectedAgenciaPublicaEmpleoNode: HierarchyNode | null = null;
  public showMetaEjecucionModal = false;
  public modalData: { estrategia: string; meta: number | null; ejecucion: number | null; porcentaje: number } | null = null;

  // Tabs management
  public activeTab: TabId = 'formacion-integral';
  public tabs = [
    { id: 'formacion-integral' as TabId, label: 'Formación Profesional Integral', icon: '📊' },
    { id: 'certificacion-retencion' as TabId, label: 'Certificación y Retención', icon: '📜' },
    { id: 'inclusion-social' as TabId, label: 'Programas de Inclusión Social', icon: '🌾' },
    { id: 'servicios-empleo' as TabId, label: 'Servicios de Empleo', icon: '💼' }
  ];

  constructor(private metasService: MetasService) { }

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
      metas: this.metasService.getMetas(),
      jerarquias: this.metasService.getJerarquias(),
      formacionPorNivel: this.metasService.getFormacionPorNivel(),
      programasRelevantes: this.metasService.getProgramasRelevantes(),
      metasPrimerCurso: this.metasService.getPrimerCurso(),
      metasJerarquia: this.metasService.getMetasJerarquia(),
      formacionPorEstrategia: this.metasService.getFormacionPorEstrategia(),
      metasRetencion: this.metasService.getMetasRetencion(),
      jerarquiasRetencion: this.metasService.getJerarquiasRetencion(),
      metasCertificacion: this.metasService.getMetasCertificacion(),
      jerarquiasCertificacion: this.metasService.getJerarquiasCertificacion(),
      metasCompetenciasLaborales: this.metasService.getMetasCompetenciasLaborales(),
      jerarquiasCompetenciasLaborales: this.metasService.getJerarquiasCompetenciasLaborales(),
      metasProductividadCampesena: this.metasService.getMetasProductividadCampesena(),
      metasPoblacionesVulnerables: this.metasService.getMetasPoblacionesVulnerables(),
      jerarquiasPoblacionesVulnerables: this.metasService.getJerarquiasPoblacionesVulnerables(),
      metasAgenciaPublicaEmpleo: this.metasService.getMetasAgenciaPublicaEmpleo(),
      jerarquiasAgenciaPublicaEmpleo: this.metasService.getJerarquiasAgenciaPublicaEmpleo()
    }).pipe(
      map(results => {
        this.cargando = false;

        const hierarchyTree = this.buildHierarchyTree(results.metasJerarquia);
        const hierarchyRoot = hierarchyTree.length > 0 ? hierarchyTree[0] : undefined;

        const formacionEstrategiaTree = this.buildFormacionEstrategiaTree(results.formacionPorEstrategia);
        const formacionEstrategiaRoot = formacionEstrategiaTree.length > 0 ? formacionEstrategiaTree[0] : undefined;

        const retencionTree = this.buildRetencionTree(results.metasRetencion, results.jerarquiasRetencion);
        const retencionPadres = retencionTree.filter(node => node.level === 0);
        console.log('Retención - Total nodos:', retencionTree.length, 'Nivel 0:', retencionPadres.length);

        const certificacionTree = this.buildCertificacionTree(results.metasCertificacion, results.jerarquiasCertificacion);
        const certificacionRoot = certificacionTree.length > 0 ? certificacionTree[0] : undefined;
        console.log('Certificación - Total nodos:', certificacionTree.length, 'Root:', certificacionRoot?.id);

        const competenciasLaboralesTree = this.buildCompetenciasLaboralesTree(results.metasCompetenciasLaborales, results.jerarquiasCompetenciasLaborales);
        const competenciasLaboralesRoot = competenciasLaboralesTree.find(node => node.id === '1');
        const competenciasLaboralesOtros = competenciasLaboralesTree.filter(node => ['2', '3', '4', '5', '6', '7'].includes(node.id));
        console.log('Competencias Laborales - Total nodos:', competenciasLaboralesTree.length, 'Root:', competenciasLaboralesRoot?.id, 'Otros:', competenciasLaboralesOtros.length);

        const productividadCampesena = this.buildProductividadCampesenaNodes(results.metasProductividadCampesena);

        const poblacionesVulnerablesTree = this.buildPoblacionesVulnerablesTree(results.metasPoblacionesVulnerables, results.jerarquiasPoblacionesVulnerables);
        const poblacionesVulnerablesRoot = poblacionesVulnerablesTree.find(node => node.id === '1');

        const agenciaPublicaEmpleoTree = this.buildAgenciaPublicaEmpleoTree(results.metasAgenciaPublicaEmpleo, results.jerarquiasAgenciaPublicaEmpleo);
        const agenciaPublicaEmpleoNivel1 = agenciaPublicaEmpleoTree.filter(node => node.level === 0);

        return {
          nationalGoals: this.buildTree(results.metas, results.jerarquias),
          formacionPorNivelTree: this.buildNivelTree(results.formacionPorNivel),
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
          poblacionesVulnerablesRoot: poblacionesVulnerablesRoot,
          poblacionesVulnerablesTree: poblacionesVulnerablesTree,
          agenciaPublicaEmpleoNivel1: agenciaPublicaEmpleoNivel1
        };
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

  public toggleHierarchyNode(node: HierarchyNode): void {
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

  public getSecondLevelChildren(root: HierarchyNode | undefined): HierarchyNode[] {
    if (!root) return [];
    return root.children;
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

  public removeParentheses(text: string): string{
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

  public selectEstrategiaNodeForTree(node: FormacionEstrategiaNode): void {
    // Si ya está seleccionado, deseleccionar
    if (this.selectedEstrategiaNodeForTree?.id === node.id) {
      this.selectedEstrategiaNodeForTree = null;
    } else {
      this.selectedEstrategiaNodeForTree = node;
    }
  }

  public isEstrategiaNodeSelectedForTree(node: FormacionEstrategiaNode): boolean {
    return this.selectedEstrategiaNodeForTree?.id === node.id;
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
}