"""
Script para exportar datos de SQLite a archivos JSON
"""
import sqlite3
import json
import os

DB_FILE = 'seguimiento_metas.db'
OUTPUT_DIR = 'datos_json'

def crear_directorio():
    """Crea el directorio de salida si no existe"""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    print(f"[OK] Directorio {OUTPUT_DIR} creado/verificado")

def exportar_metas_fpi():
    """Exporta metas de formación profesional integral"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('''
    SELECT
        id,
        descripcion,
        meta,
        ejecucion,
        ROUND((ejecucion * 100.0 / meta), 2) as porcentaje,
        es_subtotal as esSubtotal,
        es_total as esTotal,
        nivel_jerarquia as nivelJerarquia
    FROM meta_formacion_profesional_integral
    ORDER BY nivel_jerarquia DESC, descripcion
    ''')

    metas = [dict(row) for row in cursor.fetchall()]
    conn.close()

    with open(f'{OUTPUT_DIR}/metas_fpi.json', 'w', encoding='utf-8') as f:
        json.dump(metas, f, ensure_ascii=False, indent=2)

    print(f"[OK] Exportadas {len(metas)} metas FPI")
    return len(metas)

def exportar_por_nivel():
    """Exporta formación por nivel y programa"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('''
    SELECT
        id,
        nivel_formacion as nivelFormacion,
        regular_meta as regularMeta,
        regular_ejecucion as regularEjecucion,
        ROUND((regular_ejecucion * 100.0 / NULLIF(regular_meta, 0)), 2) as regularPorcentaje,
        campesena_meta as campesenaMeta,
        campesena_ejecucion as campesenaEjecucion,
        ROUND((campesena_ejecucion * 100.0 / NULLIF(campesena_meta, 0)), 2) as campesenaPorcentaje,
        full_popular_meta as fullPopularMeta,
        full_popular_ejecucion as fullPopularEjecucion,
        ROUND((full_popular_ejecucion * 100.0 / NULLIF(full_popular_meta, 0)), 2) as fullPopularPorcentaje,
        total_meta as totalMeta,
        es_total as esTotal
    FROM formacion_por_nivel_programa
    ORDER BY es_total, total_meta DESC
    ''')

    niveles = [dict(row) for row in cursor.fetchall()]
    conn.close()

    with open(f'{OUTPUT_DIR}/formacion_por_nivel.json', 'w', encoding='utf-8') as f:
        json.dump(niveles, f, ensure_ascii=False, indent=2)

    print(f"[OK] Exportados {len(niveles)} niveles de formacion")
    return len(niveles)

def exportar_programas_relevantes():
    """Exporta programas relevantes"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('''
    SELECT
        id,
        descripcion,
        meta,
        ejecucion,
        ROUND((ejecucion * 100.0 / meta), 2) as porcentaje,
        tipo
    FROM programa_relevante
    ORDER BY tipo, descripcion
    ''')

    programas = [dict(row) for row in cursor.fetchall()]
    conn.close()

    with open(f'{OUTPUT_DIR}/programas_relevantes.json', 'w', encoding='utf-8') as f:
        json.dump(programas, f, ensure_ascii=False, indent=2)

    print(f"[OK] Exportados {len(programas)} programas relevantes")
    return len(programas)

def exportar_rangos_semaforo():
    """Exporta rangos de categorización (semáforo)"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('''
    SELECT
        id,
        agrupador,
        nombre_indicador as nombreIndicador,
        mes,
        min_baja as minBaja,
        max_baja as maxBaja,
        min_vulnerable as minVulnerable,
        max_vulnerable as maxVulnerable,
        min_buena as minBuena,
        max_buena as maxBuena,
        sobreejecucion_superior_a as sobreejecucionSuperiorA
    FROM rangos_categorizacion
    ORDER BY agrupador, nombre_indicador
    ''')

    rangos = [dict(row) for row in cursor.fetchall()]
    conn.close()

    with open(f'{OUTPUT_DIR}/rangos_semaforo.json', 'w', encoding='utf-8') as f:
        json.dump(rangos, f, ensure_ascii=False, indent=2)

    print(f"[OK] Exportados {len(rangos)} rangos de semaforo")
    return len(rangos)

def exportar_metricas_adicionales():
    """Exporta métricas adicionales agrupadas por categoría"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT categoria FROM metrica_adicional ORDER BY categoria')
    categorias = [row['categoria'] for row in cursor.fetchall()]

    metricas_por_categoria = {}

    for categoria in categorias:
        cursor.execute('''
        SELECT
            id,
            nombre_metrica as nombreMetrica,
            meta,
            ejecucion,
            tipo_dato as tipoDato,
            es_total as esTotal
        FROM metrica_adicional
        WHERE categoria = ?
        ORDER BY es_total DESC, nombre_metrica
        ''', (categoria,))

        metricas_por_categoria[categoria] = [dict(row) for row in cursor.fetchall()]

    conn.close()

    with open(f'{OUTPUT_DIR}/metricas_adicionales.json', 'w', encoding='utf-8') as f:
        json.dump(metricas_por_categoria, f, ensure_ascii=False, indent=2)

    total_metricas = sum(len(m) for m in metricas_por_categoria.values())
    print(f"[OK] Exportadas {total_metricas} metricas en {len(categorias)} categorias")
    return total_metricas

def exportar_jerarquias():
    """Exporta las relaciones jerárquicas"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('''
    SELECT
        id,
        tabla_origen as tablaOrigen,
        id_padre as idPadre,
        nombre_padre as nombrePadre,
        id_hijo as idHijo,
        nombre_hijo as nombreHijo,
        tabla_hijo as tablaHijo,
        operacion
    FROM relacion_jerarquica
    ORDER BY nombre_padre, nombre_hijo
    ''')

    jerarquias = [dict(row) for row in cursor.fetchall()]
    conn.close()

    with open(f'{OUTPUT_DIR}/jerarquias.json', 'w', encoding='utf-8') as f:
        json.dump(jerarquias, f, ensure_ascii=False, indent=2)

    print(f"[OK] Exportadas {len(jerarquias)} relaciones jerarquicas")
    return len(jerarquias)

def exportar_resumen_dashboard():
    """Exporta datos para el dashboard principal"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # KPIs principales
    cursor.execute('''
    SELECT
        descripcion as titulo,
        meta,
        ejecucion,
        ROUND((ejecucion * 100.0 / meta), 2) as porcentaje,
        CASE
            WHEN ROUND((ejecucion * 100.0 / meta), 2) >= 90 THEN 'success'
            WHEN ROUND((ejecucion * 100.0 / meta), 2) >= 70 THEN 'warning'
            ELSE 'danger'
        END as estado
    FROM meta_formacion_profesional_integral
    WHERE descripcion IN (
        'TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)',
        'TOTAL FORMACION TITULADA (F = D+E)',
        'TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)',
        'EDUCACION SUPERIOR (=E)'
    )
    ''')

    kpis = [dict(row) for row in cursor.fetchall()]

    # Por modalidad
    cursor.execute('''
    SELECT
        'Regular' as modalidad,
        SUM(regular_meta) as meta,
        SUM(regular_ejecucion) as ejecucion,
        ROUND((SUM(regular_ejecucion) * 100.0 / SUM(regular_meta)), 2) as porcentaje
    FROM formacion_por_nivel_programa
    WHERE regular_meta IS NOT NULL AND es_total = 0
    UNION ALL
    SELECT
        'CampeSENA',
        SUM(campesena_meta),
        SUM(campesena_ejecucion),
        ROUND((SUM(campesena_ejecucion) * 100.0 / SUM(campesena_meta)), 2)
    FROM formacion_por_nivel_programa
    WHERE campesena_meta IS NOT NULL AND es_total = 0
    UNION ALL
    SELECT
        'Full Popular',
        SUM(full_popular_meta),
        SUM(full_popular_ejecucion),
        ROUND((SUM(full_popular_ejecucion) * 100.0 / SUM(full_popular_meta)), 2)
    FROM formacion_por_nivel_programa
    WHERE full_popular_meta IS NOT NULL AND es_total = 0
    ''')

    modalidades = [dict(row) for row in cursor.fetchall()]

    # Top 5 por cumplimiento
    cursor.execute('''
    SELECT
        descripcion,
        meta,
        ejecucion,
        ROUND((ejecucion * 100.0 / meta), 2) as porcentaje
    FROM meta_formacion_profesional_integral
    WHERE es_total = 0 AND es_subtotal = 0 AND meta > 1000
    ORDER BY porcentaje DESC
    LIMIT 5
    ''')

    top_cumplimiento = [dict(row) for row in cursor.fetchall()]

    # Top 5 con mayor brecha
    cursor.execute('''
    SELECT
        descripcion,
        meta,
        ejecucion,
        (meta - ejecucion) as brecha,
        ROUND((ejecucion * 100.0 / meta), 2) as porcentaje
    FROM meta_formacion_profesional_integral
    WHERE es_total = 0 AND es_subtotal = 0
    ORDER BY brecha DESC
    LIMIT 5
    ''')

    mayor_brecha = [dict(row) for row in cursor.fetchall()]

    conn.close()

    dashboard = {
        'kpis': kpis,
        'modalidades': modalidades,
        'topCumplimiento': top_cumplimiento,
        'mayorBrecha': mayor_brecha
    }

    with open(f'{OUTPUT_DIR}/dashboard.json', 'w', encoding='utf-8') as f:
        json.dump(dashboard, f, ensure_ascii=False, indent=2)

    print(f"[OK] Exportados datos de dashboard")
    return len(kpis)

def main():
    """Función principal"""
    print("="*80)
    print("EXPORTACION DE DATOS A JSON PARA ANGULAR")
    print("="*80)
    print()

    crear_directorio()
    print()

    total_registros = 0
    total_registros += exportar_metas_fpi()
    total_registros += exportar_por_nivel()
    total_registros += exportar_programas_relevantes()
    total_registros += exportar_rangos_semaforo()
    total_registros += exportar_metricas_adicionales()
    total_registros += exportar_jerarquias()
    total_registros += exportar_resumen_dashboard()

    # Copiar referencias_totales.json
    import shutil
    shutil.copy('referencias_totales.json', f'{OUTPUT_DIR}/referencias_totales.json')
    print("[OK] Copiado referencias_totales.json")

    print()
    print("="*80)
    print(f"EXPORTACION COMPLETADA")
    print(f"Total de registros exportados: {total_registros}")
    print(f"Archivos generados en: {OUTPUT_DIR}/")
    print("="*80)

if __name__ == '__main__':
    main()
