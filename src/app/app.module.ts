import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from './shared/shared.module';
import { OdcModule } from './odc/odc.module';

import { AppComponent } from './app.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DataTablesModule } from 'angular-datatables';
import { AlmacenesComponent } from './components/almacenes/almacenes.component';
import { LoginComponent } from './pages/login/login.component';
import { BounesModule } from './bounes/bounes.module';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    CatalogoComponent,
    AlmacenesComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DataTablesModule,
    SharedModule,
    BounesModule,
    OdcModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
