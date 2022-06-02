import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InicioComponent } from './pages/inicio/inicio.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { MovimientosComponent } from './bounes/movimientos/movimientos.component';
import { AlmacenesComponent } from './components/almacenes/almacenes.component';
import { PorAtenderComponent } from './odc/por-atender/por-atender.component';
import { PorAtenderOnlineComponent } from './odc/por-atender-online/por-atender-online.component';
import { ProcesarComponent } from './odc/procesar/procesar.component';
import { ProcesarOnlineComponent } from './odc/procesar-online/procesar-online.component';
import { LoginComponent } from './pages/login/login.component';
import { EncuestaPageComponent } from './pages/encuesta-page/encuesta-page.component';
import { PorAutorizarComponent } from './gastos/por-autorizar/por-autorizar.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: InicioComponent,
    pathMatch: 'full'
  },
  {
    path: 'catalogo',
    component: CatalogoComponent
  },
  {
    path: 'almacenes',
    component: AlmacenesComponent
  },
  {
    path: 'movimientos',
    component: MovimientosComponent
  },
  {
    path: 'xAtender',
    component: PorAtenderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'xAtender-online',
    component: PorAtenderOnlineComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'xAtender/preparar/:idSolicitud/:idListaPrecio',
    component: ProcesarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'xAtender-online/preparar/:idSolicitud/:idListaPrecio',
    component: ProcesarOnlineComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'encuesta',
    component: EncuestaPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'gastos',
    component: PorAutorizarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
