import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeccionInfo } from '../models/seccion-info.model';

@Injectable({
  providedIn: 'root'
})
export class SeccionesInfoService {
  private basePath = 'assets/data';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las secciones de información
   */
  getSeccionesInfo(): Observable<SeccionInfo[]> {
    return this.http.get<SeccionInfo[]>(`${this.basePath}/secciones_info.json`);
  }

  /**
   * Obtiene la información de una sección específica por su ID
   */
  getSeccionInfoById(id: string): Observable<SeccionInfo | undefined> {
    return this.getSeccionesInfo().pipe(
      map(secciones => secciones.find(seccion => seccion.id === id))
    );
  }

  /**
   * Obtiene las secciones de un tab específico
   */
  getSeccionesByTab(tab: string): Observable<SeccionInfo[]> {
    return this.getSeccionesInfo().pipe(
      map(secciones => secciones.filter(seccion => seccion.tab === tab))
    );
  }
}
