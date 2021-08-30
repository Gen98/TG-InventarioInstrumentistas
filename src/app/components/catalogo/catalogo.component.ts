import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Registro } from '../../interfaces/registro.interface';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {

  dtOptions: DataTables.Settings = {};

  constructor(private storageServicio: StorageService ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      ajax: '../../../assets/files/data.json',
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      order: [],
      rowCallback: (row: Node, data: any, index: number) => {
        const self = this;
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)
        // Note: In newer jQuery v3 versions, `unbind` and `bind` are 
        // deprecated in favor of `off` and `on`
        $('.btn', row).off('click');
        $('.btn', row).on('click', () => {
          if (self.storageServicio.verificarLimiteRegistros()) {
            self.registrar(data.Codigo, data.Descripcion);
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Alerta',
              text: 'Haz llegado al limite, necesitas exportar la información para continuar.'
            });
          }
        });
        return row;
      },
      columns: [
        {
          title: 'Código',
          data: 'Codigo',
          className: 'text-center',
          width: '15%'
        },
        {
          title: 'Descripción',
          data: 'Descripcion'
        },
        {
          title: 'Acciones',
          data: 'Codigo',
          render: function ( data, type, row, meta ) {
            return '<div class="btn-group" role="group">' +
                        '<button class="btn btn-outline-dark btn-sm">' +
                            '<i class="fas fa-barcode"></i>' +
                        '</button>' +
                    '</div>';
          }
        }
      ]
    };
  }

  registrar(codigo: string, desc: string) {
    // Swal.fire({
    //   text: 'Ingresa el lote',
    //   input: 'text',
    //   showCancelButton: true,
    //   confirmButtonColor: '#02a3b5',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'Confirmar',
    //   cancelButtonText: 'Cancelar'
    // }).then((lote) => {
    //   if (lote.isConfirmed && /^([a-zA-Z0-9-/]+)$/.test(lote.value)) {
        Swal.fire({
          text: 'Ingresa la cantidad',
          input: 'text',
          showCancelButton: true,
          confirmButtonColor: '#02a3b5',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar'
        }).then((cantidad) => {
          if (cantidad.isConfirmed && /^\d+$/.test(cantidad.value)) {
            Swal.fire({
              title: 'Confirma los datos',
              text: `Producto: ${codigo} - Lote: 1 - Cantidad: ${cantidad.value}`,
              icon: 'info',
              allowOutsideClick: false,
              showCancelButton: true,
              confirmButtonColor: '#02a3b5',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Confirmar'
            }).then((result) => {
              if (result.isConfirmed) {
                const nuevoRegistro: Registro = {
                  code: codigo,
                  desc: desc,
                  lote: '1',
                  cant: cantidad.value
                }
                this.registrarNuevo(nuevoRegistro);
              }
            });
          } else if (cantidad.isConfirmed && !(/^\d+$/.test(cantidad.value))) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Cantidad inválida'
            });
          }
        });
      // } else if (lote.isConfirmed && !(/^([a-zA-Z0-9-/]+)$/.test(lote.value))) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Error',
      //     text: 'Lote inválido'
      //   });
      // }
    // });
  }

  registrarNuevo(registro: Registro): void {
    this.storageServicio.addItem(registro);
  }
}
