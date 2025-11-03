"""
Script para importar datos de seguimiento de metas desde archivo ODS a SQLite
con esquema normalizado y desagregación por regional
"""

import pandas as pd
import sqlite3
import json
from datetime import datetime

# Configuración
ODS_FILE = "seguimiento_metas_2025_09.ods"
DB_FILE = "seguimiento_metas.db"


def crear_esquema(conn):
    """Crea el esquema normalizado de la base de datos con desagregación regional"""
    cursor = conn.cursor()

    # Tabla de regionales
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS regional (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_regional VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(200)
    )
    """)

    # Tabla de descripciones de metas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS descripcion_meta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion VARCHAR(500) UNIQUE NOT NULL
    )
    """)

    # Tabla principal de metas desagregadas por regional
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meta_formacion_profesional_integral (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_descripcion INTEGER NOT NULL,
        id_regional INTEGER NOT NULL,
        meta INTEGER NOT NULL,
        ejecucion INTEGER NOT NULL,
        es_subtotal BOOLEAN DEFAULT 0,
        es_total BOOLEAN DEFAULT 0,
        nivel_jerarquia INTEGER DEFAULT 0,
        periodo VARCHAR(50) DEFAULT '2025_09',
        FOREIGN KEY(id_descripcion) REFERENCES descripcion_meta(id),
        FOREIGN KEY(id_regional) REFERENCES regional(id),
        UNIQUE(id_descripcion, id_regional, periodo)
    )
    """)

    # Tabla de categorías de semáforo
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categoria_semaforo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) UNIQUE NOT NULL
    )
    """)

    # Tabla de rangos de categorización por indicador
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rangos_categorizacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agrupador VARCHAR(200) NOT NULL,
        nombre_indicador VARCHAR(500) NOT NULL,
        mes VARCHAR(50) NOT NULL,
        min_baja DECIMAL(10,4),
        max_baja DECIMAL(10,4),
        min_vulnerable DECIMAL(10,4),
        max_vulnerable DECIMAL(10,4),
        min_buena DECIMAL(10,4),
        max_buena DECIMAL(10,4),
        sobreejecucion_superior_a DECIMAL(10,4),
        UNIQUE(nombre_indicador, mes)
    )
    """)

    # Tabla de tipos de formación
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tipo_formacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) UNIQUE NOT NULL,
        es_subtotal BOOLEAN DEFAULT 0,
        es_total BOOLEAN DEFAULT 0,
        nivel VARCHAR(100),
        modalidad VARCHAR(100)
    )
    """)

    # Tabla de modalidades
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS modalidad (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) UNIQUE NOT NULL
    )
    """)

    # Tabla de programas especiales
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programa_especial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) UNIQUE NOT NULL,
        tipo VARCHAR(100)
    )
    """)

    # Tabla de formación por nivel y programa
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS formacion_por_nivel_programa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nivel_formacion VARCHAR(200) NOT NULL,
        regular_meta INTEGER,
        regular_ejecucion INTEGER,
        campesena_meta INTEGER,
        campesena_ejecucion INTEGER,
        full_popular_meta INTEGER,
        full_popular_ejecucion INTEGER,
        total_meta INTEGER NOT NULL,
        es_total BOOLEAN DEFAULT 0,
        periodo VARCHAR(50) DEFAULT '2025_09',
        UNIQUE(nivel_formacion, periodo)
    )
    """)

    # Tabla de programas relevantes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programa_relevante (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion VARCHAR(500) NOT NULL,
        meta INTEGER NOT NULL,
        ejecucion INTEGER NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        periodo VARCHAR(50) DEFAULT '2025_09',
        UNIQUE(descripcion, periodo)
    )
    """)

    # Tabla de métricas adicionales
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS metrica_adicional (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria VARCHAR(200) NOT NULL,
        nombre_metrica VARCHAR(500) NOT NULL,
        meta DECIMAL(12,4),
        ejecucion DECIMAL(12,4),
        tipo_dato VARCHAR(50) DEFAULT 'numero',
        es_total BOOLEAN DEFAULT 0,
        formula_calculo TEXT,
        periodo VARCHAR(50) DEFAULT '2025_09',
        UNIQUE(categoria, nombre_metrica, periodo)
    )
    """)

    # Tabla de poblaciones vulnerables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS poblacion_vulnerable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) NOT NULL,
        meta INTEGER,
        ejecucion INTEGER,
        es_subtotal BOOLEAN DEFAULT 0,
        es_total BOOLEAN DEFAULT 0,
        categoria VARCHAR(100),
        periodo VARCHAR(50) DEFAULT '2025_09',
        UNIQUE(nombre, periodo)
    )
    """)

    # Tabla de relaciones jerárquicas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS relacion_jerarquica (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tabla_origen VARCHAR(100) NOT NULL,
        id_padre INTEGER NOT NULL,
        nombre_padre VARCHAR(500) NOT NULL,
        id_hijo INTEGER NOT NULL,
        nombre_hijo VARCHAR(500) NOT NULL,
        tabla_hijo VARCHAR(100) NOT NULL,
        operacion VARCHAR(20) DEFAULT 'suma'
    )
    """)

    conn.commit()
    print("[OK] Esquema de base de datos creado")


def identificar_tipo_registro(nombre):
    """Identifica si un registro es subtotal, total o detalle"""
    nombre_lower = nombre.lower()

    es_subtotal = any(x in nombre_lower for x in ["subtotal", "sub total", "sub-total"])
    es_total = any(
        x in nombre_lower for x in ["total ", " total", "total\t", "\ttotal"]
    )

    return es_subtotal, es_total


def extraer_descripciones_de_headers(df):
    """
    Extrae las descripciones de metas de las columnas
    Fila 1 (índice 0): Nombres de metas desde columna C (índice 2) en adelante, cada una ocupa 3 columnas
    Fila 2 (índice 1): Cupos, Ejecución, % Ejecución (repetido)
    Retorna lista de tuplas: (indice_columna_cupos, descripcion)
    """
    descripciones = []

    # Fila 1 (índice 0) tiene los nombres de metas
    headers_metas = df.iloc[0].values

    # Comenzamos desde columna C (índice 2) y cada meta ocupa 3 columnas
    col = 2
    while col < len(headers_metas):
        descripcion = str(headers_metas[col]).strip()

        # Validar que sea una descripción válida (no vacía, no NaN)
        if descripcion and descripcion.lower() not in ["nan", ""]:
            indice_cupos = col
            descripciones.append((indice_cupos, descripcion))
            col += 3  # Saltar 3 columnas (Cupos, Ejecución, % Ejecución)
        else:
            break

    return descripciones


def importar_formacion_regional(conn, df):
    """Importa datos de formación por regional desde la hoja formacio_regional"""
    cursor = conn.cursor()

    descripciones = extraer_descripciones_de_headers(df)

    print(f"[INFO] Se encontraron {len(descripciones)} descripciones de metas")

    # Insertar descripciones en la tabla
    id_descripciones = {}
    for indice_cupos, descripcion in descripciones:
        cursor.execute(
            """
        INSERT OR IGNORE INTO descripcion_meta (descripcion)
        VALUES (?)
        """,
            (descripcion,),
        )

        cursor.execute(
            "SELECT id FROM descripcion_meta WHERE descripcion = ?", (descripcion,)
        )
        id_desc = cursor.fetchone()[0]
        id_descripciones[descripcion] = id_desc

    conn.commit()
    print("[OK] Descripciones de metas insertadas")

    # Procesar filas de datos (desde fila 3 hasta fila 35, índices 2 a 34)
    contador = 0
    for idx in range(2, min(35, len(df))):
        row = df.iloc[idx]

        codigo_regional = str(row.iloc[0]).strip()
        nombre_regional = str(row.iloc[1]).strip()

        if not codigo_regional or codigo_regional.lower() == "nan":
            continue

        cursor.execute(
            """
        INSERT OR IGNORE INTO regional (codigo_regional, nombre)
        VALUES (?, ?)
        """,
            (codigo_regional, nombre_regional),
        )

        cursor.execute(
            "SELECT id FROM regional WHERE codigo_regional = ?", (codigo_regional,)
        )
        id_regional = cursor.fetchone()[0]

        for indice_cupos, descripcion in descripciones:
            try:
                meta_val = row.iloc[indice_cupos]
                ejec_val = row.iloc[indice_cupos + 1]

                meta = None
                ejecucion = None

                try:
                    meta = int(float(meta_val)) if pd.notna(meta_val) else 0
                except:
                    meta = 0

                try:
                    ejecucion = int(float(ejec_val)) if pd.notna(ejec_val) else 0
                except:
                    ejecucion = 0

                if meta > 0 or ejecucion > 0:
                    es_subtotal, es_total = identificar_tipo_registro(descripcion)

                    nivel = 0
                    if es_total:
                        nivel = 3
                    elif es_subtotal:
                        nivel = 2
                    else:
                        nivel = 1

                    id_desc = id_descripciones[descripcion]

                    cursor.execute(
                        """
                    INSERT OR REPLACE INTO meta_formacion_profesional_integral
                    (id_descripcion, id_regional, meta, ejecucion, es_subtotal, es_total, nivel_jerarquia)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                        (
                            id_desc,
                            id_regional,
                            meta,
                            ejecucion,
                            es_subtotal,
                            es_total,
                            nivel,
                        ),
                    )

                    contador += 1
            except Exception as e:
                continue

        conn.commit()

    print(f"[OK] Importados {contador} registros de metas FPI por regional")


