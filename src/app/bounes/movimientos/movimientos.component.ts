import { Component, OnInit } from '@angular/core';
import { Registro } from '../../interfaces/registro.interface';
import { StorageService } from '../../services/storage.service';
import { Movimiento } from '../../interfaces/movimiento.interface';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent implements OnInit {

  noSincronizados: boolean = true;
  movimientos: Movimiento[] = [];
  sincronizados: any[] = [];
  isBounes: boolean = true;
  constructor( private storageServicio: StorageService ) { }

  ngOnInit(): void {
    this.getRegistros();
    this.getSincronizados();
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

  getSincronizados(): void {
    this.sincronizados = this.storageServicio.getSincronizados();
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

  sincronizarMovimientos(): void {
    $('.sincronizarBtn').prop("disabled", true);
    this.storageServicio.sincronizarMovimientos().subscribe( resp => {
      this.storageServicio.deleteSincronizados();
      setTimeout(() => {
        resp.forEach((element:any) => {
          this.storageServicio.addSincronizado(element);
        });
        this.storageServicio.deleteMovimientos();
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Movimientos sincronizados exitosamente.',
            timer: 2000
          });
          this.getRegistros();
          this.getSincronizados();
        }, 1000);
      }, 2000);
    }, err => {
      Swal.fire({
        icon: 'error',
        text: 'Ha ocurrido un error, intentelo más tarde.',
        timer: 2000
      })
    });
  }
}
