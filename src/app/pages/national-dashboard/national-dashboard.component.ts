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
  MetricasPorCategoria
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

export interface DashboardData {
  nationalGoals: MetaNode[];
  formacionPorNivelTree: NivelNode[];
  programasRelevantes: ProgramaRelevante[];
  metricasAdicionales: MetricasPorCategoria;
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

  constructor(private metasService: MetasService) { }

  ngOnInit(): void {
    this.dashboardData$ = forkJoin({
      metas: this.metasService.getMetas(),
      jerarquias: this.metasService.getJerarquias(),
      formacionPorNivel: this.metasService.getFormacionPorNivel(),
      programasRelevantes: this.metasService.getProgramasRelevantes(),
      metricasAdicionales: this.metasService.getMetricasAdicionales()
    }).pipe(
      map(results => {
        this.cargando = false;
        
        return {
          nationalGoals: this.buildTree(results.metas, results.jerarquias),
          formacionPorNivelTree: this.buildNivelTree(results.formacionPorNivel),
          programasRelevantes: results.programasRelevantes,
          metricasAdicionales: results.metricasAdicionales
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

  public trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  public getMetricasKeys(metricas: MetricasPorCategoria): string[] {
    return Object.keys(metricas);
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
}
