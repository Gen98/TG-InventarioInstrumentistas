import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from './shared/shared.module';
import { OdcModule } from './odc/odc.module';
import { GastosModule } from './gastos/gastos.module';

import { AppComponent } from './app.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DataTablesModule } from 'angular-datatables';
import { AlmacenesComponent } from './components/almacenes/almacenes.component';
import { LoginComponent } from './pages/login/login.component';
import { BounesModule } from './bounes/bounes.module';
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { EncuestaPageComponent } from './pages/encuesta-page/encuesta-page.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    CatalogoComponent,
    AlmacenesComponent,
    LoginComponent,
    EncuestaComponent,
    EncuestaPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DataTablesModule,
    WebcamModule,
    SharedModule,
    BounesModule,
    OdcModule,
    GastosModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
