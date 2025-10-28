"""
Script para importar datos de seguimiento de metas desde archivo ODS a SQLite
con esquema normalizado
"""
import pandas as pd
import sqlite3
import json
from datetime import datetime

# Configuración
ODS_FILE = 'seguimiento_metas_2025_09.ods'
DB_FILE = 'seguimiento_metas.db'

def crear_esquema(conn):
    """Crea el esquema normalizado de la base de datos"""
    cursor = conn.cursor()

    # Tabla de categorías de semáforo
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categoria_semaforo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) UNIQUE NOT NULL
    )
    ''')

    # Tabla de rangos de categorización por indicador
    cursor.execute('''
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
    ''')

    # Tabla de tipos de formación
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tipo_formacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) UNIQUE NOT NULL,
        es_subtotal BOOLEAN DEFAULT 0,
        es_total BOOLEAN DEFAULT 0,
        nivel VARCHAR(100),
        modalidad VARCHAR(100)
    )
    ''')

    # Tabla de modalidades
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS modalidad (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) UNIQUE NOT NULL
    )
    ''')

    # Tabla de programas especiales
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS programa_especial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) UNIQUE NOT NULL,
        tipo VARCHAR(100)
    )
    ''')

    # Tabla principal de metas de formación profesional integral
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS meta_formacion_profesional_integral (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion VARCHAR(500) NOT NULL UNIQUE,
        meta INTEGER NOT NULL,
        ejecucion INTEGER NOT NULL,
        porcentaje_ejecucion DECIMAL(10,4),
        es_subtotal BOOLEAN DEFAULT 0,
        es_total BOOLEAN DEFAULT 0,
        nivel_jerarquia INTEGER DEFAULT 0,
        formula_calculo TEXT,
        periodo VARCHAR(50) DEFAULT '2025_09'
    )
    ''')

    # Tabla de formación por nivel y programa
    cursor.execute('''
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
    ''')

    # Tabla de programas relevantes
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS programa_relevante (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion VARCHAR(500) NOT NULL,
        meta INTEGER NOT NULL,
        ejecucion INTEGER NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        periodo VARCHAR(50) DEFAULT '2025_09',
        UNIQUE(descripcion, periodo)
    )
    ''')

    # Tabla de métricas adicionales (retención, certificación, etc.)
    cursor.execute('''
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
    ''')

    # Tabla de poblaciones vulnerables
    cursor.execute('''
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
    ''')

    # Tabla de relaciones jerárquicas (para saber qué suma para qué)
    cursor.execute('''
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
    ''')

    conn.commit()
    print("[OK] Esquema de base de datos creado")

def identificar_tipo_registro(nombre):
    """Identifica si un registro es subtotal, total o detalle"""
    nombre_lower = nombre.lower()

    es_subtotal = any(x in nombre_lower for x in ['subtotal', 'sub total', 'sub-total'])
    es_total = any(x in nombre_lower for x in ['total ', ' total', 'total\t', '\ttotal'])

    return es_subtotal, es_total

def importar_semaforo(conn, df):
    """Importa datos de la hoja semáforo"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        # Saltar filas sin mes válido
        mes = row.get('mes')
        if pd.isna(mes) or str(mes).strip() == '':
            continue

        cursor.execute('''
        INSERT OR REPLACE INTO rangos_categorizacion
        (agrupador, nombre_indicador, mes, min_baja, max_baja, min_vulnerable,
         max_vulnerable, min_buena, max_buena, sobreejecucion_superior_a)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            row['agrupador'],
            row['nombre_de_indicador'],
            str(mes).strip(),
            row['min_baja'] if not pd.isna(row['min_baja']) else None,
            row['max_baja'] if not pd.isna(row['max_baja']) else None,
            row['min_vulnerable'] if not pd.isna(row['min_vulnerable']) else None,
            row['max_vulnerable'] if not pd.isna(row['max_vulnerable']) else None,
            row['min_buena'] if not pd.isna(row['min_buena']) else None,
            row['max_buena'] if not pd.isna(row['max_buena']) else None,
            row['sobreejecucion_superior_a'] if not pd.isna(row['sobreejecucion_superior_a']) else None
        ))

    conn.commit()
    print(f"[OK] Importados {len(df)} registros de semaforo")

def importar_metas_fpi(conn, df):
    """Importa metas de formación profesional integral"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        descripcion = row['Metas Formación Profesional Integral']
        meta = row['meta']
        ejecucion = row['ejecucion']

        es_subtotal, es_total = identificar_tipo_registro(descripcion)
        porcentaje = (ejecucion / meta * 100) if meta > 0 else 0

        # Calcular nivel jerárquico
        nivel = 0
        if es_total:
            nivel = 3
        elif es_subtotal:
            nivel = 2
        else:
            nivel = 1

        cursor.execute('''
        INSERT OR REPLACE INTO meta_formacion_profesional_integral
        (descripcion, meta, ejecucion, porcentaje_ejecucion, es_subtotal,
         es_total, nivel_jerarquia)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (descripcion, meta, ejecucion, porcentaje, es_subtotal, es_total, nivel))

    conn.commit()
    print(f"[OK] Importados {len(df)} registros de metas FPI")

def importar_formacion_por_nivel(conn, df):
    """Importa formación por nivel y programa"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        nivel = row['nivel_formacion']
        _, es_total = identificar_tipo_registro(nivel)

        cursor.execute('''
        INSERT OR REPLACE INTO formacion_por_nivel_programa
        (nivel_formacion, regular_meta, regular_ejecucion, campesena_meta,
         campesena_ejecucion, full_popular_meta, full_popular_ejecucion,
         total_meta, es_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            nivel,
            row.get('regular_meta'),
            row.get('regular_ejecucion'),
            row.get('campesena_meta'),
            row.get('campesena_ejecucion'),
            row.get('full_popular_meta'),
            row.get('full_popular_ejecucion'),
            row['total_meta_formacion_profesional'],
            es_total
        ))

    conn.commit()
    print(f"[OK] Importados {len(df)} registros de formacion por nivel")

