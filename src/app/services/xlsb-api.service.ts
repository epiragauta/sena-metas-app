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
}
