import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { ExcelService } from '../../services/excel.service';
import { Registro } from 'src/app/interfaces/registro.interface';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  registros: Registro[] = [];
  dentroRango: boolean = true;
  constructor( private storageServicio: StorageService, private excelService: ExcelService) { }

  ngOnInit(): void {
    this.getRegistros();
  }

  registrarNuevo(registro: Registro): void {
    this.storageServicio.addItem(registro);
    this.getRegistros();
  }

  getRegistros(): void {
    this.registros = this.storageServicio.getItems();
    this.dentroRango = this.storageServicio.verificarLimiteRegistros();
  }

  exportAsXLSX():void {
    this.getRegistros();
    this.excelService.exportAsExcelFile(this.registros, 'Inventario');
    setTimeout(() => {
      this.eliminarRegistros();
      this.getRegistros();
    }, 3000);
  }

  eliminarRegistros(): void {
    this.storageServicio.deleteItems();
  }

  eliminarRegistro( registro: Registro ): void {
    this.storageServicio.deleteItem(registro);
    this.getRegistros();
  }
}
