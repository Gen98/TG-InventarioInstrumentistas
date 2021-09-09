import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { SharedModule } from './shared/shared.module';
import { InventarioModule } from './inventario/inventario.module';

import { AppComponent } from './app.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DataTablesModule } from 'angular-datatables';
import { MovimientosComponent } from './bounes/movimientos/movimientos.component';
import { AddImagesComponent } from './bounes/add-images/add-images.component';
import { NoSincronizadosComponent } from './bounes/no-sincronizados/no-sincronizados.component';
import { SincronizadosComponent } from './bounes/sincronizados/sincronizados.component';
import { SignatureComponent } from './components/signature/signature.component';
import { SincronizarComponent } from './components/sincronizar/sincronizar.component';
import { AlmacenesComponent } from './components/almacenes/almacenes.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    CatalogoComponent,
    MovimientosComponent,
    AddImagesComponent,
    NoSincronizadosComponent,
    SincronizadosComponent,
    SignatureComponent,
    SincronizarComponent,
    AlmacenesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DataTablesModule,
    AngularSignaturePadModule,
    SharedModule,
    InventarioModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
