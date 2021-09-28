import { Component, OnInit } from '@angular/core';
import { Registro } from '../../interfaces/registro.interface';
import { StorageService } from '../../services/storage.service';
import { DexieService } from '../../services/dexie.service';
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
  movimientos: any = [];
  sincronizados: any[] = [];
  isBounes: boolean = true;
  constructor( private storageServicio: StorageService, private dexieService: DexieService ) { }

  ngOnInit(): void {
    this.getRegistros();
    this.getSincronizados();
  }

  registrarMovimiento(movimiento: Movimiento): void {
    this.dexieService.addMovimiento(movimiento).then(async() => {
      this.getRegistros();
    });
    // this.storageServicio.addMovimiento(movimiento);
    // setTimeout(() => {
    //   this.getRegistros();
    // }, 1000);
  }

  actualizarMovimiento(movimiento: Movimiento): void {
    this.dexieService.updateMovimiento(movimiento).then(async() => {
      this.getRegistros();
      Swal.fire({
        icon: 'success',
        title: 'Movimiento actualizado exitosamente',
        timer: 2000
      });
    });
    // if (this.storageServicio.updateMovimiento(movimiento)) {
    //   setTimeout(() => {
    //     this.getRegistros();
    //   }, 1000);
    //   Swal.fire({
    //     icon: 'success',
    //     title: 'Movimiento actualizado exitosamente',
    //     timer: 2000
    //   });
    // }
  }

  getRegistros(): void {
    // this.movimientos = this.storageServicio.getMovimientos();
    this.dexieService.getMovimientos().then(async(e) => {
      this.movimientos = e;
    });
  }

  getSincronizados(): void {
    // this.sincronizados = this.storageServicio.getSincronizados();
    this.dexieService.getSincronizados().then(async(e) => {
      this.sincronizados = e;
    });
  }

  eliminarRegistros(): void {
    this.storageServicio.deleteItems();
  }

  eliminarRegistro( registro: Registro ): void {
    this.storageServicio.deleteItem(registro);
    this.getRegistros();
  }

  eliminarMovimiento(movimiento: Movimiento): void {
    this.dexieService.deleteMovimiento(movimiento).then(async(e) => {
      this.getRegistros();
    });
    // this.storageServicio.deleteMovimiento(movimiento);
    // this.getRegistros();
  }

  async sincronizarMovimientos() {
    $('.sincronizarBtn').prop("disabled", true);
    Swal.fire({
      allowOutsideClick: false,
      text: 'Cargando, no salgas de esta ventana...'
    });
    Swal.showLoading();
    (await this.dexieService.sincronizarMovimientos()).subscribe( resp => {
      this.dexieService.deleteSincronizados().then(async() => {
        resp.forEach((element:any) => {
          this.dexieService.addSincronizado(element);
        });
        this.dexieService.deleteMovimientos().then(async() => {
          Swal.fire({
            icon: 'success',
            title: 'Movimientos sincronizados exitosamente.',
            timer: 2000
          });
          this.getRegistros();
          this.getSincronizados();
        })
      });
      // setTimeout(() => {
      //   resp.forEach((element:any) => {
      //     this.storageServicio.addSincronizado(element);
      //   });
      //   this.storageServicio.deleteMovimientos();
      //   setTimeout(() => {
      //     Swal.fire({
      //       icon: 'success',
      //       title: 'Movimientos sincronizados exitosamente.',
      //       timer: 2000
      //     });
      //     this.getRegistros();
      //     this.getSincronizados();
      //   }, 1000);
      // }, 2000);
    }, err => {
      Swal.fire({
        icon: 'error',
        text: 'Ha ocurrido un error, intentelo más tarde.',
        timer: 2000
      })
    });
  }
}
