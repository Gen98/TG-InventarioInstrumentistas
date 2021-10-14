import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InicioComponent } from './components/inicio/inicio.component';
import { InventarioComponent } from './inventario/inventario/inventario.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { MovimientosComponent } from './bounes/movimientos/movimientos.component';
import { AlmacenesComponent } from './components/almacenes/almacenes.component';
import { XRecibirComponent } from './bounes/x-recibir/x-recibir.component';
import { PorAtenderComponent } from './odc/por-atender/por-atender.component';
import { ProcesarComponent } from './odc/procesar/procesar.component';
import { LoginComponent } from './pages/login/login.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: InicioComponent,
    pathMatch: 'full'
  },
  {
    path: 'inventario',
    component: InventarioComponent
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
    path: 'xRecibir',
    component: XRecibirComponent
  },
  {
    path: 'xAtender',
    component: PorAtenderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'xAtender/preparar/:idSolicitud/:idListaPrecio',
    component: ProcesarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
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
