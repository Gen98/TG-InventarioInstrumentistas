import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

import { PorAtenderComponent } from './por-atender/por-atender.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { VerComponent } from './ver/ver.component';
import { ProcesarComponent } from './procesar/procesar.component';
import { DetalleComponent } from './detalle/detalle.component';
import { CotizarComponent } from './cotizar/cotizar.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    PorAtenderComponent,
    DatepickerComponent,
    NuevoComponent,
    VerComponent,
    ProcesarComponent,
    DetalleComponent,
    CotizarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule,
    AngularMyDatePickerModule,
    PdfViewerModule,
    NgbModule,
  ],
  exports: [
    PorAtenderComponent
  ]
})
export class OdcModule { }
