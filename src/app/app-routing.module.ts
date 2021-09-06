import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InicioComponent } from './components/inicio/inicio.component';
import { InventarioComponent } from './inventario/inventario/inventario.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { MovimientosComponent } from './bounes/movimientos/movimientos.component';

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
    path: 'movimientos',
    component: MovimientosComponent
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
