import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SeccionInfo } from '../models/seccion-info.model';

@Component({
  selector: 'app-seccion-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="seccion-info-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          {{ data.titulo }}
        </h2>
        <button mat-icon-button class="close-button" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="fecha-corte">
          <mat-icon class="calendar-icon">event</mat-icon>
          <span><strong>Fecha de corte:</strong> {{ formatearFecha(data.fechaCorte) }}</span>
        </div>

        <div class="descripcion">
          <h3>Descripción</h3>
          <p>{{ data.descripcion }}</p>
        </div>

        <div class="indicadores">
          <h3>Indicadores incluidos</h3>
          <ul>
            <li *ngFor="let indicador of data.indicadores">
              <mat-icon class="check-icon">check_circle</mat-icon>
              {{ indicador }}
            </li>
          </ul>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-raised-button color="primary" (click)="onClose()">
          Cerrar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .seccion-info-dialog {
      max-width: 600px;
      min-width: 400px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: .25rem;
      background: linear-gradient(135deg, #39b54a 0%, #2e9a3d 100%);
      color: white;
      margin: -2px -2px 0 -2px;
      border-radius: 4px 4px 0 0;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.15rem;
        margin: 0;
        font-size: 1.15rem;
        font-weight: 600;
      }

      .close-button {
        color: white;
        margin-top: -8px;
        margin-right: -8px;
      }
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 60vh;
      overflow-y: auto;

      .fecha-corte {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background-color: #e8f5e9;
        border-left: 4px solid #39b54a;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        color: #1b5e20;

        .calendar-icon {
          color: #39b54a;
          font-size: 1.25rem;
        }

        strong {
          color: #1b5e20;
        }
      }

      .descripcion {
        margin-bottom: 1.5rem;

        h3 {
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          &::before {
            content: '';
            width: 4px;
            height: 1.2rem;
            background-color: #39b54a;
            border-radius: 2px;
          }
        }

        p {
          color: #555;
          line-height: 1.7;
          text-align: justify;
        }
      }

      .indicadores {
        h3 {
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          &::before {
            content: '';
            width: 4px;
            height: 1.2rem;
            background-color: #39b54a;
            border-radius: 2px;
          }
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 0.5rem 0;
            color: #555;
            line-height: 1.5;

            .check-icon {
              color: #39b54a;
              font-size: 1.25rem;
              width: 1.25rem;
              height: 1.25rem;
              margin-top: 0.1rem;
              flex-shrink: 0;
            }
          }
        }
      }
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      justify-content: flex-end;

      button {
        background-color: #39b54a;
        color: white;
        font-weight: 600;
        padding: 0.5rem 2rem;

        &:hover {
          background-color: #2e9a3d;
        }
      }
    }

    @media (max-width: 600px) {
      .seccion-info-dialog {
        min-width: 300px;
      }

      .dialog-header h2 {
        font-size: .95rem;
      }

      .dialog-content {
        padding: .75rem;
        p {
          font-size: .9rem;
        }
      }
    }
  `]
})
export class SeccionInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SeccionInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SeccionInfo
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`;
  }
}
