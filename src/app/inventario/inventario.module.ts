import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataTablesModule } from 'angular-datatables';

import { InventarioComponent } from './inventario/inventario.component';
import { TablaComponent } from './tabla/tabla.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { ExportarComponent } from './exportar/exportar.component';



@NgModule({
  declarations: [
    InventarioComponent,
    TablaComponent,
    RegistrarComponent,
    ExportarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule
  ],
  exports: [
    InventarioComponent
  ]
})
export class InventarioModule { }
