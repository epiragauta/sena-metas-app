import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import OlMap from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import { OSM, Vector as VectorSource, Cluster } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

interface SeguimientoItem {
  categoria: string;
  subcategoria: string;
  anio: number;
  mes: number;
  cupos: number;
  ejecucion: number;
  porcentaje: number;
}

interface RegionalConSeguimiento {
  codigo: number;
  nombre: string;
  seguimiento: SeguimientoItem[];
}

@Component({
  selector: 'app-metas-regionales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metas-regionales.components.html',
  styleUrl: './metas-regionales.components.scss'
})
export class MetasRegionalesComponent implements OnInit, AfterViewInit {
  map!: OlMap;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<VectorSource>;
  vectorSourceMpios!: VectorSource;
  vectorLayerMpios!: VectorLayer<VectorSource>;
  departamentoSeleccionado: any = null;
  geojsonDataMpios: any = null;

  // Capas de centros de formación
  centrosSource!: VectorSource;
  centrosPointLayer!: VectorLayer<VectorSource>;
  centrosHeatmapLayer!: HeatmapLayer;
  centrosClusterLayer!: VectorLayer<Cluster>;

  // Datos de regionales
  regionales: RegionalConSeguimiento[] = [];
  regionalesMap = new Map<string, RegionalConSeguimiento>();

