import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

@Component({
  selector: 'app-metas-regionales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metas-regionales-container">
      <div class="page-header">
        <div class="page-title">Metas Regionales por Departamento</div>
        <div class="page-subtitle">Mapa interactivo de cumplimiento de metas en Colombia</div>
      </div>

      <div class="row">
        <!-- Mapa -->
        <div class="col-8">
          <div class="card">
            <div class="card-body" style="padding: 0;">
              <div id="map" style="width: 100%; height: 600px;"></div>
            </div>
            <div class="card-footer" style="background-color: #f5f5f5; padding: 10px;">
              <small class="text-muted">
                <strong>Instrucciones:</strong> Haz clic en un departamento para ver sus detalles
              </small>
            </div>
          </div>
        </div>

        <!-- Panel de Información -->
        <div class="col-4">
          <div class="card" *ngIf="departamentoSeleccionado">
            <div class="card-header">
              <h4>{{ departamentoSeleccionado.nombre }}</h4>
            </div>
            <div class="card-body">
              <div class="info-item">
                <label>Código:</label>
                <span>{{ departamentoSeleccionado.codigo }}</span>
              </div>

              <div class="info-item mt-3">
                <label>Cumplimiento:</label>
                <div class="kpi-percentage" [ngClass]="getClasePorcentaje(departamentoSeleccionado.porcentaje)">
                  {{ departamentoSeleccionado.porcentaje }}%
                </div>
              </div>

              <div class="progress mt-2">
                <div class="progress-bar"
                     [ngClass]="getClasePorcentaje(departamentoSeleccionado.porcentaje)"
                     [style.width.%]="departamentoSeleccionado.porcentaje">
                </div>
              </div>

              <div class="info-item mt-3">
                <label>Meta:</label>
                <span class="value-large">{{ departamentoSeleccionado.meta | number }}</span>
              </div>

              <div class="info-item mt-2">
                <label>Ejecución:</label>
                <span class="value-medium">{{ departamentoSeleccionado.ejecucion | number }}</span>
              </div>

              <div class="info-item mt-2">
                <label>Brecha:</label>
                <span class="value-medium" [style.color]="departamentoSeleccionado.meta - departamentoSeleccionado.ejecucion > 0 ? '#f44336' : '#4caf50'">
                  {{ departamentoSeleccionado.meta - departamentoSeleccionado.ejecucion | number }}
                </span>
              </div>

              <div class="mt-3">
                <span class="badge" [ngClass]="'badge-' + getClasePorcentaje(departamentoSeleccionado.porcentaje)">
                  {{ getEstadoTexto(departamentoSeleccionado.porcentaje) }}
                </span>
              </div>
            </div>
          </div>

          <div class="card mt-3" *ngIf="!departamentoSeleccionado">
            <div class="card-body text-center" style="padding: 40px;">
              <i class="fa fa-map-marker-alt" style="font-size: 3rem; color: #ccc;"></i>
              <p class="mt-3 text-muted">Selecciona un departamento en el mapa para ver sus detalles</p>
            </div>
          </div>

          <!-- Leyenda -->
          <div class="card mt-3">
            <div class="card-header">
              <h5>Leyenda</h5>
            </div>
            <div class="card-body">
              <div class="legend-item">
                <span class="legend-color" style="background-color: #ff0000;"></span>
                <span>Bajo (&lt; 70%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #FFFF00;"></span>
                <span>Vulnerable (70% - 85%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #92D050;"></span>
                <span>Buena (85% - 100%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #FFC000;"></span>
                <span>Sobreejecución (&gt; 100%)</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas Generales -->
          <div class="card mt-3">
            <div class="card-header">
              <h5>Estadísticas Generales</h5>
            </div>
            <div class="card-body">
              <div class="stat-item">
                <label>Total Departamentos:</label>
                <span>{{ estadisticas.totalDepartamentos }}</span>
              </div>
              <div class="stat-item">
                <label>Meta Total:</label>
                <span>{{ estadisticas.metaTotal | number }}</span>
              </div>
              <div class="stat-item">
                <label>Ejecución Total:</label>
                <span>{{ estadisticas.ejecucionTotal | number }}</span>
              </div>
              <div class="stat-item">
                <label>Cumplimiento Promedio:</label>
                <span class="badge" [ngClass]="'badge-' + getClasePorcentaje(estadisticas.promedioNacional)">
                  {{ estadisticas.promedioNacional | number:'1.2-2' }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metas-regionales-container {
      padding: 20px;
    }

    #map {
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item span {
      font-weight: 500;
      color: #333;
    }

    .value-large {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--sena-naranja);
    }

    .value-medium {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--sena-gris-oscuro);
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .legend-color {
      width: 30px;
      height: 20px;
      border-radius: 4px;
      margin-right: 10px;
      border: 1px solid #ccc;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.85rem;
    }

    .stat-item span {
      font-weight: 500;
      color: #333;
      font-size: 0.85rem;
    }

    .kpi-percentage {
      font-size: 2rem;
      font-weight: bold;
      margin: 10px 0;
    }

    .success {
      color: #92D050;
    }

    .warning {
      color: #FFFF00;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    .danger {
      color: #ff0000;
    }
  `]
})
export class MetasRegionalesComponent implements OnInit, AfterViewInit {
  map!: Map;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<VectorSource>;
  departamentoSeleccionado: any = null;

  estadisticas = {
    totalDepartamentos: 0,
    metaTotal: 0,
    ejecucionTotal: 0,
    promedioNacional: 0
  };

  constructor(private http: HttpClient) {
    // Registrar la proyección EPSG:4686 (MAGNA-SIRGAS Colombia)
    proj4.defs('EPSG:4686', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
    register(proj4);
  }

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  cargarDepartamentos(): void {
    this.http.get('assets/data/dptos.geojson').subscribe((data: any) => {
      // Agregar datos de metas a cada departamento
      data.features.forEach((feature: any) => {
        const props = feature.properties;
        // Generar datos de ejemplo basados en el código del departamento
        const codigo = parseInt(props.dpto_ccdgo);
        const meta = 100000 + (codigo * 10000);
        const ejecucion = Math.floor(meta * (0.75 + Math.random() * 0.3));

        props.meta = meta;
        props.ejecucion = ejecucion;
        props.porcentaje = parseFloat(((ejecucion / meta) * 100).toFixed(2));
        props.nombre = props.dpto_cnmbr;
        props.codigo = props.dpto_ccdgo;
      });

      // Calcular estadísticas
      this.estadisticas.totalDepartamentos = data.features.length;
      this.estadisticas.metaTotal = data.features.reduce((sum: number, f: any) => sum + f.properties.meta, 0);
      this.estadisticas.ejecucionTotal = data.features.reduce((sum: number, f: any) => sum + f.properties.ejecucion, 0);
      this.estadisticas.promedioNacional = (this.estadisticas.ejecucionTotal / this.estadisticas.metaTotal) * 100;
    });
  }

  inicializarMapa(): void {
    // Crear fuente vectorial con GeoJSON y transformar proyección
    this.vectorSource = new VectorSource({
      url: 'assets/data/dptos.geojson',
      format: new GeoJSON({
        dataProjection: 'EPSG:4686',  // Proyección origen (MAGNA-SIRGAS)
        featureProjection: 'EPSG:3857' // Proyección destino (Web Mercator)
      })
    });

    // Crear capa vectorial con estilos
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: (feature) => this.getFeatureStyle(feature)
    });

    // Crear mapa
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([-74.0, 4.5]), // Centro de Colombia
        zoom: 6
      })
    });

    // Agregar interacción de selección
    const selectInteraction = new Select({
      condition: click,
      style: (feature) => this.getSelectedStyle(feature)
    });

    selectInteraction.on('select', (e) => {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        this.departamentoSeleccionado = feature.getProperties();
      } else {
        this.departamentoSeleccionado = null;
      }
    });

    this.map.addInteraction(selectInteraction);
  }

  getFeatureStyle(feature: any): Style {
    const properties = feature.getProperties();
    const porcentaje = properties.porcentaje || 0;

    let fillColor = '#cccccc';

    if (porcentaje < 70) {
      fillColor = 'rgba(255, 0, 0, 0.6)'; // Rojo
    } else if (porcentaje < 85) {
      fillColor = 'rgba(255, 255, 0, 0.6)'; // Amarillo
    } else if (porcentaje <= 100) {
      fillColor = 'rgba(146, 208, 80, 0.6)'; // Verde
    } else {
      fillColor = 'rgba(255, 192, 0, 0.6)'; // Naranja (sobreejecución)
    }

    return new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        color: '#ffffff',
        width: 2
      }),
      text: new Text({
        text: properties.nombre || '',
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: '#000'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        })
      })
    });
  }

  getSelectedStyle(feature: any): Style {
    const properties = feature.getProperties();
    const porcentaje = properties.porcentaje || 0;

    let fillColor = '#cccccc';

    if (porcentaje < 70) {
      fillColor = 'rgba(255, 0, 0, 0.9)';
    } else if (porcentaje < 85) {
      fillColor = 'rgba(255, 255, 0, 0.9)';
    } else if (porcentaje <= 100) {
      fillColor = 'rgba(146, 208, 80, 0.9)';
    } else {
      fillColor = 'rgba(255, 192, 0, 0.9)';
    }

    return new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        color: '#FF5722',
        width: 4
      }),
      text: new Text({
        text: properties.nombre || '',
        font: 'bold 14px Calibri,sans-serif',
        fill: new Fill({
          color: '#000'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 4
        })
      })
    });
  }

  getClasePorcentaje(porcentaje: number): string {
    if (porcentaje >= 85) return 'success';
    if (porcentaje >= 70) return 'warning';
    return 'danger';
  }

  getEstadoTexto(porcentaje: number): string {
    if (porcentaje > 100) return 'Sobreejecución';
    if (porcentaje >= 85) return 'Buena';
    if (porcentaje >= 70) return 'Vulnerable';
    return 'Bajo';
  }
}
