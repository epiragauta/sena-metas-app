import { Pipe, PipeTransform } from '@angular/core';
import { Meta, FiltrosMetas } from '../models/meta.model';

/**
 * Pipe para filtrar metas según criterios combinados
 */
@Pipe({
  name: 'filterMetas',
  standalone: true
})
export class FilterMetasPipe implements PipeTransform {
  transform(metas: Meta[] | null, filtros: FiltrosMetas): Meta[] {
    if (!metas) return [];
    if (!filtros || Object.keys(filtros).length === 0) return metas;

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
  }
}

/**
 * Pipe para filtrar por texto en descripción
 */
@Pipe({
  name: 'filterByText',
  standalone: true
})
export class FilterByTextPipe implements PipeTransform {
  transform(metas: Meta[] | null, searchText: string): Meta[] {
    if (!metas) return [];
    if (!searchText || searchText.trim() === '') return metas;

    const textoNormalizado = searchText.toLowerCase().trim();
    return metas.filter(m =>
      m.descripcion.toLowerCase().includes(textoNormalizado)
    );
  }
}

/**
 * Pipe para filtrar por nivel jerárquico
 */
@Pipe({
  name: 'filterByNivel',
  standalone: true
})
export class FilterByNivelPipe implements PipeTransform {
  transform(metas: Meta[] | null, nivel: number | null): Meta[] {
    if (!metas) return [];
    if (nivel === null || nivel === undefined) return metas;

    return metas.filter(m => m.nivelJerarquia === nivel);
  }
}

/**
 * Pipe para filtrar por tipo (total, subtotal, detalle)
 */
@Pipe({
  name: 'filterByTipo',
  standalone: true
})
export class FilterByTipoPipe implements PipeTransform {
  transform(metas: Meta[] | null, tipo: 'total' | 'subtotal' | 'detalle' | 'todos' | null): Meta[] {
    if (!metas) return [];
    if (!tipo || tipo === 'todos') return metas;

    if (tipo === 'total') {
      return metas.filter(m => m.esTotal);
    } else if (tipo === 'subtotal') {
      return metas.filter(m => m.esSubtotal && !m.esTotal);
    } else {
      return metas.filter(m => !m.esTotal && !m.esSubtotal);
    }
  }
}

/**
 * Pipe para filtrar por rango de porcentaje
 */
@Pipe({
  name: 'filterByPorcentaje',
  standalone: true
})
export class FilterByPorcentajePipe implements PipeTransform {
  transform(metas: Meta[] | null, min?: number, max?: number): Meta[] {
    if (!metas) return [];

    let resultado = metas;

    if (min !== undefined) {
      resultado = resultado.filter(m => m.porcentaje >= min);
    }
    if (max !== undefined) {
      resultado = resultado.filter(m => m.porcentaje <= max);
    }

    return resultado;
  }
}

/**
 * Pipe para ordenar metas por diferentes criterios
 */
@Pipe({
  name: 'sortMetas',
  standalone: true
})
export class SortMetasPipe implements PipeTransform {
  transform(
    metas: Meta[] | null,
    criterio: 'descripcion' | 'meta' | 'ejecucion' | 'porcentaje' | 'nivel' | null,
    orden: 'asc' | 'desc' = 'asc'
  ): Meta[] {
    if (!metas || !criterio) return metas || [];

    const sorted = [...metas].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (criterio) {
        case 'descripcion':
          valorA = a.descripcion.toLowerCase();
          valorB = b.descripcion.toLowerCase();
          break;
        case 'meta':
          valorA = a.meta;
          valorB = b.meta;
          break;
        case 'ejecucion':
          valorA = a.ejecucion;
          valorB = b.ejecucion;
          break;
        case 'porcentaje':
          valorA = a.porcentaje;
          valorB = b.porcentaje;
          break;
        case 'nivel':
          valorA = a.nivelJerarquia;
          valorB = b.nivelJerarquia;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return orden === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return orden === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }
}

/**
 * Pipe para resaltar texto en búsquedas
 */
@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, searchText: string): string {
    if (!searchText || !value) {
      return value;
    }

    const regex = new RegExp(searchText, 'gi');
    return value.replace(regex, (match) => `<mark>${match}</mark>`);
  }
}
