import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { NuevoComponent } from './nuevo/nuevo.component';
import { PorAutorizarComponent } from './por-autorizar/por-autorizar.component';



@NgModule({
  declarations: [
    PorAutorizarComponent,
    NuevoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule,
    NgbModule,
    PdfViewerModule
  ]
})
export class GastosModule { }