def importar_programas_relevantes(conn, df):
    """Importa programas relevantes"""
    cursor = conn.cursor()

    for _, row in df.iterrows():
        cursor.execute('''
        INSERT OR REPLACE INTO programa_relevante
        (descripcion, meta, ejecucion, tipo)
        VALUES (?, ?, ?, ?)
        ''', (
            row['Metas Programas Relevantes'],
            row['meta'],
            row['ejecucion'],
            row['tipo']
        ))

    conn.commit()
    print(f"[OK] Importados {len(df)} programas relevantes")

def importar_otras_metas(conn, df):
    """Importa otras metas relacionadas con formación profesional"""
    cursor = conn.cursor()

    # La primera columna contiene las categorías
    categoria_actual = None

    for idx, row in df.iterrows():
        # Detectar cambio de categoría
        col0 = str(row.iloc[0]).strip()
        col1 = str(row.iloc[1]).strip()
        col2 = str(row.iloc[2]).strip()

        # Si la primera columna no es NaN y las siguientes son META/EJECUCIÓN, es una categoría
        if col1 in ['META', 'meta', 'Cupos'] and col2 in ['EJECUCIÓN', 'EJECUCION', 'ejecucion']:
            categoria_actual = col0
            continue

        # Si no tenemos categoría o los valores son NaN, saltar
        if not categoria_actual or col0 == 'nan':
            continue

        try:
            # Intentar convertir a números
            meta_val = None
            ejec_val = None

            try:
                meta_val = float(col1) if col1 != 'nan' and col1 != 'NaN' else None
            except:
                pass

            try:
                ejec_val = float(col2) if col2 != 'nan' and col2 != 'NaN' else None
            except:
                pass

            if meta_val is not None or ejec_val is not None:
                es_subtotal, es_total = identificar_tipo_registro(col0)

                # Determinar tipo de dato
                tipo_dato = 'numero'
                if meta_val is not None and 0 < meta_val < 1:
                    tipo_dato = 'porcentaje'

                cursor.execute('''
                INSERT OR REPLACE INTO metrica_adicional
                (categoria, nombre_metrica, meta, ejecucion, tipo_dato, es_total)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', (categoria_actual, col0, meta_val, ejec_val, tipo_dato, es_total))
        except Exception as e:
            # Silenciar errores de conversión
            pass

    conn.commit()
    print(f"[OK] Importadas metricas adicionales")

def generar_relaciones_jerarquicas(conn):
    """Genera las relaciones jerárquicas entre registros"""
    cursor = conn.cursor()

    # Limpiar relaciones existentes
    cursor.execute('DELETE FROM relacion_jerarquica')

    # Definir relaciones conocidas para FPI
    relaciones_fpi = [
        # Tecnólogos
        ('SubTotal Tecnólogos ( E)', ['Tecnólogos Regular - Presencial', 'Tecnólogos Regular - Virtual',
                                       'Tecnólogos Regular - A Distancia', 'Tecnólogos CampeSENA',
                                       'Tecnólogos Full Popular']),
        ('EDUCACION SUPERIOR (=E)', ['SubTotal Tecnólogos ( E)']),

        # Operarios
        ('SubTotal Operarios (B)', ['Operarios Regular', 'Operarios CampeSENA', 'Operarios Full Popular']),

        # Auxiliares
        ('SubTotal Auxiliares (A)', ['Auxiliares Regular', 'Auxiliares CampeSENA', 'Auxiliares Full Popular']),

        # Técnico Laboral
        ('SubTotal Técnico Laboral (C)', ['Técnico Laboral Regular - Presencial', 'Técnico Laboral Regular - Virtual',
                                          'Técnico Laboral CampeSENA', 'Técnico Laboral Full Popular',
                                          'Técnico Laboral Articulación con la Media']),

        # Totales formación laboral
        ('TOTAL FORMACIÓN LABORAL (D=A+B+C+T)', ['SubTotal Auxiliares (A)', 'SubTotal Operarios (B)',
                                                  'SubTotal Técnico Laboral (C)', 'Profundización Técnica (T)']),

        # Total titulada
        ('TOTAL FORMACION TITULADA (F = D+E)', ['TOTAL FORMACIÓN LABORAL (D=A+B+C+T)', 'EDUCACION SUPERIOR (=E)']),

        # Complementaria
        ('SubTotal Programa de Bilinguísmo (K = I + J)', ['Programa de Bilingüismo - Virtual (I)',
                                                           'Programa de Bilingüismo - Presencial (J)']),
        ('TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)', [
            'Formación Complementaria - Virtual  (Sin Bilingüismo) (G)',
            'Formación Complementaria - Presencial (Sin Bilingüismo) (H)',
            'SubTotal Programa de Bilinguísmo (K = I + J)',
            'Formación Complementaria CampeSENA (L)',
            'Formación Complementaria Full Popular (M)'
        ]),

        # Gran total
        ('TOTAL FORMACION PROFESIONAL INTEGRAL (O=N+F)', ['TOTAL FORMACION TITULADA (F = D+E)',
                                                           'TOTAL FORMACION COMPLEMENTARIA (N = G+H+K+L+M)'])
    ]

    # Insertar relaciones
    for nombre_padre, hijos in relaciones_fpi:
        # Obtener ID del padre
        cursor.execute('''
        SELECT id FROM meta_formacion_profesional_integral
        WHERE descripcion = ?
        ''', (nombre_padre,))

        padre_result = cursor.fetchone()
        if not padre_result:
            continue

        id_padre = padre_result[0]

        # Insertar cada hijo
        for nombre_hijo in hijos:
            cursor.execute('''
            SELECT id FROM meta_formacion_profesional_integral
            WHERE descripcion = ?
            ''', (nombre_hijo,))

            hijo_result = cursor.fetchone()
            if not hijo_result:
                continue

            id_hijo = hijo_result[0]

            cursor.execute('''
            INSERT INTO relacion_jerarquica
            (tabla_origen, id_padre, nombre_padre, id_hijo, nombre_hijo, tabla_hijo, operacion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', ('meta_formacion_profesional_integral', id_padre, nombre_padre,
                  id_hijo, nombre_hijo, 'meta_formacion_profesional_integral', 'suma'))

    conn.commit()
    print(f"[OK] Generadas relaciones jerarquicas")

