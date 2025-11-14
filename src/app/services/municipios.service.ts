import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface InformeMunicipio {
  'CAMPESENA FEMENINOS': string | null;
  'CAMPESENA MASCULINOS': string | null;
  'CAMPESENA NO_BINARIO': string | null;
  'CODIGO DEPARTAMENTO': number;
  'CODIGO MUNICIPIO': number;
  'FORMACION REGULAR FEMENINOS': string | null;
  'FORMACION REGULAR MASCULINOS': string | null;
  'FORMACION REGULAR NO_BINARIO': string | null;
  'FULL POPULAR FEMENINOS': string | null;
  'FULL POPULAR MASCULINOS': string | null;
  'FULL POPULAR NO_BINARIO': string | null;
  'GRAN TOTAL': number;
  'GRAN TOTAL FEMENINOS': number;
  'GRAN TOTAL MASCULINOS': number;
  'GRAN TOTAL NO BINARIO': string | null;
  'MODALIDAD FORMACION': string;
  'NIVEL FORMACION': string;
  'NOMBRE DEPARTAMENTO': string;
  'NOMBRE MUNICIPIO': string;
  'RURALIDAD': string;
  'TIPO DE FORMACION': string;
  'TOTAL CAMPESENA': string | null;
  'TOTAL FORMACION REGULAR': string | null;
  'TOTAL FULL POPULAR': string | null;
}

export interface DatosMunicipioAgrupados {
  codigoMunicipio: string;
  nombreMunicipio: string;
  nombreDepartamento: string;
  ruralidad: string;
  totalGeneral: number;
  totalFemeninos: number;
  totalMasculinos: number;
  totalNoBinario: number;
  totalCampesena: number;
  totalFormacionRegular: number;
  totalFullPopular: number;
  detallesPorTipo: {
    tipoFormacion: string;
    nivelFormacion: string;
    modalidadFormacion: string;
    total: number;
    femeninos: number;
    masculinos: number;
    noBinario: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class MunicipiosService {
  private datosCache: InformeMunicipio[] | null = null;
  private datosPorMunicipioCache = new Map<string, DatosMunicipioAgrupados>();

  constructor(private http: HttpClient) {}

  /**
   * Carga los datos del archivo JSON
   */
  cargarDatos(): Observable<InformeMunicipio[]> {
    if (this.datosCache) {
      return new Observable(observer => {
        observer.next(this.datosCache!);
        observer.complete();
      });
    }

    return this.http.get<InformeMunicipio[]>('assets/data/informe_departamento_municipio.json')
      .pipe(
        map(datos => {
          this.datosCache = datos;
          this.procesarDatos(datos);
          return datos;
        })
      );
  }

  /**
   * Procesa los datos y los agrupa por municipio
   */
  private procesarDatos(datos: InformeMunicipio[]): void {
    this.datosPorMunicipioCache.clear();

    datos.forEach(item => {
      const codigoMunicipio = this.generarCodigoMunicipio(
        item['CODIGO DEPARTAMENTO'],
        item['CODIGO MUNICIPIO']
      );

      if (!this.datosPorMunicipioCache.has(codigoMunicipio)) {
        this.datosPorMunicipioCache.set(codigoMunicipio, {
          codigoMunicipio,
          nombreMunicipio: item['NOMBRE MUNICIPIO'],
          nombreDepartamento: item['NOMBRE DEPARTAMENTO'],
          ruralidad: item['RURALIDAD'],
          totalGeneral: 0,
          totalFemeninos: 0,
          totalMasculinos: 0,
          totalNoBinario: 0,
          totalCampesena: 0,
          totalFormacionRegular: 0,
          totalFullPopular: 0,
          detallesPorTipo: []
        });
      }

      const municipioData = this.datosPorMunicipioCache.get(codigoMunicipio)!;

      // Acumular totales
      municipioData.totalGeneral += item['GRAN TOTAL'] || 0;
      municipioData.totalFemeninos += item['GRAN TOTAL FEMENINOS'] || 0;
      municipioData.totalMasculinos += item['GRAN TOTAL MASCULINOS'] || 0;
      municipioData.totalNoBinario += this.parseNumber(item['GRAN TOTAL NO BINARIO']);
      municipioData.totalCampesena += this.parseNumber(item['TOTAL CAMPESENA']);
      municipioData.totalFormacionRegular += this.parseNumber(item['TOTAL FORMACION REGULAR']);
      municipioData.totalFullPopular += this.parseNumber(item['TOTAL FULL POPULAR']);

      // Agregar detalle
      municipioData.detallesPorTipo.push({
        tipoFormacion: item['TIPO DE FORMACION'],
        nivelFormacion: item['NIVEL FORMACION'],
        modalidadFormacion: item['MODALIDAD FORMACION'],
        total: item['GRAN TOTAL'] || 0,
        femeninos: item['GRAN TOTAL FEMENINOS'] || 0,
        masculinos: item['GRAN TOTAL MASCULINOS'] || 0,
        noBinario: this.parseNumber(item['GRAN TOTAL NO BINARIO'])
      });
    });
  }

  /**
   * Genera el código de municipio concatenando departamento y municipio
   * con padding de ceros
   */
  generarCodigoMunicipio(codigoDepartamento: number, codigoMunicipio: number): string {
    const deptoPadded = codigoDepartamento.toString().padStart(2, '0');
    const mpioPadded = codigoMunicipio.toString().padStart(3, '0');
    return deptoPadded + mpioPadded;
  }

  /**
   * Obtiene los datos agregados de un municipio por su código
   */
  obtenerDatosMunicipio(mpioCdpmp: string): DatosMunicipioAgrupados | null {
    return this.datosPorMunicipioCache.get(mpioCdpmp) || null;
  }

  /**
   * Obtiene todos los datos sin procesar de un municipio
   */
  obtenerDatosDetalladosMunicipio(mpioCdpmp: string): InformeMunicipio[] {
    if (!this.datosCache) return [];

    return this.datosCache.filter(item => {
      const codigo = this.generarCodigoMunicipio(
        item['CODIGO DEPARTAMENTO'],
        item['CODIGO MUNICIPIO']
      );
      return codigo === mpioCdpmp;
    });
  }

  /**
   * Convierte un string a número, manejando valores null, undefined, y "-"
   */
  private parseNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '-') {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value.replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Verifica si hay datos disponibles para un municipio
   */
  tieneDatosMunicipio(mpioCdpmp: string): boolean {
    return this.datosPorMunicipioCache.has(mpioCdpmp);
  }

  /**
   * Obtiene la lista de todos los códigos de municipios con datos
   */
  obtenerCodigosMunicipiosConDatos(): string[] {
    return Array.from(this.datosPorMunicipioCache.keys());
  }
}
