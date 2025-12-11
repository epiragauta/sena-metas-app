import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';

@Injectable({
    providedIn: 'root'
})
export class ExportExcelService {

    constructor() { }

    /**
     * Exporta datos de seguimiento de metas a Excel
     * @param soloRegional - Si es true, solo exporta la regional. Si es false, exporta ambos
     */
    async exportarSeguimientoMetas(
        regionalNombre: string,
        regionalCodigo: number,
        centroNombre: string | undefined,
        centroCodigo: number | undefined,
        datosRegional: any[],
        datosCentro: any[],
        soloRegional: boolean = false
    ): Promise<void> {
        try {
            console.log('=== EXPORTAR EXCEL ===');
            console.log('Solo Regional:', soloRegional);

            if (!datosRegional || datosRegional.length === 0) {
                alert('❌ Error: No hay datos para exportar');
                return;
            }

            // Crear workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Seguimiento Metas');

            // Configurar ancho de columnas - diferente según si es solo regional o ambos
            if (soloRegional) {
                worksheet.columns = [
                    { width: 45 },  // A
                    { width: 12 },  // B
                    { width: 12 },  // C
                    { width: 12 }   // D
                ];
            } else {
                worksheet.columns = [
                    { width: 45 },  // A
                    { width: 12 },  // B
                    { width: 12 },  // C
                    { width: 12 },  // D
                    { width: 6 },   // E
                    { width: 45 },  // F
                    { width: 12 },  // G
                    { width: 12 },  // H
                    { width: 12 }   // I
                ];
            }

            let rowNum = 1;

            // ==================== FILA 1: TÍTULOS ====================
            let row1Values: any[];
            if (soloRegional) {
                row1Values = ['SEGUIMIENTO A METAS REGIONALES 2025', '', '', ''];
            } else {
                row1Values = [
                    'SEGUIMIENTO A METAS REGIONALES 2025',
                    '', '', '', '',
                    'SEGUIMIENTO A METAS CENTROS DE FORMACIÓN 2025'
                ];
            }

            const row1 = worksheet.getRow(rowNum);
            row1.values = row1Values;

            // Colorear fila 1
            const maxColRow1 = soloRegional ? 4 : 9;
            for (let col = 1; col <= maxColRow1; col++) {
                const cell = row1.getCell(col);
                if (!soloRegional && col === 5) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAF2D0' } };
                }
                cell.font = { bold: true, size: 14, name: 'Calibri' };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            }
            rowNum++;

            // ==================== FILA 2: VACÍA ====================
            rowNum++;

            // ==================== FILA 3: CÓDIGOS ====================
            const row3 = worksheet.getRow(rowNum);
            row3.values = [
                'Código de la regional:',
                regionalCodigo,
                '', '', '',
                'Código del centro:',
                centroCodigo || ''
            ];
            // Colorear: A-D gris, E blanco, F-I gris
            for (let col = 1; col <= 9; col++) {
                const cell = row3.getCell(col);
                if (col === 5) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
                }
                cell.font = { bold: true, size: 11, name: 'Calibri' };
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
            rowNum++;

            // ==================== FILA 4: NOMBRES ====================
            const row4 = worksheet.getRow(rowNum);
            row4.values = [
                `REGIONAL ${regionalNombre}`,
                '', '', '', '',
                `REGIONAL ${regionalNombre}`
            ];
            // Colorear: A-D gris, E blanco, F-I gris
            for (let col = 1; col <= 9; col++) {
                const cell = row4.getCell(col);
                if (col === 5) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
                }
                cell.font = { bold: true, size: 12, name: 'Calibri' };
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
            rowNum++;

            // ==================== FILA 5: CENTRO ====================
            if (centroNombre) {
                const row5 = worksheet.getRow(rowNum);
                row5.values = [
                    '', '', '', '', '',
                    centroNombre
                ];
                // Colorear: A-D gris, E blanco, F-I gris
                for (let col = 1; col <= 9; col++) {
                    const cell = row5.getCell(col);
                    if (col === 5) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                    } else {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
                    }
                    cell.font = { bold: true, size: 12, name: 'Calibri' };
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
                rowNum++;
            }

            // ==================== FILA 6: ENCABEZADOS ====================
            let row6Values: any[];
            if (soloRegional) {
                row6Values = [
                    'Metas Formación Profesional Integral',
                    'META',
                    'EJECUCIÓN',
                    '% EJEC'
                ];
            } else {
                row6Values = [
                    'Metas Formación Profesional Integral',
                    'META',
                    'EJECUCIÓN',
                    '% EJEC',
                    '',
                    'Metas Formación Profesional Integral',
                    'META',
                    'EJECUCIÓN',
                    '% EJEC'
                ];
            }

            const row6 = worksheet.getRow(rowNum);
            row6.values = row6Values;

            // Colorear: A-D verde, E blanco, F-I verde
            const maxColRow6 = soloRegional ? 4 : 9;
            for (let col = 1; col <= maxColRow6; col++) {
                const cell = row6.getCell(col);
                if (!soloRegional && col === 5) {
                    // Columna E blanca
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                } else if (!soloRegional && col >= 6) {
                    // Columnas F-I verde
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB5E6A2' } };
                } else {
                    // Columnas A-D verde
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB5E6A2' } };
                }
                cell.font = { bold: true, size: 11, name: 'Calibri' };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
            rowNum++;

            // ==================== FILAS DE DATOS ====================
            const maxRows = soloRegional ? datosRegional.length : Math.max(datosRegional.length, datosCentro.length);
            for (let i = 0; i < maxRows; i++) {
                const itemRegional = datosRegional[i];
                const itemCentro = soloRegional ? null : datosCentro[i];

                let dataRowValues: any[];
                if (soloRegional) {
                    dataRowValues = [
                        itemRegional?.subcategoria || '',
                        itemRegional?.cupos || '',
                        itemRegional?.ejecucion || '',
                        itemRegional?.porcentaje !== undefined ? (itemRegional.porcentaje / 100) : ''
                    ];
                } else {
                    dataRowValues = [
                        itemRegional?.subcategoria || '',
                        itemRegional?.cupos || '',
                        itemRegional?.ejecucion || '',
                        itemRegional?.porcentaje !== undefined ? (itemRegional.porcentaje / 100) : '',
                        '',
                        itemCentro?.subcategoria || '',
                        itemCentro?.cupos || '',
                        itemCentro?.ejecucion || '',
                        itemCentro?.porcentaje !== undefined ? (itemCentro.porcentaje / 100) : ''
                    ];
                }

                const dataRow = worksheet.getRow(rowNum);
                dataRow.values = dataRowValues;

                // Colorear cada columna según su tipo
                const maxCols = soloRegional ? 4 : 9;
                for (let col = 1; col <= maxCols; col++) {
                    const cell = dataRow.getCell(col);
                    let bgColor = 'FFFFFFFF';
                    let textColor = 'FF000000';
                    let bold = false;
                    let fontSize = 10;

                    // Determinar tipo de fila
                    const isSubtotalRegional = itemRegional?.esSubtotal;
                    const isTotalRegional = itemRegional?.esTotal;
                    const isSubtotalCentro = soloRegional ? false : itemCentro?.esSubtotal;
                    const isTotalCentro = soloRegional ? false : itemCentro?.esTotal;

                    // Aplicar colores según tipo
                    if (isTotalRegional || isTotalCentro) {
                        bgColor = 'FFDAF2D0'; // Verde claro
                        bold = true;
                        fontSize = 11;
                    } else if (isSubtotalRegional || isSubtotalCentro) {
                        bgColor = 'FFD9D9D9'; // Gris
                        bold = true;
                    }

                    // Columna E siempre blanca (solo si no es soloRegional)
                    if (!soloRegional && col === 5) {
                        bgColor = 'FFFFFFFF';
                    }

                    // Columna D (regional %) - colorear según porcentaje
                    if (col === 4 && itemRegional?.porcentaje !== undefined) {
                        const color = this.obtenerColorPorcentaje(itemRegional.porcentaje);
                        bgColor = color.bg;
                        textColor = color.text;
                        bold = true;
                        cell.numFmt = '0.00%';
                    }

                    // Columna I (centro %) - colorear según porcentaje (solo si no es soloRegional)
                    if (!soloRegional && col === 9 && itemCentro?.porcentaje !== undefined) {
                        const color = this.obtenerColorPorcentaje(itemCentro.porcentaje);
                        bgColor = color.bg;
                        textColor = color.text;
                        bold = true;
                        cell.numFmt = '0.00%';
                    }

                    // Aplicar estilos al color
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                    cell.font = {
                        bold: bold,
                        size: fontSize,
                        name: 'Calibri',
                        color: { argb: textColor }
                    };
                    cell.alignment = {
                        horizontal: (col === 4 || (!soloRegional && col === 9)) ? 'center' : 'left',
                        vertical: 'middle'
                    };
                }

                rowNum++;
            }

            // Descargar archivo
            const tipoExporte = soloRegional ? 'Regional' : 'Completo';
            const nombreArchivo = `Seguimiento_Metas_${tipoExporte}_${regionalNombre}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            console.log('Generando archivo:', nombreArchivo);

            // Si es soloRegional, limpiar las columnas vacías (E-I)
            if (soloRegional) {
                // Eliminar las columnas vacías que no se usan
                for (let row = 1; row <= rowNum; row++) {
                    for (let col = 5; col <= 9; col++) {
                        const cell = worksheet.getCell(row, col);
                        cell.value = null as any;
                        cell.fill = { type: 'pattern', pattern: 'none' } as any;
                        cell.font = {} as any;
                    }
                }
                // Redimensionar columnas a solo las 4 que se usan
                worksheet.columns = [
                    { width: 45 },  // A
                    { width: 12 },  // B
                    { width: 12 },  // C
                    { width: 12 }   // D
                ];
            }

            await workbook.xlsx.writeBuffer().then((buffer) => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nombreArchivo;
                link.click();
                URL.revokeObjectURL(link.href);
                console.log('Excel descargado correctamente');
                alert('Excel descargado correctamente');
            });

        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al descargar Excel: ' + (error as any).message);
        }
    }

    /**
     * Obtiene los colores según el porcentaje - SEMÁFORO EXACTO
     */
    private obtenerColorPorcentaje(porcentaje: number): { bg: string; text: string } {
        if (porcentaje >= 100.6) {
            // Sobreejecución (100.6 - 200)
            return { bg: 'FFFFC000', text: 'FF000000' };
        } else if (porcentaje >= 90) {
            // Buena (90 - 100.59)
            return { bg: 'FF92D050', text: 'FF006100' };
        } else if (porcentaje >= 83) {
            // Vulnerable (83 - 89.99)
            return { bg: 'FFFFFF00', text: 'FF000000' };
        } else {
            // Bajo (0 - 82.9)
            return { bg: 'FFFF0000', text: 'FFFFFFFF' };
        }
    }
}