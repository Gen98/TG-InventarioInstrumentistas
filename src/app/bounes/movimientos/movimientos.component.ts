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
  folios: any[] = [];
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
    this.dexieService.getFolios().then(async(e) => {
      this.folios = e;
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

  async sincronizarMovimientos(movsIdSync: number[] = [], movsFailed: any[]) {
    $('.sincronizarBtn').prop("disabled", true);
    (await this.dexieService.sincronizarMovimientos(movsIdSync)).subscribe( resp => {
      this.dexieService.deleteSincronizados().then(async() => {
        resp.forEach((element:any) => {
          this.dexieService.addSincronizado(element);
          this.dexieService.deleteMovimiento(element);
        });
        setTimeout(() => {
          $('.sincronizarBtn').prop("disabled", false);
          this.getRegistros();
          this.getSincronizados();
          let response = this.stringSincronizarResponse(movsFailed);
          Swal.fire({
            icon: 'success',
            title: response,
          });
        }, 2000);
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
        text: 'Ha ocurrido un error, intentelo m??s tarde.',
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
        this.recorrerPartidas(val);
      },
      (err) => { 
        console.log(err);
        Swal.fire({
          icon: 'warning',
          text: 'Ha ocurrido un error, intenta m??s tarde',
        });
      }
    )
  }

  recorrerPartidas(responses: any[]): void {
    // let feedback = true;
    let movsIdToSync: number[] = [];
    let movsFailed: any[] = [];
    this.movimientos.forEach((mov: Movimiento, movIdx: number) => {
      if (mov.folio && (mov.folio.startsWith("NS_") || mov.folio.startsWith("FS_") || mov.folio.startsWith("BS_"))) {
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
            movsFailed.push({
              folio:  mov.folio,
              status: 1 //No coinciden las partidas
            });
            // Swal.fire({
            //   icon: 'warning',
            //   text: 'Tu movimiento con folio: ' + mov.folio + ' no coincide con lo enviado, revisa tus partidas.',
            // });
            // feedback = false;
          } else if (responses[responseIndex].registradoAnteriormente) {
            movsFailed.push({
              folio:  mov.folio,
              status: 2 //Duplicado
            });
          } else {
            movsIdToSync.push(movIdx);
          }
        } else {
          movsFailed.push({
            folio:  mov.folio,
            status: 0 //No encontrado
          });
          // Swal.fire({
          //   icon: 'warning',
          //   text: 'Tu movimiento con folio: ' + mov.folio + ' no se encuentra en el sistema.',
          // });
          // feedback = false;
        }
      } else {
        movsIdToSync.push(movIdx);
      }
    });
    if (movsIdToSync.length) {
      this.sincronizarMovimientos(movsIdToSync, movsFailed);
    } else {
      let response = this.stringSincronizarResponse(movsFailed, true);
      Swal.fire({
        icon: 'warning',
        title: response,
        // timer: 2000
      });
    }
  }

  stringSincronizarResponse(movsFailed: any[], noSent: boolean = false): string {
    let response = noSent ? '' : 'Movimientos sincronizados exitosamente.';
    if (movsFailed.length == 0) return response;
    // Estatus 0
    let estatus0 = this.sincIterarMovs(movsFailed, 0);
    // Estatus 1
    let estatus1 = this.sincIterarMovs(movsFailed, 1);
    // Estatus 2
    let estatus2 = this.sincIterarMovs(movsFailed, 2);

    return response + estatus0 + estatus1 + estatus2;
  }

  sincIterarMovs(movsFailed: any[], status: number) {
    let estatusArray = movsFailed.filter((e) => {
      return e.status === status;
    });

    let string = '';
    if (estatusArray.length) {
      estatusArray.forEach((element, idx, array) => {
        if (idx == 0) {
          switch (status) {
            case 0:
              string = "\nLos siguientes folios no se encontraron: " + element.folio;
              break;
          
            case 1:
              string = "\nLos siguientes folios sus partidas no coinciden con lo enviado: " + element.folio;
              break;

            case 2:
              string = "\nLos siguientes folios ya han sido registrados: " + element.folio;
              break;

            default:
              break;
          }
        } else if (idx == array.length-1) {
          string = string + (idx == 0 ? '.' : (', ' + element.folio + '.'));
        } else {
          string = string + ', ' + element.folio;
        }
      });
    }
    return string;
  }
}
