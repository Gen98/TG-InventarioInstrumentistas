import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Registro } from 'src/app/interfaces/registro.interface';
import Swal from 'sweetalert2';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements OnInit{

  dtOptions: DataTables.Settings = {};
  
  @Input() data: Registro[] = [];
  @Output() eliminarItem :EventEmitter<Registro> = new EventEmitter();

  constructor( private storageService: StorageService ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthMenu: [ 10, 20, 25, 50 ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      }
    };
  }

  eliminarRegistro( item: Registro ): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Deseas eliminar este registro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#02a3b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (item.cant == 1) {
          this.eliminarItem.emit(item);
          return;
        }
        Swal.fire({
          title: 'Eliminación',
          input: 'radio',
          inputOptions: {
            '_total': 'Total',
            '_parcial': 'Parcial'
          },
          showCancelButton: true,
          confirmButtonColor: '#02a3b5',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar'
        }).then((option) => {
          console.log(option);
          if (option.isConfirmed) {
            if (!option.value || !['_total', '_parcial'].includes(option.value)) {
              this.mostrarError();
            } else {
              if (option.value == "_total") {
                this.eliminarItem.emit(item);
              } else {
                Swal.fire({
                  text: '¿Cuantas unidades deseas eliminar?',
                  icon: 'question',
                  input: 'number',
                  showCancelButton: true,
                  confirmButtonColor: '#02a3b5',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Confirmar',
                  cancelButtonText: 'Cancelar'
                }).then((res) => {
                  if (res.isConfirmed) {
                    if (res.value && res.value <= item.cant && res.value > 0) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Eliminación exitosa',
                        text: `Haz eliminado ${res.value} unidades de ${item.cant} del producto ${item.desc}`
                      });
                      item.cant = item.cant - res.value;
                      this.eliminarItem.emit(item);
                    } else {
                      this.mostrarError();
                    }
                  }
                });
              }
            }
          }
        });
      }
    });
  }

  mostrarError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Opción inválida'
    });
  }
}