def importar_semaforo(conn, df):
    """Importa datos de la hoja semáforo"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        mes = row.get("mes")
        if pd.isna(mes) or str(mes).strip() == "":
            continue

        cursor.execute(
            """
        INSERT OR REPLACE INTO rangos_categorizacion
        (agrupador, nombre_indicador, mes, min_baja, max_baja, min_vulnerable,
         max_vulnerable, min_buena, max_buena, sobreejecucion_superior_a)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                row["agrupador"],
                row["nombre_de_indicador"],
                str(mes).strip(),
                row["min_baja"] if not pd.isna(row["min_baja"]) else None,
                row["max_baja"] if not pd.isna(row["max_baja"]) else None,
                row["min_vulnerable"] if not pd.isna(row["min_vulnerable"]) else None,
                row["max_vulnerable"] if not pd.isna(row["max_vulnerable"]) else None,
                row["min_buena"] if not pd.isna(row["min_buena"]) else None,
                row["max_buena"] if not pd.isna(row["max_buena"]) else None,
                row["sobreejecucion_superior_a"]
                if not pd.isna(row["sobreejecucion_superior_a"])
                else None,
            ),
        )

    conn.commit()
    print(f"[OK] Importados {len(df)} registros de semaforo")


def importar_formacion_por_nivel(conn, df):
    """Importa formación por nivel y programa"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        nivel = row["nivel_formacion"]
        _, es_total = identificar_tipo_registro(nivel)

        cursor.execute(
            """
        INSERT OR REPLACE INTO formacion_por_nivel_programa
        (nivel_formacion, regular_meta, regular_ejecucion, campesena_meta,
         campesena_ejecucion, full_popular_meta, full_popular_ejecucion,
         total_meta, es_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                nivel,
                row.get("regular_meta"),
                row.get("regular_ejecucion"),
                row.get("campesena_meta"),
                row.get("campesena_ejecucion"),
                row.get("full_popular_meta"),
                row.get("full_popular_ejecucion"),
                row["total_meta_formacion_profesional"],
                es_total,
            ),
        )

    conn.commit()
    print(f"[OK] Importados {len(df)} registros de formacion por nivel")


