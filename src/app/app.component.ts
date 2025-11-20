import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, HttpClientModule],
  template: `
    <div class="navbar" [class.scrolled]="isScrolled">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <div class="navbar-brand d-flex align-items-center" [class.compact]="isScrolled">
          <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
               alt="Logo SENA"
               class="navbar-logo">
          <span *ngIf="!isScrolled">SENA - Seguimiento de Metas</span>
        </div>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          </li>
          <!-- <li class="nav-item">
            <a class="nav-link" routerLink="/metas" routerLinkActive="active">Metas FPI</a>
          </li> -->
          <li class="nav-item">
            <a class="nav-link" routerLink="/estrategias" routerLinkActive="active">Estrategias</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/niveles" routerLinkActive="active">Niveles</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/regionales" routerLinkActive="active">Mapa</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/consulta-regional" routerLinkActive="active">Consulta Regional</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/metas-regionales-centros" routerLinkActive="active">API Metas</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="container-fluid">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'SENA - Seguimiento de Metas';
  isScrolled = false;

  ngOnInit(): void {
    // Verificar el estado inicial del scroll
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  private checkScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }
}
