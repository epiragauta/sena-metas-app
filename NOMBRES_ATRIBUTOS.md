# Diccionario de Atributos - Seguimiento Metas SENA

## Convenciones de Nomenclatura

**Prefijos:**
- Sin prefijo: Metas de ejecución (valores absolutos)
- `R_`: Porcentaje de cumplimiento (%)
- `C_`: Cumplimiento categórico (clasificación semáforo)
- `M_`: Meta objetivo (valor planificado)
- `SUB_`: Subtotal de una categoría
- `TOT_`: Total de una agrupación mayor

**Sufijos de Modalidad:**
- `_PRE`: Presencial
- `_VIR`: Virtual
- `_A_D`: A Distancia

**Sufijos de Estrategia:**
- `_REGULAR` / `_REG`: Formación Regular
- `_CAMPESE` / `_CAMPESENA`: Programa CampeSENA (enfoque rural/agropecuario)
- `_FULL_PO` / `_FULL`: Full Popular (enfoque comunitario)

---

## FORMACIÓN TITULADA - EDUCACIÓN SUPERIOR

### Tecnólogos (Nivel más alto, 3+ años)
| Atributo | Descripción |
|----------|-------------|
| TEC_REG_PRE | Tecnólogos Regular - Modalidad Presencial (ejecución) |
| TEC_REG_VIR | Tecnólogos Regular - Modalidad Virtual (ejecución) |
| TEC_REG_A_D | Tecnólogos Regular - Modalidad A Distancia (ejecución) |
| TEC_CAMPESE | Tecnólogos - Estrategia CampeSENA (ejecución) |
| TEC_FULL_PO | Tecnólogos - Estrategia Full Popular (ejecución) |
| TECNOLOGOS | Subtotal Tecnólogos (suma de todas las modalidades y estrategias) |
| EDU_SUPERIO | Total Educación Superior (=E en jerarquía) |

---

## FORMACIÓN TITULADA - FORMACIÓN LABORAL

### Operarios
| Atributo | Descripción |
|----------|-------------|
| OPE_REGULAR | Operarios - Estrategia Regular (ejecución) |
| OPE_CAMPESE | Operarios - Estrategia CampeSENA (ejecución) |
| OPE_FULL_PO | Operarios - Estrategia Full Popular (ejecución) |
| SUB_TOT_OPE | Subtotal Operarios (=B en jerarquía) |

### Auxiliares (1-2 años)
| Atributo | Descripción |
|----------|-------------|
| AUX_REGULAR | Auxiliares - Estrategia Regular (ejecución) |
| AUX_CAMPESE | Auxiliares - Estrategia CampeSENA (ejecución) |
| AUX_FULL_PO | Auxiliares - Estrategia Full Popular (ejecución) |
| SUB_TOT_AUX | Subtotal Auxiliares (=A en jerarquía) |

### Técnicos Laborales (2 años)
| Atributo | Descripción |
|----------|-------------|
| TCO_REG_PRE | Técnico Laboral Regular - Modalidad Presencial (ejecución) |
| TCO_REG_VIR | Técnico Laboral Regular - Modalidad Virtual (ejecución) |
| TCO_CAMPESE | Técnico Laboral - Estrategia CampeSENA (ejecución) |
| TCO_FULL_PO | Técnico Laboral - Estrategia Full Popular (ejecución) |
| TCO_ART_MED | Técnico Laboral - Articulación con Media (ejecución) |
| SUB_TCO_LAB | Subtotal Técnico Laboral (=C en jerarquía) |
| SUB_TCO_STC | Subtotal Técnico Laboral STC (categoría específica) |

### Profesional Técnico
| Atributo | Descripción |
|----------|-------------|
| PROF_TECNIC | Profesional Técnico (=T en jerarquía) |

### Totales Formación Laboral y Titulada
| Atributo | Descripción |
|----------|-------------|
| TOT_FOR_LAB | Total Formación Laboral (=D = A+B+C+T) |
| TOT_FOR_TIT | Total Formación Titulada (=F = D+E) |

---

## FORMACIÓN COMPLEMENTARIA

### Programas Bilingües
| Atributo | Descripción |
|----------|-------------|
| COM_VIR_SBI | Complementaria Virtual Sin Bilingüismo (ejecución) |
| COM_PRE_SBI | Complementaria Presencial Sin Bilingüismo (ejecución) |
| COM_BIL_VIR | Complementaria Bilingüismo Virtual (ejecución) |
| COM_BIL_PRE | Complementaria Bilingüismo Presencial (ejecución) |
| SUB_PRO_BIN | Subtotal Programas Bilingües |

### Otras Estrategias Complementarias
| Atributo | Descripción |
|----------|-------------|
| COM_CAMPESE | Complementaria - Estrategia CampeSENA (ejecución) |
| COM_FULL_PO | Complementaria - Estrategia Full Popular (ejecución) |
| SUB_COM_FCEC | Subtotal Complementaria FCEC (categoría específica) |

### Totales Complementaria
| Atributo | Descripción |
|----------|-------------|
| TOT_COMPLEM | Total Formación Complementaria (=N en jerarquía) |

---

## TOTALES FORMACIÓN PROFESIONAL INTEGRAL

| Atributo | Descripción |
|----------|-------------|
| TOT_PROF_IN | Total Formación Profesional Integral (=O = N+F) |
| TOT_FP_CAME | Total FPI - Estrategia CampeSENA |
| TOT_FP_FULL | Total FPI - Estrategia Full Popular |
| TOT_FP_VIRT | Total FPI - Modalidad Virtual |

---

## PORCENTAJES DE CUMPLIMIENTO (Prefijo R_)

