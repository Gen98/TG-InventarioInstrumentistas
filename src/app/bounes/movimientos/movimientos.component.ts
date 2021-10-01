import { Component, OnInit } from '@angular/core';
import { Registro } from '../../interfaces/registro.interface';
import { StorageService } from '../../services/storage.service';
import { DexieService } from '../../services/dexie.service';
import { Movimiento } from '../../interfaces/movimiento.interface';
import Swal from 'sweetalert2';
import { BounesService } from '../../services/bounes.service';
import { from } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';

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
  constructor( 
    private storageServicio: StorageService, 
    private dexieService: DexieService, 
    private bounesService: BounesService ) { }

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

  validarSincronizacion() {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Cargando, no salgas de esta ventana...'
    });
    Swal.showLoading();

    let observables = [];
    for (const mov of this.movimientos) {
      let param = mov.folio ? mov.folio : null;
      if (param && (param.startsWith("NS_") || param.startsWith("FS_") || param.startsWith("BS_"))) {
        observables.push(this.bounesService.consultarPartidasFolio(param));
      }
    }

    from(observables).pipe(
      concatMap((key) => key),
      map((item) => {
        return item;
      })
    ).pipe(toArray()
    ).subscribe(
      (val) => { 
        console.log(val);
        this.recorrerPartidas(val);
      },
      (err) => { 
        console.log(err);
        Swal.fire({
          icon: 'warning',
          text: 'Ha ocurrido un error, intenta más tarde',
        });
      }
    )
  }

  recorrerPartidas(responses: any[]): void {
    let feedback = true;
    this.movimientos.forEach((mov: Movimiento) => {
      if (mov.folio && feedback && (mov.folio.startsWith("NS_") || mov.folio.startsWith("FS_") || mov.folio.startsWith("BS_"))) {
        console.log(mov.folio);
        let responseIndex = responses.findIndex((res) => {
          return res.folio === mov.folio;
        });
        if (responses[responseIndex].encontrado) {
          let partidas = [...responses[responseIndex].partidas];
          let registros = [...mov.registros];
          mov.registros.forEach((registro:Registro) => {
            let indexRemove = partidas.findIndex((e) => {
              return registro.code === e.code && registro.cant == e.cant;
            });
            if (indexRemove != -1) {
              partidas.splice(indexRemove, 1);
              registros = registros.filter((e) => {
                return !(registro.code === e.code && registro.cant == e.cant);
              });
            }
          });
          if ( (partidas.length || registros.length) != 0 && responses[responseIndex].partidasExactas ) {
            Swal.fire({
              icon: 'warning',
              text: 'Tu movimiento con folio: ' + mov.folio + ' no coincide con lo enviado, revisa tus partidas.',
            });
            feedback = false;
          }
        } else {
          Swal.fire({
            icon: 'warning',
            text: 'Tu movimiento con folio: ' + mov.folio + ' no se encuentra en el sistema.',
          });
          feedback = false;
        }
      }
    });
    if (feedback) {
      this.sincronizarMovimientos();
    }
  }
}