def importar_programas_relevantes(conn, df):
    """Importa programas relevantes"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        cursor.execute(
            """
        INSERT OR REPLACE INTO programa_relevante
        (descripcion, meta, ejecucion, tipo)
        VALUES (?, ?, ?, ?)
        """,
            (
                row["Metas Programas Relevantes"],
                row["meta"],
                row["ejecucion"],
                row["tipo"],
            ),
        )

    conn.commit()
    print(f"[OK] Importados {len(df)} programas relevantes")


def importar_otras_metas(conn, df):
    """Importa otras metas relacionadas con formación profesional"""
    cursor = conn.cursor()

    categoria_actual = None

    for idx, row in df.iterrows():
        col0 = str(row.iloc[0]).strip()
        col1 = str(row.iloc[1]).strip()
        col2 = str(row.iloc[2]).strip()

        if col1 in ["META", "meta", "Cupos"] and col2 in [
            "EJECUCIÓN",
            "EJECUCION",
            "ejecucion",
        ]:
            categoria_actual = col0
            continue

        if not categoria_actual or col0 == "nan":
            continue

        try:
            meta_val = None
            ejec_val = None

            try:
                meta_val = float(col1) if col1 != "nan" and col1 != "NaN" else None
            except:
                pass

            try:
                ejec_val = float(col2) if col2 != "nan" and col2 != "NaN" else None
            except:
                pass

            if meta_val is not None or ejec_val is not None:
                es_subtotal, es_total = identificar_tipo_registro(col0)

                tipo_dato = "numero"
                if meta_val is not None and 0 < meta_val < 1:
                    tipo_dato = "porcentaje"

                cursor.execute(
                    """
                INSERT OR REPLACE INTO metrica_adicional
                (categoria, nombre_metrica, meta, ejecucion, tipo_dato, es_total)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                    (categoria_actual, col0, meta_val, ejec_val, tipo_dato, es_total),
                )
        except Exception as e:
            pass

    conn.commit()
    print(f"[OK] Importadas metricas adicionales")


