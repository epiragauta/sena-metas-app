import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface SheetData {
  sheet_name: string;
  total_records: number;
  returned_records: number;
  offset: number;
  limit: number | null;
  data: any[];
}

export interface FileInfo {
  file_id: string;
  original_name: string;
  sheets: string[];
  uploaded_at: string;
}

export interface FilesResponse {
  files: FileInfo[];
}

export interface SheetsResponse {
  file_id: string;
  sheets: string[];
}

export interface MetasData {
  PERIODO: string;
  COD_REGIONAL: number;
  REGIONAL: string;
  COD_CENTRO?: number;
  CENTRO?: string;
  // Educación Superior - Tecnólogos
  M_TEC_REG_PRE?: number;
  M_TEC_REG_VIR?: number;
  M_TEC_REG_A_D?: number;
  M_TEC_CAMPESE?: number;
  M_TEC_FULL_PO?: number;
  M_TECNOLOGOS?: number;
  M_EDU_SUPERIO?: number;
  // Formación Laboral - Operarios
  M_OPE_REGULAR?: number;
  M_OPE_CAMPESE?: number;
  M_OPE_FULL_PO?: number;
  M_SUB_TOT_OPE?: number;
  // Formación Laboral - Auxiliares
  M_AUX_REGULAR?: number;
  M_AUX_CAMPESE?: number;
  M_AUX_FULL_PO?: number;
  M_SUB_TOT_AUX?: number;
  // Formación Laboral - Técnicos
  M_TCO_REG_PRE?: number;
  M_TCO_REG_VIR?: number;
  M_TCO_CAMPESE?: number;
  M_TCO_FULL_PO?: number;
  M_TCO_ART_MED?: number;
  M_SUB_TCO_LAB?: number;
  // Totales Formación Laboral
  M_TOT_FOR_LAB?: number;
  // Formación Complementaria
  M_COM_CAMPESE?: number;
  M_COM_FULL_PO?: number;
  M_TOT_PROF_IN?: number;
  // Campos adicionales (pueden variar según hoja)
  [key: string]: any;
}

export interface MetasCollectionResponse {
  collection_name: string;
  total_records: number;
  returned_records: number;
  offset: number;
  limit: number | null;
  data: MetasData[];
}

