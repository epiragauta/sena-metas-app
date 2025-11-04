import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MetasComponent } from './pages/metas/metas.component';
import { EstrategiasComponent } from './pages/estrategias/estrategias.component';
import { NivelesComponent } from './pages/niveles/niveles.component';
import { MetasRegionalesComponent } from './components/metas-regionales.component';
import { ConsultaRegionalComponent } from './pages/consulta-regional/consulta-regional.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - SENA Metas' },
  { path: 'metas', component: MetasComponent, title: 'Metas FPI - SENA' },
  { path: 'estrategias', component: EstrategiasComponent, title: 'Estrategias - SENA' },
  { path: 'niveles', component: NivelesComponent, title: 'Niveles de Formación - SENA' },
  { path: 'regionales', component: MetasRegionalesComponent, title: 'Metas Regionales - SENA' },
  { path: 'consulta-regional', component: ConsultaRegionalComponent, title: 'Consulta Regional y Centros - SENA' },
  { path: '**', redirectTo: '/dashboard' }
];
