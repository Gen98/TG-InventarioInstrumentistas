import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Registro } from '../interfaces/registro.interface';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  exportAsExcelFile(json: Registro[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     const fecha = this.getFecha();
     FileSaver.saveAs(data, fileName + '_' + fecha + EXCEL_EXTENSION);
  }

  private getFecha() {
    let fecha = new Date(),
          mes = '' + (fecha.getMonth() + 1),
          dia = '' + fecha.getDate(),
          anio = fecha.getFullYear();
  
      if (mes.length < 2) 
          mes = '0' + mes;
      if (dia.length < 2) 
          dia = '0' + dia;
  
      return [dia, mes, anio].join('-');

  }
}