export interface UploadMetasResponse {
  file_name: string;
  processing_date: string;
  collections_processed: number;
  errors: number;
  details: Array<{
    sheet_name: string;
    collection_name: string;
    records_inserted: number;
  }>;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class XlsbApiService {
  private apiUrl = 'https://sena-metas-procesador.vercel.app';

  constructor(private http: HttpClient) {}

  /**
   * Lista todos los archivos disponibles en la API
   */
  getFiles(): Observable<FileInfo[]> {
    return this.http.get<FilesResponse>(`${this.apiUrl}/files`).pipe(
      map(response => response.files)
    );
  }

  /**
   * Obtiene las hojas disponibles de un archivo
   */
  getSheets(fileId: string): Observable<string[]> {
    return this.http.get<SheetsResponse>(`${this.apiUrl}/files/${fileId}/sheets`).pipe(
      map(response => response.sheets)
    );
  }

  /**
   * Obtiene los datos de una hoja específica
   */
  getSheetData(fileId: string, sheetName: string, limit?: number, offset?: number): Observable<SheetData> {
    let url = `${this.apiUrl}/files/${fileId}/sheets/${sheetName}`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<SheetData>(url);
  }

  /**
   * Obtiene los datos de la hoja REGIONAL
   */
  getRegionalData(fileId: string): Observable<any[]> {
    return this.getSheetData(fileId, 'REGIONAL').pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene los datos de la hoja CENTROS
   */
  getCentrosData(fileId: string): Observable<any[]> {
    return this.getSheetData(fileId, 'CENTROS').pipe(
      map(response => response.data)
    );
  }

  // ========================================
  // MÉTODOS PARA CONSULTAR METAS (MongoDB)
  // ========================================

  /**
   * Obtiene metas de centros desde MongoDB
   */
  getMetasCentros(limit?: number, offset?: number): Observable<MetasData[]> {
    let url = `${this.apiUrl}/mongodb/collections/metas_fpi_centros`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene metas regionales desde MongoDB
   */
  getMetasRegional(limit?: number, offset?: number): Observable<MetasData[]> {
    let url = `${this.apiUrl}/mongodb/collections/metas_fpi_regional`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene metas de centros con response completo (incluye metadata)
   */
  getMetasCentrosWithMetadata(limit?: number, offset?: number): Observable<MetasCollectionResponse> {
    let url = `${this.apiUrl}/mongodb/collections/metas_fpi_centros`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url);
  }

  /**
   * Obtiene metas regionales con response completo (incluye metadata)
   */
  getMetasRegionalWithMetadata(limit?: number, offset?: number): Observable<MetasCollectionResponse> {
    let url = `${this.apiUrl}/mongodb/collections/metas_fpi_regional`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url);
  }

  /**
   * Obtiene metas de un centro específico por código
   */
  getMetasPorCentro(codigoCentro: number): Observable<MetasData | null> {
    return this.getMetasCentros().pipe(
      map(metas => metas.find(m => m.COD_CENTRO === codigoCentro) || null)
    );
  }

  /**
   * Obtiene metas de una regional específica por código
   */
  getMetasPorRegional(codigoRegional: number): Observable<MetasData | null> {
    return this.getMetasRegional().pipe(
      map(metas => metas.find(m => m.COD_REGIONAL === codigoRegional) || null)
    );
  }

  /**
   * Obtiene todas las metas de centros de una regional específica
   */
  getMetasCentrosPorRegional(codigoRegional: number): Observable<MetasData[]> {
    return this.getMetasCentros().pipe(
      map(metas => metas.filter(m => m.COD_REGIONAL === codigoRegional))
    );
  }

  /**
   * Sube un archivo de metas Excel al servidor
   * @param file Archivo Excel (.xlsx) con metas
   */
  uploadMetasFile(file: File): Observable<UploadMetasResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadMetasResponse>(`${this.apiUrl}/upload-metas`, formData);
  }

  // ========================================
  // MÉTODOS PARA CONSULTAR EJECUCIÓN (MongoDB)
  // ========================================

  /**
   * Obtiene datos de ejecución de centros desde MongoDB
   */
  getEjecucionCentros(limit?: number, offset?: number): Observable<any[]> {
    let url = `${this.apiUrl}/mongodb/collections/ejecucion_fpi_centros`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene datos de ejecución regionales desde MongoDB
   */
  getEjecucionRegional(limit?: number, offset?: number): Observable<any[]> {
    let url = `${this.apiUrl}/mongodb/collections/ejecucion_fpi_regional`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene datos de ejecución de un centro específico por código
   */
  getEjecucionPorCentro(codigoCentro: number): Observable<any | null> {
    return this.getEjecucionCentros().pipe(
      map(ejecucion => ejecucion.find(e => e.COD_CENTRO === codigoCentro) || null)
    );
  }

  /**
   * Obtiene datos de ejecución de una regional específica por código
   */
  getEjecucionPorRegional(codigoRegional: number): Observable<any | null> {
    return this.getEjecucionRegional().pipe(
      map(ejecucion => ejecucion.find(e => e.COD_REGIONAL === codigoRegional) || null)
    );
  }

  /**
   * Obtiene todos los datos de ejecución de centros de una regional específica
   */
  getEjecucionCentrosPorRegional(codigoRegional: number): Observable<any[]> {
    return this.getEjecucionCentros().pipe(
      map(ejecucion => ejecucion.filter(e => e.COD_REGIONAL === codigoRegional))
    );
  }

  // ========================================
  // MÉTODOS PARA CONSULTAR FIC (MongoDB)
  // ========================================

  /**
   * Obtiene datos de ejecución FIC desde MongoDB
   */
  getEjecucionFIC(limit?: number, offset?: number): Observable<any[]> {
    let url = `${this.apiUrl}/mongodb/collections/ejecucion_fpi_fic`;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MetasCollectionResponse>(url).pipe(
      map(response => response.data)
    );
  }
}