  // Lista de subcategorías disponibles para filtrar
  subcategoriasDisponibles: string[] = [];
  subcategoriaSeleccionada: string = 'TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)';

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
    this.cargarDatosRegionales();
    this.cargarMunicipios();
    this.cargarCentros();
  }

  ngAfterViewInit(): void {
    // El mapa se inicializará después de cargar los datos
  }

  cargarDatosRegionales(): void {
    this.http.get<{ regionales: RegionalConSeguimiento[] }>('assets/data/seguimiento_metas_por_regional.json')
      .subscribe({
        next: (data) => {
          this.regionales = data.regionales;

          // Crear mapa de regionales por código (con padding de ceros)
          this.regionales.forEach(regional => {
            const codigoConPadding = regional.codigo.toString().padStart(2, '0');
            this.regionalesMap.set(codigoConPadding, regional);
          });

          // Extraer subcategorías únicas de totales y subtotales
          this.extraerSubcategorias();

          // Cargar el mapa con los datos
          this.cargarDepartamentos();
        },
        error: (error) => {
          console.error('Error cargando datos de regionales:', error);
        }
      });
  }

  extraerSubcategorias(): void {
    const subcategoriasSet = new Set<string>();

    this.regionales.forEach(regional => {
      regional.seguimiento.forEach(item => {
        // Solo agregar totales y subtotales (que tienen paréntesis con letras)
        if (item.subcategoria.includes('Total') || item.subcategoria.includes('TOTAL')) {
          subcategoriasSet.add(item.subcategoria);
        }
      });
    });

    this.subcategoriasDisponibles = Array.from(subcategoriasSet).sort();
  }

  cargarDepartamentos(): void {
    this.http.get('assets/data/dptos.geojson').subscribe((data: any) => {
      // Agregar datos reales de metas a cada departamento
      data.features.forEach((feature: any) => {
        const props = feature.properties;
        const codigoDpto = props.dpto_ccdgo; // Ya viene con padding de 2 dígitos

        // Buscar la regional correspondiente
        const regional = this.regionalesMap.get(codigoDpto);

        if (regional) {
          // Buscar la subcategoría seleccionada
          const seguimiento = regional.seguimiento.find(
            s => s.subcategoria === this.subcategoriaSeleccionada
          );

          if (seguimiento) {
            props.meta = seguimiento.cupos;
            props.ejecucion = seguimiento.ejecucion;
            props.porcentaje = seguimiento.porcentaje;
          } else {
            // Si no existe esa subcategoría, usar valores por defecto
            props.meta = 0;
            props.ejecucion = 0;
            props.porcentaje = -99;
          }
        } else {
          // Regional no encontrada
          props.meta = 0;
          props.ejecucion = 0;
          props.porcentaje = 0;
        }

        props.nombre = props.dpto_cnmbr;
        props.codigo = props.dpto_ccdgo;
      });

      // Calcular estadísticas
      this.calcularEstadisticas(data.features);

      // Inicializar o actualizar el mapa
      if (!this.map) {
        this.inicializarMapa(data);
      } else {
        // Actualizar la fuente vectorial con los nuevos datos
        this.actualizarMapaConDatos(data);
      }
    });
  }

  calcularEstadisticas(features: any[]): void {
    this.estadisticas.totalDepartamentos = features.length;
    this.estadisticas.metaTotal = features.reduce((sum: number, f: any) => sum + (f.properties.meta || 0), 0);
    this.estadisticas.ejecucionTotal = features.reduce((sum: number, f: any) => sum + (f.properties.ejecucion || 0), 0);
    this.estadisticas.promedioNacional = this.estadisticas.metaTotal > 0
      ? (this.estadisticas.ejecucionTotal / this.estadisticas.metaTotal) * 100
      : 0;
  }

    cargarMunicipios(): void {
    
      this.http.get('assets/data/mpios.geojson').subscribe((data: any) => {
        this.geojsonDataMpios = data;
        // Agregar datos reales de metas a cada municipio
        // data.features.forEach((feature: any) => {
        //   const props = feature.properties;
        //   const codigoMcpio = props.mcpio_ccdgo; // Ya viene con padding de 5 dígitos
        //   const codigoDpto = props.dpto_ccdgo;

        //   // Buscar la regional correspondiente
        //   const regional = this.regionalesMap.get(codigoDpto);
        //   if (regional) {
        //     // Buscar la subcategoría seleccionada
        //     const seguimiento = regional.seguimiento.find(
        //       s => s.subcategoria === this.subcategoriaSeleccionada
        //     );  
        //     if (seguimiento) {
        //       props.meta = seguimiento.cupos;
        //       props.ejecucion = seguimiento.ejecucion;
        //       props.porcentaje = seguimiento.porcentaje;
        //     } else {
        //       // Si no existe esa subcategoría, usar valores por defecto
        //       props.meta = 0;
        //       props.ejecucion = 0;
        //       props.porcentaje = 0;
        //     }
        //   } else {
        //     // Regional no encontrada
        //     props.meta = 0;
        //     props.ejecucion = 0;
        //     props.porcentaje = 0;
        //   } 
        //   props.nombre = props.mcpio_cnmbr;
        //   props.codigo = props.mcpio_ccdgo;
        // });
      });
    }

  cargarCentros(): void {
    this.http.get('assets/data/sena_centros_aproximado.geojson').subscribe({
      next: (data: any) => {
        // Crear la fuente vectorial para los centros
        this.centrosSource = new VectorSource({
          features: new GeoJSON({
            dataProjection: 'EPSG:4686',
            featureProjection: 'EPSG:3857'
          }).readFeatures(data)
        });

        // Crear capa de puntos simples
        this.centrosPointLayer = new VectorLayer({
          source: this.centrosSource,
          style: new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: 'rgba(255, 87, 34, 0.8)' }),
              stroke: new Stroke({ color: '#fff', width: 2 })
            })
          }),
          properties: {
            title: 'Centros de Formación (Puntos)',
            visible: false
          },
          visible: false
        });

        // Crear capa de heatmap
        this.centrosHeatmapLayer = new HeatmapLayer({
          source: this.centrosSource,
          blur: 15,
          radius: 8,
          properties: {
            title: 'Centros de Formación (Mapa de Calor)',
            visible: false
          },
          visible: false
        });

        // Crear capa de cluster
        const clusterSource = new Cluster({
          distance: 40,
          source: this.centrosSource
        });

        this.centrosClusterLayer = new VectorLayer({
          source: clusterSource,
          style: (feature) => {
            const size = feature.get('features').length;
            const radius = Math.min(Math.max(size * 2 + 10, 15), 30);
            return new Style({
              image: new CircleStyle({
                radius: radius,
                fill: new Fill({ color: 'rgba(255, 87, 34, 0.7)' }),
                stroke: new Stroke({ color: '#fff', width: 2 })
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({ color: '#fff' }),
                font: 'bold 12px sans-serif'
              })
            });
          },
          properties: {
            title: 'Centros de Formación (Cluster)',
            visible: true
          },
          visible: true
        });

        // Si el mapa ya está inicializado, agregar las capas
        if (this.map) {
          this.map.addLayer(this.centrosPointLayer);
          this.map.addLayer(this.centrosHeatmapLayer);
          this.map.addLayer(this.centrosClusterLayer);
        }
      },
      error: (error) => {
        console.error('Error cargando centros de formación:', error);
      }
    });
  }

  onSubcategoriaChange(): void {
    // Recargar el mapa con la nueva subcategoría seleccionada
    this.cargarDepartamentos();
    this.vectorSourceMpios.clear();
  }

  actualizarMapaConDatos(geojsonData: any): void {
    // Limpiar fuente vectorial
    this.vectorSource.clear();

    // Leer las features del GeoJSON con las propiedades actualizadas
    const features = new GeoJSON({
      dataProjection: 'EPSG:4686',
      featureProjection: 'EPSG:3857'
    }).readFeatures(geojsonData);

    // Agregar las features actualizadas a la fuente
    this.vectorSource.addFeatures(features);

    // Forzar actualización de estilos
    this.vectorLayer.changed();
  }

  inicializarMapa(geojsonData: any): void {
    // Crear fuente vectorial vacía
    this.vectorSource = new VectorSource();

    // Crear capa vectorial con estilos
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: (feature) => this.getFeatureStyle(feature),
      properties: {
        title: 'Departamentos (Regionales) '
      }
    });

    // Crear fuente y capa para municipios
    this.vectorSourceMpios = new VectorSource();
    this.vectorLayerMpios = new VectorLayer({
      source: this.vectorSourceMpios,
      properties: {
        title: 'Municipios'
      },
      style: (feature: any) => {
        const prop = feature.getProperties();
        return new Style({          
          stroke: new Stroke({
            color: '#878784ff',
            width: .75
          }),
          text: new Text({
            text: prop.mpio_cnmbr[0] + prop.mpio_cnmbr.slice(1).toLowerCase(),
            font: 'bold 11px Calibri,sans-serif',
            fill: new Fill({
              color: '#6f6e6eff'
            }),
            stroke: new Stroke({
              color: '#e5e0e0ff',
              width: 2
            })
          })
        });
      }
    });

    // Crear capa base de OpenStreetMap
    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: {
        title: 'OpenStreetMap',
        type: 'base'
      }
    });

    // Crear mapa
    this.map = new OlMap({
      target: 'map',
      layers: [
        osmLayer,
        this.vectorLayer,
        this.vectorLayerMpios
      ],
      view: new View({
        center: fromLonLat([-74.0, 4.5]), // Centro de Colombia
        zoom: 5.65
      })
    });

    // Agregar capas de centros si ya están cargadas
    if (this.centrosPointLayer) {
      this.map.addLayer(this.centrosPointLayer);
    }
    if (this.centrosHeatmapLayer) {
      this.map.addLayer(this.centrosHeatmapLayer);
    }
    if (this.centrosClusterLayer) {
      this.map.addLayer(this.centrosClusterLayer);
    }

    // Agregar el control de Layer Switcher
    const layerSwitcher = new LayerSwitcher({
      reverse: true,
      groupSelectStyle: 'group',
      activationMode: 'click',
      startActive: false
    });
    this.map.addControl(layerSwitcher);

    // Agregar interacción de selección
    const selectInteraction = new Select({
      condition: click,
      style: (feature) => {
        this.getSelectedStyle(feature)
      },
      layers: [this.vectorLayer]
    });

    selectInteraction.on('select', (e) => {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        this.departamentoSeleccionado = feature.getProperties();
        this.actualizarCapaMunicipios();

        // Hacer zoom al extent del departamento con un 50% adicional
        const geometry = feature.getGeometry();
        if (geometry && geometry.getType().indexOf('Point') == -1) {
          const extent = geometry.getExtent();
          // Calcular el 50% adicional en cada dirección
          const width = extent[2] - extent[0];
          const height = extent[3] - extent[1];
          const paddingX = width * 0.25; // 25% en cada lado = 50% total
          const paddingY = height * 0.25; // 25% en cada lado = 50% total

          // Crear el nuevo extent con el padding
          const paddedExtent = [
            extent[0] - paddingX,
            extent[1] - paddingY,
            extent[2] + paddingX,
            extent[3] + paddingY
          ];

          // Animar el zoom al extent
          this.map.getView().fit(paddedExtent, {
            duration: 1000,
            padding: [50, 50, 50, 50]
          });
        }
      } else {
        this.departamentoSeleccionado = null;
      }
    });

    this.map.addInteraction(selectInteraction);

    // Cargar los datos iniciales en el mapa
    this.actualizarMapaConDatos(geojsonData);
  }

  getFeatureStyle(feature: any): Style {
    const properties = feature.getProperties();
    const porcentaje = properties.porcentaje || -99;

    let fillColor = '#cccccc';

    let lblPorcentaje = isNaN(porcentaje) ? 'Sin datos' : "(" + porcentaje.toFixed(2) + '%)';  
    if (porcentaje < 70 && porcentaje >= 0) {
      fillColor = 'rgba(255, 0, 0, 0.5)'; // Rojo
    } else if (porcentaje < 85 && porcentaje >= 70) {
      fillColor = 'rgba(255, 255, 0, 0.43)'; // Amarillo
    } else if (porcentaje <= 100 && porcentaje >= 85) {
      fillColor = 'rgba(146, 208, 80, 0.38)'; // Verde
    } else if (porcentaje > 100) {
      fillColor = 'rgba(255, 191, 0, 0.33)'; // Naranja (sobreejecución)
    }else{
      fillColor = 'rgba(200, 200, 200, 0.25)'; // Gris para sin datos
      lblPorcentaje = '';
    }


    return new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        color: '#878383ff',
        width: 1.5
      }),
      text: new Text({
        text: (properties.dpto_cnmbr[0] + properties.dpto_cnmbr.slice(1).toLowerCase()) + "  \n " + lblPorcentaje ,
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

    if (porcentaje < 70 && porcentaje >= 0) {
      fillColor = 'rgba(255, 0, 0, 0.62)';
    } else if (porcentaje < 85 && porcentaje >= 70) {
      fillColor = 'rgba(255, 255, 0, 0.63)';
    } else if (porcentaje <= 100 && porcentaje >= 85) {
      fillColor = 'rgba(146, 208, 80, 0.6)';
    } else if (porcentaje > 100) {
      fillColor = 'rgba(255, 191, 0, 0.58)';
    } else {
      fillColor = 'rgba(200, 200, 200, 0.25)'; // Gris para sin datos
      
    }

    return new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        color: '#f1ed0cff',
        width: 3
      }),
      text: new Text({
        text: properties.dpto_cnmbr[0] + properties.dpto_cnmbr.slice(1).toLowerCase(),
        font: 'bold 12px Calibri,sans-serif',
        fill: new Fill({
          color: '#555454ff'
        }),
        stroke: new Stroke({
          color: '#e5e0e0ff',
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

  actualizarCapaMunicipios(): void {
    if (!this.geojsonDataMpios) return;
    // Limpiar fuente vectorial de municipios
    this.vectorSourceMpios.clear();
    // Filtrar y agregar municipios del departamento seleccionado
    const filteredFeatures = this.geojsonDataMpios.features.filter((feature: any) => {
      return feature.properties.dpto_ccdgo === this.departamentoSeleccionado.dpto_ccdgo;
    });
    const features = new GeoJSON({
      dataProjection: 'EPSG:4686',
      featureProjection: 'EPSG:3857'
    }).readFeatures({ type: 'FeatureCollection', features: filteredFeatures });
    this.vectorSourceMpios.addFeatures(features);
    this.vectorLayerMpios.changed();
  }
    
}
