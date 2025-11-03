"""
Script para generar archivo JSON con referencias de totales y agregaciones
Adaptado para la estructura desagregada por regional
"""

import sqlite3
import json

DB_FILE = "seguimiento_metas.db"
JSON_OUTPUT = "referencias_totales.json"


def extraer_referencias():
    """Extrae todas las referencias de totales y agregaciones"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    referencias = {
        "version": "1.0",
        "periodo": "2025_09",
        "descripcion": "Referencias de totales y agregaciones para seguimiento de metas SENA",
        "regionales": [],
        "jerarquias": {},
        "totales": {},
        "calculos": {},
    }

    # 0. Extraer listado de regionales
    cursor.execute("""
    SELECT id, codigo_regional, nombre
    FROM regional
    ORDER BY codigo_regional
    """)

    regionales = []
    for row in cursor.fetchall():
        regionales.append(
            {"id": row["id"], "codigo": row["codigo_regional"], "nombre": row["nombre"]}
        )

    referencias["regionales"] = regionales

    # 1. Extraer descripciones de metas
    cursor.execute("""
    SELECT id, descripcion
    FROM descripcion_meta
    ORDER BY descripcion
    """)

    descripciones_metas = {}
    for row in cursor.fetchall():
        descripciones_metas[row["id"]] = row["descripcion"]

    # 2. Extraer jerarquías de relaciones (adaptadas para la nueva estructura)
    cursor.execute("""
    SELECT DISTINCT
        nombre_padre,
        GROUP_CONCAT(nombre_hijo, '|') as hijos
    FROM relacion_jerarquica
    WHERE tabla_origen = 'meta_formacion_profesional_integral'
    GROUP BY nombre_padre
    """)

    for row in cursor.fetchall():
        nombre_padre = row["nombre_padre"]
        hijos = row["hijos"].split("|") if row["hijos"] else []

        referencias["jerarquias"][nombre_padre] = {
            "tipo": "suma",
            "componentes": hijos,
            "tabla": "meta_formacion_profesional_integral",
        }

    # 3. Identificar totales y subtotales en FPI por regional
    cursor.execute("""
    SELECT
        mfpi.id,
        dm.descripcion,
        mfpi.es_subtotal,
        mfpi.es_total,
        mfpi.nivel_jerarquia,
        mfpi.id_regional,
        r.codigo_regional,
        SUM(mfpi.meta) as meta_total,
        SUM(mfpi.ejecucion) as ejecucion_total
    FROM meta_formacion_profesional_integral mfpi
    JOIN descripcion_meta dm ON mfpi.id_descripcion = dm.id
    JOIN regional r ON mfpi.id_regional = r.id
    WHERE mfpi.es_subtotal = 1 OR mfpi.es_total = 1
    GROUP BY dm.descripcion, mfpi.es_subtotal, mfpi.es_total, mfpi.nivel_jerarquia, r.codigo_regional
    ORDER BY mfpi.nivel_jerarquia, dm.descripcion
    """)

    fpi_totales = []
    for row in cursor.fetchall():
        fpi_totales.append(
            {
                "id": row["id"],
                "descripcion": row["descripcion"],
                "es_subtotal": bool(row["es_subtotal"]),
                "es_total": bool(row["es_total"]),
                "nivel_jerarquia": row["nivel_jerarquia"],
                "regional": row["codigo_regional"],
                "meta": row["meta_total"],
                "ejecucion": row["ejecucion_total"],
            }
        )

    referencias["totales"]["formacion_profesional_integral"] = fpi_totales

    # 4. Totales de formación por nivel
    cursor.execute("""
    SELECT
        id,
        nivel_formacion,
        regular_meta,
        regular_ejecucion,
        campesena_meta,
        campesena_ejecucion,
        full_popular_meta,
        full_popular_ejecucion,
        total_meta,
        es_total
    FROM formacion_por_nivel_programa
    WHERE es_total = 1
    ORDER BY nivel_formacion
    """)

    nivel_totales = []
    for row in cursor.fetchall():
        nivel_totales.append(
            {
                "id": row["id"],
                "nivel_formacion": row["nivel_formacion"],
                "componentes": {
                    "regular": {
                        "meta": row["regular_meta"],
                        "ejecucion": row["regular_ejecucion"],
                    },
                    "campesena": {
                        "meta": row["campesena_meta"],
                        "ejecucion": row["campesena_ejecucion"],
                    },
                    "full_popular": {
                        "meta": row["full_popular_meta"],
                        "ejecucion": row["full_popular_ejecucion"],
                    },
                },
                "total_meta": row["total_meta"],
            }
        )

    referencias["totales"]["formacion_por_nivel_programa"] = nivel_totales

    # 5. Métricas adicionales que son totales
    cursor.execute("""
    SELECT DISTINCT
        categoria,
        COUNT(*) as cantidad_metricas
    FROM metrica_adicional
    GROUP BY categoria
    ORDER BY categoria
    """)

    categorias = {}
    for row in cursor.fetchall():
        categoria = row["categoria"]

        cursor.execute(
            """
        SELECT
            id,
            nombre_metrica,
            meta,
            ejecucion,
            tipo_dato,
            es_total
        FROM metrica_adicional
        WHERE categoria = ?
        ORDER BY es_total DESC, nombre_metrica
        """,
            (categoria,),
        )

        metricas = []
        for metrica_row in cursor.fetchall():
            metricas.append(
                {
                    "id": metrica_row["id"],
                    "nombre": metrica_row["nombre_metrica"],
                    "meta": metrica_row["meta"],
                    "ejecucion": metrica_row["ejecucion"],
                    "tipo_dato": metrica_row["tipo_dato"],
                    "es_total": bool(metrica_row["es_total"]),
                }
            )

        categorias[categoria] = metricas

    referencias["totales"]["metricas_adicionales"] = categorias

    # 6. Calculos especiales conocidos
    referencias["calculos"]["formulas_conocidas"] = {
        "EDUCACION SUPERIOR (=E)": {
            "formula": "SubTotal Tecnólogos ( E)",
            "descripcion": "Educación Superior es igual al Subtotal de Tecnólogos",
        },
        "TOTAL FORMACIÓN LABORAL (D=A+B+C+T)": {
            "formula": "SubTotal Auxiliares (A) + SubTotal Operarios (B) + SubTotal Técnico Laboral (C) + Profundización Técnica (T)",
            "componentes": [
                "SubTotal Auxiliares (A)",
                "SubTotal Operarios (B)",
                "SubTotal Técnico Laboral (C)",
                "Profundización Técnica (T)",
            ],
        },
        "TOTAL FORMACION TITULADA (F = D+E)": {
            "formula": "TOTAL FORMACIÓN LABORAL (D=A+B+C+T) + EDUCACION SUPERIOR (=E)",
            "componentes": [
                "TOTAL FORMACIÓN LABORAL (D=A+B+C+T)",
                "EDUCACION SUPERIOR (=E)",
            ],
        },
        "SubTotal Programa de Bilingüismo (K = I + J)": {
            "formula": "Programa de Bilingüismo - Virtual (I) + Programa de Bilingüismo - Presencial (J)",
            "componentes": [
                "Programa de Bilingüismo - Virtual (I)",
                "Programa de Bilingüismo - Presencial (J)",
            ],
        },
        "TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)": {
            "formula": "Formación Complementaria - Virtual (G) + Formación Complementaria - Presencial (H) + SubTotal Programa de Bilingüismo (K) + Formación Complementaria CampeSENA (L) + Formación Complementaria Full Popular (M)",
            "componentes": [
                "Formación Complementaria - Virtual  (Sin Bilingüismo) (G)",
                "Formación Complementaria - Presencial (Sin Bilingüismo) (H)",
                "SubTotal Programa de Bilingüismo (K = I + J)",
                "Formación Complementaria CampeSENA (L)",
                "Formación Complementaria Full Popular (M)",
            ],
        },
        "TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)": {
            "formula": "TOTAL FORMACION TITULADA (F = D+E) + TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)",
            "componentes": [
                "TOTAL FORMACION TITULADA (F = D+E)",
                "TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)",
            ],
        },
    }

    # 7. Mapeo de programas especiales
    cursor.execute("""
    SELECT descripcion, meta, ejecucion, tipo
    FROM programa_relevante
    ORDER BY tipo, descripcion
    """)

    programas_especiales = []
    for row in cursor.fetchall():
        programas_especiales.append(
            {
                "descripcion": row["descripcion"],
                "meta": row["meta"],
                "ejecucion": row["ejecucion"],
                "tipo": row["tipo"],
            }
        )

    referencias["programas_especiales"] = programas_especiales

    # 8. Indicadores transversales
    referencias["indicadores_transversales"] = {
        "CampeSENA": {
            "tablas": [
                "meta_formacion_profesional_integral",
                "formacion_por_nivel_programa",
                "programa_relevante",
                "metrica_adicional",
            ],
            "descripcion": "Indicadores relacionados con la estrategia CampeSENA aparecen en múltiples tablas",
        },
        "Full Popular": {
            "tablas": [
                "meta_formacion_profesional_integral",
                "formacion_por_nivel_programa",
                "programa_relevante",
                "metrica_adicional",
            ],
            "descripcion": "Indicadores relacionados con Full Popular aparecen en múltiples tablas",
        },
        "Virtual": {
            "tablas": ["meta_formacion_profesional_integral", "programa_relevante"],
            "descripcion": "Formación Virtual se reporta de manera agregada en programas relevantes",
        },
    }

    # 9. Información de desagregación por regional
    referencias["desagregacion_regional"] = {
        "descripcion": "Las metas de formación profesional integral están desagregadas por regional",
        "total_regionales": len(regionales),
        "tabla_datos": "meta_formacion_profesional_integral",
        "relaciones": {
            "regional": "regional.id",
            "descripcion": "descripcion_meta.id",
            "datos": "meta_formacion_profesional_integral",
        },
    }

    conn.close()

    return referencias


def main():
    """Función principal"""
    print("Generando referencias de totales y agregaciones...\n")

    referencias = extraer_referencias()

    # Guardar JSON
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(referencias, f, ensure_ascii=False, indent=2)

    print(f"[OK] Archivo JSON generado: {JSON_OUTPUT}")
    print("\nEstadisticas:")
    print(f"  - Regionales procesadas: {len(referencias['regionales'])}")
    print(f"  - Jerarquias definidas: {len(referencias['jerarquias'])}")
    print(
        f"  - Totales FPI: {len(referencias['totales']['formacion_profesional_integral'])}"
    )
    print(
        f"  - Totales por nivel: {len(referencias['totales']['formacion_por_nivel_programa'])}"
    )
    print(
        f"  - Categorias de metricas: {len(referencias['totales']['metricas_adicionales'])}"
    )
    print(f"  - Programas especiales: {len(referencias['programas_especiales'])}")
    print(
        f"  - Formulas conocidas: {len(referencias['calculos']['formulas_conocidas'])}"
    )


if __name__ == "__main__":
    main()
