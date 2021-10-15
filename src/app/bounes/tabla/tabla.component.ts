import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Movimiento } from '../../interfaces/movimiento.interface';
import { Registro } from 'src/app/interfaces/registro.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements OnInit{

  dtOptions: DataTables.Settings = {};
  
  @Input() data: any[] = [];
  @Input() isBounes: boolean = false;
  @Input() isSync: boolean = false;
  @Input() soloVisualizar: boolean = false;
  @Output() eliminarItem :EventEmitter<Registro> = new EventEmitter();
  @Output() visualizarMovimiento :EventEmitter<Movimiento> = new EventEmitter();
  @Output() eliminarMov :EventEmitter<Movimiento> = new EventEmitter();

  constructor( ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pageLength: 20,
      lengthMenu: [ 10, 20, 25, 50 ],
      order: [
        [0, 'desc']
      ],
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
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (item.cant == 1) {
          item.deleteAll = true;
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
          if (option.isConfirmed) {
            if (!option.value || !['_total', '_parcial'].includes(option.value)) {
              this.mostrarError();
            } else {
              if (option.value == "_total") {
                item.deleteAll = true;
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

  detallesMovimiento(movimiento: Movimiento, movimientoIndex: number): void {
    movimiento.index = movimientoIndex;
    this.visualizarMovimiento.emit(movimiento);
  }

  eliminarMovimiento(movimiento: Movimiento, movimientoIndex: number): void {
    movimiento.index = movimientoIndex;
    Swal.fire({
      title: 'Eliminar',
      text: '¿Deseas eliminar este movimiento?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#02a3b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Eliminación exitosa',
          timer: 2000
        });
        this.eliminarMov.emit(movimiento);
      }
    });
  }
}
