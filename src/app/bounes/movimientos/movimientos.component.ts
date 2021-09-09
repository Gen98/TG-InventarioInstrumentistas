import { Component, OnInit } from '@angular/core';
import { Registro } from '../../interfaces/registro.interface';
import { StorageService } from '../../services/storage.service';
import { Movimiento } from '../../interfaces/movimiento.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent implements OnInit {

  noSincronizados: boolean = true;
  movimientos: Movimiento[] = [];
  isBounes: boolean = true;
  constructor( private storageServicio: StorageService ) { }

  ngOnInit(): void {
    this.getRegistros();
  }

  registrarMovimiento(movimiento: Movimiento): void {
    this.storageServicio.addMovimiento(movimiento);
    setTimeout(() => {
      this.getRegistros();
    }, 1000);
  }

  actualizarMovimiento(movimiento: Movimiento): void {
    if (this.storageServicio.updateMovimiento(movimiento)) {
      setTimeout(() => {
        this.getRegistros();
      }, 1000);
      Swal.fire({
        icon: 'success',
        title: 'Movimiento actualizado exitosamente',
        timer: 2000
      });
    }
  }

  getRegistros(): void {
    this.movimientos = this.storageServicio.getMovimientos();
  }

  eliminarRegistros(): void {
    this.storageServicio.deleteItems();
  }

  eliminarRegistro( registro: Registro ): void {
    this.storageServicio.deleteItem(registro);
    this.getRegistros();
  }

  eliminarMovimiento(movimiento: Movimiento): void {
    this.storageServicio.deleteMovimiento(movimiento);
    this.getRegistros();
  }
}
