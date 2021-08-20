import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { Registro } from '../../interfaces/registro.interface';

@Component({
  selector: 'app-exportar',
  templateUrl: './exportar.component.html',
  styleUrls: ['./exportar.component.css']
})
export class ExportarComponent implements OnInit {

  @Output() exportExcel :EventEmitter<Registro> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  exportAsXLSX() {
    Swal.fire({
      title: 'Generar Excel',
      text: '¿Deseas exportar la información y eliminar los registros del sistema?',
      icon: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#02a3b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exportExcel.emit();
      }
    });
  }
}