def main():
    """Función principal"""
    print("Iniciando importación de datos...\n")

    # Conectar a SQLite
    conn = sqlite3.connect(DB_FILE)

    # Crear esquema
    crear_esquema(conn)

    # Leer y procesar cada hoja
    print("\nImportando datos...")

    # Semáforo
    df_semaforo = pd.read_excel(ODS_FILE, sheet_name='semaforo', engine='odf')
    importar_semaforo(conn, df_semaforo)

    # Metas FPI
    df_metas_fpi = pd.read_excel(ODS_FILE,
                                  sheet_name='nacional_seguimiento_metas_formacion_profesional_integral',
                                  engine='odf')
    importar_metas_fpi(conn, df_metas_fpi)

    # Formación por nivel
    df_por_nivel = pd.read_excel(ODS_FILE,
                                  sheet_name='nacional_seguimiento_metas_formacion_profesional_integral_x_programa',
                                  engine='odf')
    importar_formacion_por_nivel(conn, df_por_nivel)

    # Programas relevantes
    df_programas = pd.read_excel(ODS_FILE,
                                  sheet_name='nacional_seguimiento_metas_programas_relevantes',
                                  engine='odf')
    importar_programas_relevantes(conn, df_programas)

    # Otras metas
    df_otras = pd.read_excel(ODS_FILE,
                            sheet_name='nacional_seguimiento_otras_metas_relacionadas_con_formacion_profesional',
                            engine='odf')
    importar_otras_metas(conn, df_otras)

    # Generar relaciones jerárquicas
    generar_relaciones_jerarquicas(conn)

    conn.close()

    print("\n[OK] Importacion completada exitosamente")
    print(f"  Base de datos: {DB_FILE}")

if __name__ == '__main__':
    main()
