import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataTablesModule } from 'angular-datatables';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { WebcamModule } from 'ngx-webcam';

import { InventarioComponent } from './inventario/inventario.component';
import { TablaComponent } from './tabla/tabla.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { ExportarComponent } from './exportar/exportar.component';
import { EscanerMovilComponent } from '../components/escaner-movil/escaner-movil.component';



@NgModule({
  declarations: [
    InventarioComponent,
    TablaComponent,
    RegistrarComponent,
    ExportarComponent,
    EscanerMovilComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule,
    ZXingScannerModule,
    WebcamModule
  ],
  exports: [
    InventarioComponent,
    RegistrarComponent,
    TablaComponent,
    EscanerMovilComponent,
  ]
})
export class InventarioModule { }