### Formación Laboral
| Atributo | Descripción |
|----------|-------------|
| R_FOR_LAB_P | % Cumplimiento Formación Laboral Presencial |
| R_FOR_LAB_V | % Cumplimiento Formación Laboral Virtual |
| R_FOR_LABOR | % Cumplimiento Total Formación Laboral |

### Educación Superior
| Atributo | Descripción |
|----------|-------------|
| R_EDU_SUP_P | % Cumplimiento Educación Superior Presencial |
| R_EDU_SUP_V | % Cumplimiento Educación Superior Virtual |
| R_TOT_E_SUP | % Cumplimiento Total Educación Superior |

### Formación Titulada
| Atributo | Descripción |
|----------|-------------|
| R_TOT_TIT_P | % Cumplimiento Formación Titulada Presencial |
| R_TOT_TIT_V | % Cumplimiento Formación Titulada Virtual |
| R_TOT_TITUL | % Cumplimiento Total Formación Titulada |

### Formación Complementaria
| Atributo | Descripción |
|----------|-------------|
| R_COMPLEM_P | % Cumplimiento Complementaria Presencial |
| R_COMPLEM_V | % Cumplimiento Complementaria Virtual |
| R_COMPLEM_T | % Cumplimiento Total Complementaria |

### Formación Profesional Integral
| Atributo | Descripción |
|----------|-------------|
| R_FRM_PRO_P | % Cumplimiento FPI Presencial |
| R_FRM_PRO_V | % Cumplimiento FPI Virtual |
| R_FRM_PRO_T | % Cumplimiento Total FPI |

### Programas Bilingües
| Atributo | Descripción |
|----------|-------------|
| R_PRG_BIL_P | % Cumplimiento Programas Bilingües Presencial |
| R_PRG_BIL_V | % Cumplimiento Programas Bilingües Virtual |
| R_PRG_BIL_T | % Cumplimiento Total Programas Bilingües |

### Estrategias Especiales
| Atributo | Descripción |
|----------|-------------|
| R_CAMPESENA | % Cumplimiento Estrategia CampeSENA |
| R_FULL | % Cumplimiento Estrategia Full Popular |

---

## CLASIFICACIÓN SEMÁFORO (Prefijo C_)

Estados posibles:
- **bajo** (Rojo): < 82.9%
- **vulnerable** (Amarillo): 83% - 89.99%
- **buena** (Verde): 90% - 100.59%
- **sobreejecucion** (Naranja): > 100.59%

| Atributo | Descripción |
|----------|-------------|
| C_FORMA_LAB | Clasificación semáforo Formación Laboral |
| C_EDU_SUPER | Clasificación semáforo Educación Superior |
| C_FRM_TITUL | Clasificación semáforo Formación Titulada |
| C_FRM_COMP | Clasificación semáforo Formación Complementaria |
| C_FRM_PR_IN | Clasificación semáforo Formación Profesional Integral |
| C_TCO_ARMED | Clasificación semáforo Técnico Articulación Media |
| C_TCO_STC | Clasificación semáforo Técnico STC |
| C_COM_FCEC | Clasificación semáforo Complementaria FCEC |
| C_CAMPESENA | Clasificación semáforo Estrategia CampeSENA |
| C_FULL | Clasificación semáforo Estrategia Full Popular |

---

## METAS OBJETIVO (Prefijo M_)

### Formación Laboral
| Atributo | Descripción |
|----------|-------------|
| M_FOR_LAB_P | Meta Formación Laboral Presencial |
| M_FOR_LAB_V | Meta Formación Laboral Virtual |
| M_FOR_LABOR | Meta Total Formación Laboral |

### Educación Superior
| Atributo | Descripción |
|----------|-------------|
| M_EDU_SUP_P | Meta Educación Superior Presencial |
| M_EDU_SUP_V | Meta Educación Superior Virtual |
| M_TOT_E_SUP | Meta Total Educación Superior |

### Formación Titulada
| Atributo | Descripción |
|----------|-------------|
| M_TOT_TIT_P | Meta Formación Titulada Presencial |
| M_TOT_TIT_V | Meta Formación Titulada Virtual |
| M_TOT_TITUL | Meta Total Formación Titulada |

### Formación Complementaria
| Atributo | Descripción |
|----------|-------------|
| M_COMPLEM_P | Meta Complementaria Presencial |
| M_COMPLEM_V | Meta Complementaria Virtual |
| M_COMPLEM_T | Meta Total Complementaria |

### Formación Profesional Integral
| Atributo | Descripción |
|----------|-------------|
| M_FRM_PRO_P | Meta FPI Presencial |
| M_FRM_PRO_V | Meta FPI Virtual |
| M_FRM_PRO_T | Meta Total FPI |

### Programas Bilingües
| Atributo | Descripción |
|----------|-------------|
| M_PRG_BIL_P | Meta Programas Bilingües Presencial |
| M_PRG_BIL_V | Meta Programas Bilingües Virtual |
| M_PRG_BIL_T | Meta Total Programas Bilingües |

### Estrategias Especiales
| Atributo | Descripción |
|----------|-------------|
| M_CAMPESENA | Meta Estrategia CampeSENA |
| M_FULL | Meta Estrategia Full Popular |

---

## Jerarquía de Cálculo

```
TOTAL FPI (O) = Formación Titulada (F) + Complementaria (N)

Formación Titulada (F) = Formación Laboral (D) + Educación Superior (E)

Formación Laboral (D) = Auxiliares (A) + Operarios (B) + Técnico Laboral (C) + Prof. Técnico (T)

Educación Superior (E) = Tecnólogos

Complementaria (N) = Bilingües + CampeSENA + Full Popular + otros
```