import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MetasComponent } from './pages/metas/metas.component';
import { EstrategiasComponent } from './pages/estrategias/estrategias.component';
import { NivelesComponent } from './pages/niveles/niveles.component';
import { MetasRegionalesComponent } from './components/metas-regionales.component';
import { ConsultaRegionalComponent } from './pages/consulta-regional/consulta-regional.component';
import { MetasRegionalesYCentrosComponent } from './pages/metas-regionales-y-centros/metas-regionales-y-centros.component';
import { ConsultaNacionalComponent } from './pages/consulta-nacional/consulta-nacional.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - SENA Metas' },
  { path: 'metas', component: MetasComponent, title: 'Metas FPI - SENA' },
  { path: 'estrategias', component: EstrategiasComponent, title: 'Estrategias - SENA' },
  { path: 'niveles', component: NivelesComponent, title: 'Niveles de Formación - SENA' },
  { path: 'regionales', component: MetasRegionalesComponent, title: 'Metas Regionales - SENA' },
  { path: 'consulta-regional', component: ConsultaRegionalComponent, title: 'Consulta Regional y Centros - SENA' },
  { path: 'consulta-nacional', component: ConsultaNacionalComponent, title: 'Consulta Nacional - SENA' },
  { path: 'metas-regionales-centros', component: MetasRegionalesYCentrosComponent, title: 'Metas Regionales y Centros - SENA' },
  { path: '**', redirectTo: '/dashboard' }
];
