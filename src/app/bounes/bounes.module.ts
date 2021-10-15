import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { WebcamModule } from 'ngx-webcam';
import { DataTablesModule } from 'angular-datatables';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';

import { TablaComponent } from './tabla/tabla.component';
import { SignatureComponent } from './signature/signature.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { AddImagesComponent } from './add-images/add-images.component';
import { SincronizarComponent } from './sincronizar/sincronizar.component';
import { MovimientosComponent } from './movimientos/movimientos.component';
import { EscanerMovilComponent } from './escaner-movil/escaner-movil.component';
import { SincronizadosComponent } from './sincronizados/sincronizados.component';
import { NoSincronizadosComponent } from './no-sincronizados/no-sincronizados.component';

@NgModule({
  declarations: [
    TablaComponent,
    AddImagesComponent,
    RegistrarComponent,
    SignatureComponent,
    MovimientosComponent,
    SincronizarComponent,
    EscanerMovilComponent,
    SincronizadosComponent,
    NoSincronizadosComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DataTablesModule,
    AngularSignaturePadModule,
    ZXingScannerModule,
    WebcamModule
  ],
  exports: [
    MovimientosComponent,
  ]
})
export class BounesModule { }