def generar_relaciones_jerarquicas(conn):
    """Genera las relaciones jerárquicas entre registros"""
    cursor = conn.cursor()

    cursor.execute("DELETE FROM relacion_jerarquica")

    relaciones_fpi = [
        (
            "SubTotal Tecnólogos ( E)",
            [
                "Tecnólogos Regular - Presencial",
                "Tecnólogos Regular - Virtual",
                "Tecnólogos Regular - A Distancia",
                "Tecnólogos CampeSENA",
                "Tecnólogos Full Popular",
            ],
        ),
        ("EDUCACION SUPERIOR (=E)", ["SubTotal Tecnólogos ( E)"]),
        (
            "SubTotal Operarios (B)",
            ["Operarios Regular", "Operarios CampeSENA", "Operarios Full Popular"],
        ),
        (
            "SubTotal Auxiliares (A)",
            ["Auxiliares Regular", "Auxiliares CampeSENA", "Auxiliares Full Popular"],
        ),
        (
            "SubTotal Técnico Laboral (C)",
            [
                "Técnico Laboral Regular - Presencial",
                "Técnico Laboral Regular - Virtual",
                "Técnico Laboral CampeSENA",
                "Técnico Laboral Full Popular",
                "Técnico Laboral Articulación con la Media",
            ],
        ),
        (
            "TOTAL FORMACIÓN LABORAL (D=A+B+C+T)",
            [
                "SubTotal Auxiliares (A)",
                "SubTotal Operarios (B)",
                "SubTotal Técnico Laboral (C)",
                "Profundización Técnica (T)",
            ],
        ),
        (
            "TOTAL FORMACION TITULADA (F = D+E)",
            ["TOTAL FORMACIÓN LABORAL (D=A+B+C+T)", "EDUCACION SUPERIOR (=E)"],
        ),
        (
            "SubTotal Programa de Bilingüismo (K = I + J)",
            [
                "Programa de Bilingüismo - Virtual (I)",
                "Programa de Bilingüismo - Presencial (J)",
            ],
        ),
        (
            "TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)",
            [
                "Formación Complementaria - Virtual  (Sin Bilingüismo) (G)",
                "Formación Complementaria - Presencial (Sin Bilingüismo) (H)",
                "SubTotal Programa de Bilingüismo (K = I + J)",
                "Formación Complementaria CampeSENA (L)",
                "Formación Complementaria Full Popular (M)",
            ],
        ),
        (
            "TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)",
            [
                "TOTAL FORMACION TITULADA (F = D+E)",
                "TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)",
            ],
        ),
    ]

    for nombre_padre, hijos in relaciones_fpi:
        cursor.execute(
            """
        SELECT mfpi.id FROM meta_formacion_profesional_integral mfpi
        JOIN descripcion_meta dm ON mfpi.id_descripcion = dm.id
        WHERE dm.descripcion = ?
        """,
            (nombre_padre,),
        )

        padre_result = cursor.fetchone()
        if not padre_result:
            continue

        id_padre = padre_result[0]

        for nombre_hijo in hijos:
            cursor.execute(
                """
            SELECT mfpi.id FROM meta_formacion_profesional_integral mfpi
            JOIN descripcion_meta dm ON mfpi.id_descripcion = dm.id
            WHERE dm.descripcion = ?
            """,
                (nombre_hijo,),
            )

            hijo_result = cursor.fetchone()
            if not hijo_result:
                continue

            id_hijo = hijo_result[0]

            cursor.execute(
                """
            INSERT INTO relacion_jerarquica
            (tabla_origen, id_padre, nombre_padre, id_hijo, nombre_hijo, tabla_hijo, operacion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    "meta_formacion_profesional_integral",
                    id_padre,
                    nombre_padre,
                    id_hijo,
                    nombre_hijo,
                    "meta_formacion_profesional_integral",
                    "suma",
                ),
            )

    conn.commit()
    print(f"[OK] Generadas relaciones jerarquicas")


def main():
    """Función principal"""
    print("Iniciando importación de datos...\n")

    conn = sqlite3.connect(DB_FILE)

    crear_esquema(conn)

    print("\nImportando datos...")

    # NUEVA: Formación regional (solo para metas FPI desagregadas)
    df_regional = pd.read_excel(
        ODS_FILE, sheet_name="formacio_regional", engine="odf", header=None
    )
    importar_formacion_regional(conn, df_regional)

    # ORIGINALES: Las demás hojas como antes
    df_semaforo = pd.read_excel(ODS_FILE, sheet_name="semaforo", engine="odf")
    importar_semaforo(conn, df_semaforo)

    df_por_nivel = pd.read_excel(
        ODS_FILE, sheet_name="profesional_integral_x_programa", engine="odf"
    )
    importar_formacion_por_nivel(conn, df_por_nivel)

    df_programas = pd.read_excel(
        ODS_FILE,
        sheet_name="nacional_seguimiento_relevantes",
        engine="odf",
    )
    importar_programas_relevantes(conn, df_programas)

    df_otras = pd.read_excel(
        ODS_FILE,
        sheet_name="nacional_seguimiento_otras_meta",
        engine="odf",
    )
    importar_otras_metas(conn, df_otras)

    generar_relaciones_jerarquicas(conn)

    conn.close()

    print("\n[OK] Importacion completada exitosamente")
    print(f"  Base de datos: {DB_FILE}")


if __name__ == "__main__":
    main()
