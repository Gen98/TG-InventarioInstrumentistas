import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ClienteDistribuidor } from '../../interfaces/cliente_distribuidor.interface';
import { DexieSolicitudesService } from '../../services/dexie-solicitudes.service';
import { CotizacionesService } from '../../services/cotizaciones.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { WifiStatusService } from '../../services/wifi-status.service';
import { AuthService } from '../../services/auth.service';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Solicitud } from 'src/app/interfaces/solicitud.interface';
import { concatMap, map, toArray } from 'rxjs/operators';
import { from, Subject, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-por-atender',
  templateUrl: './por-atender.component.html',
  styleUrls: ['./por-atender.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PorAtenderComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  suscription: Subscription;
  suscription2: Subscription;
  solicitudes: any[] = [];
  distribuidores: ClienteDistribuidor[] = [];
  verSolicitudModel: Solicitud;
  verSolicitudListaPrecio: ListaPrecio[];
  sourcePdf: SafeResourceUrl;
  sourceIsPDF: boolean = true;
  zoomPdf: number = 1;
  noSincronizados: boolean = false;
  isConnected: boolean = false;
  noEnviados: any[] = [];

  constructor(
    private authService: AuthService, 
    private solicitudService: SolicitudesService,
    private cotizacionService: CotizacionesService, 
    private dexieService: DexieSolicitudesService,
    private wifiStatusService: WifiStatusService,
    private router: Router
  ) { 
    this.sourcePdf = '';
    this.suscription = new Subscription();
    this.suscription2 = new Subscription();
    this.verSolicitudListaPrecio = [];
    this.verSolicitudModel = {
      idProveedor: 0,
      idUsuarioGenera: 0,
      idCliente: 0,
      solicitudPDF: '',
      idLista: 0,
      noContrato: '',
      noFianza: '',
      noProveedor: '',
      paciente: '',
      nss: '',
      fechaReq: '',
      fechaCirugia: '',
      nombreDoctor: '',
      observacionesPrefactura: '',
      folioConsumo: ''
    }
    wifiStatusService.createOnline().subscribe(isOnline => {
      this.isConnected = isOnline;
    });
  }

  ngOnInit(): void {
    this.dtOptions = {
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
    };
    this.getSolicitudes();
  }

  getProveedor(): void {
    this.mostrarAlertCarga();
    this.dexieService.getProveedores().then(async(data) => {
      this.distribuidores = data;
      Swal.close();
    }).then(async() => {
      this.getNoEnviados();
    });
  }

  getSolicitudes(): void {
    this.mostrarAlertCarga();
    this.dexieService.getSolicitudesList().then(async(data) => {
      this.solicitudes = data;
      this.dtTrigger.next();
      Swal.close()
      this.getProveedor();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  guardarSolicitud(solicitud: Solicitud): void {
    if (this.isConnected) {
      this.guardarSolicitudAhora(solicitud);
    } else {
      this.guardarSolicitudEnCola(solicitud);
    }
  }

  guardarSolicitudAhora(solicitud: Solicitud) {
    this.mostrarAlertCarga('Guardando, espere un momento...');
    this.sincronizarNoEnviados(true);
    setTimeout(() => {
      this.solicitudService.storeSolicitud(solicitud).subscribe(res => {
        if (res.solicitudId) {
          $('#distribuidor option:eq(0)').prop('selected', true);
          $("#file").val(null);
          $('.clearDate').click();
          $('#closeNuevaSolicitudModal').click();
          $('#verSolicitudModal').click();
          Swal.fire({
            icon: 'success',
            title: 'Solicitud generada exitosamente. Id de la solicitud: ' + res.solicitudId,
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              this.getOfflineData();
            }
          });
        } else {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/']);
          }); 
        }
      }, err => {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión.',
          text: '¿Deseas volver a intentar o sincronizar mas tarde?',
          allowOutsideClick: false,
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          denyButtonText: `Sincronizar mas tarde`,
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardarSolicitudAhora(solicitud);
          } else if (result.isDenied) {
            this.checkIfExists(solicitud);
          }
        });
      });
    }, 3000);
  }

  checkIfExists(solicitud: Solicitud) {
    this.dexieService.checkIfExists(solicitud.id!).then(async(count) => {
      if (count) {
        Swal.fire({
          icon: 'question',
          title: 'Ya existe un registro con esta solicitud, si continuas se va a sobreescribir. ¿Deseas continuar?',
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardarSolicitudEnCola(solicitud);
          }
        });
      } else {
        this.guardarSolicitudEnCola(solicitud);
      }
    });
  }

  guardarSolicitudEnCola(solicitud: Solicitud) {
    this.dexieService.addSolicitudOffline(solicitud).then(async() => {
      $('#distribuidor option:eq(0)').prop('selected', true);
        $("#file").val(null);
        $('.clearDate').click();
        $('#closeNuevaSolicitudModal').click();
        $('#closeVerSolicitudModal').click();
        Swal.fire({
          icon: 'success',
          title: 'Solicitud guardada exitosamente. No olvides sincronizarla',
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/xAtender']);
            }); 
          }
        });
    });
  }

  verSolicitud(solicitud: any, noEnviado: boolean = false): void {
    $('.verFooter').removeClass('d-none');
    if (noEnviado) {
      let prov = this.distribuidores.find((e: any) => e.id == solicitud.idProveedor)!;
      let cliente = prov.clientes?.find((e: any) => e.idCliente == solicitud.idCliente);
      this.verSolicitudModel = solicitud;
      this.verSolicitudModel.proveedorNombre = prov.nombre;
      this.verSolicitudModel.clienteNombre = cliente.nombre;
      this.verSolicitudModel.solicitudPDFNombre = solicitud.solicitudPDF ? solicitud.solicitudPDF.name : solicitud.solicitudPDFNombre;
      this.verSolicitudListaPrecio = cliente.listas;
      this.verSolicitudModel.solicitudPDFNombre!.endsWith('pdf') ? this.sourceIsPDF = true : this.sourceIsPDF = false;

      $('.lista_precio option:eq(0)').prop('selected', true);
      $('.verFooter').addClass('d-none');
      $('#noEnviadosModal').modal('hide');
      $('#verSolicitudModal').modal('show');
    } else {
      let idSolicitud = parseInt(solicitud.idSolicitud);
      let proveedor = solicitud.nombreSolicitante;
      let cliente = solicitud.nombreCliente;
      this.dexieService.getSolicitudShow(idSolicitud).then(async(data) => {
        this.verSolicitudModel = data;
        this.verSolicitudModel.proveedorNombre = proveedor;
        this.verSolicitudModel.clienteNombre = cliente;
  
        this.verSolicitudModel.solicitudPDFNombre!.endsWith('pdf') ? this.sourceIsPDF = true : this.sourceIsPDF = false;
        let clientes = this.distribuidores.find((e: any) => e.id == data.idProveedor)!.clientes!;
        let listas = clientes?.find((e: any) => e.idCliente == data.idCliente)!.listas;
  
        this.verSolicitudListaPrecio = listas;
        $('.lista_precio option:eq(0)').prop('selected', true);
        this.dexieService.checkIfExists(idSolicitud).then(async(count) => {
          if (count) {
            Swal.fire({
              icon: 'question',
              title: '¿Deseas intentar sincronizar antes tus solicitudes NO ENVIADAS?',
              allowOutsideClick: false,
              showCancelButton: true,
              cancelButtonText: 'No',
              confirmButtonText: 'Sí'
            }).then((result) => {
              if (result.isConfirmed) {
                this.sincronizarNoEnviados();
              } else {
                $('.verFooter').addClass('d-none');
                $('#verSolicitudModal').modal('show');
              }
            });
          } else {
            $('#verSolicitudModal').modal('show');
          }
        });
      });
    }
  }

  actualizarSolicitud(event: { solicitud: Solicitud, procesar: false, dateUpdated: boolean }): void {
    if (event.procesar && !event.dateUpdated) {
      $('#verSolicitudModal').modal('hide');
      this.router.navigateByUrl(`/xAtender/preparar/${event.solicitud.id}/${event.solicitud.idLista}`, { skipLocationChange: true }).then(() => {
        this.router.navigate(['/xAtender/preparar', event.solicitud.id, event.solicitud.idLista]);
      });
    } else {
      if (this.isConnected) {
        this.actualizarSolicitudAhora(event);
      } else {
        this.guardarSolicitudEnCola(event.solicitud);
      }
    }
  }

  actualizarSolicitudAhora(event: { solicitud: Solicitud, procesar: false, dateUpdated: boolean }) {
    this.mostrarAlertCarga('Guardando, espero un momento...');
    this.sincronizarNoEnviados(true);
    setTimeout(() => {
      this.solicitudService.updateSolicitud(event.solicitud).subscribe(res => {
        if (res.actualizado) {
          $("#fileVer").val(null);
          $('.clearDate').click();
          $('#verSolicitudModal').modal('hide');
          Swal.fire({
            icon: 'success',
            title: event.procesar ? 'Solicitud actualizada, continua el proceso.' : 'Solicitud actualizada exitosamente.',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              if (event.procesar) {
                this.router.navigateByUrl(`/xAtender/preparar/${event.solicitud.id}/${event.solicitud.idLista}`, { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/xAtender/preparar', event.solicitud.id, event.solicitud.idLista]);
                }); 
              } else {
                this.getOfflineData();
              }
            }
          });
        } else {
          Swal.close();
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/']);
          }); 
        }
      }, err => {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión.',
          text: '¿Deseas volver a intentar o sincronizar mas tarde?',
          allowOutsideClick: false,
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          denyButtonText: `Sincronizar mas tarde`,
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.actualizarSolicitudAhora(event);
          } else if (result.isDenied) {
            this.guardarSolicitudEnCola(event.solicitud);
          }
        });
      });
    }, 3000);
}

  previewPDF(e: any): void {
    this.sourcePdf = e;
    this.zoomPdf = 1;

    $('#verSolicitudModal').modal('hide');
    $('#previewPdfModal').modal('show');
  }

  zoom(amount: number) {
    this.zoomPdf += amount;
  }

  mostrarAlert(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

  mostrarAlertCarga(text: string = 'Cargando...'): void {
    Swal.fire({
      allowOutsideClick: false,
      text: text
    });
    Swal.showLoading();
  }

  getNoEnviados() {
    this.dexieService.getNoEnviados().then(async(data) => {
      this.noEnviados = data;
      if (!data.length) $('#noEnviadosModal').modal('hide');
    });
  }
  
  eliminarNoEnviado(item: any) {
    this.dexieService.deleteNoEnviado(item.idIndexed).then(async() => {
      this.getNoEnviados();
    });
  }

  sincronizarNoEnviados(noMostrar: boolean = false) {
    $(".noEniados").prop("disabled", true);
    let observables = [];
    for (const mov of this.noEnviados) {
      if (mov.cotizacion) {
        observables.push(this.cotizacionService.storeCotizacion(mov.cotizacion));
      } else if (mov.id) {
        observables.push(this.solicitudService.updateSolicitud(mov));
      } else {
        observables.push(this.solicitudService.storeSolicitud(mov));
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
        this.recorrerResponses(val, noMostrar);
      },
      (err) => { 
        console.log(err);
        if (!noMostrar) {
          Swal.fire({
            icon: 'warning',
            text: 'Ha ocurrido un error, intenta más tarde',
          });
        }
      }
    )
  }

  recorrerResponses(responses: any[], noMostrar: boolean): void {
    if (noMostrar) return;
    let idSolicitudes: number[] = [];
    let idCotizaciones: number[] = [];
    responses.forEach((response: any) => {
      if (response.solicitudId || response.cotizacionId) {
        if (response.solicitudId) idSolicitudes.push(response.solicitudId);
        if (response.cotizacionId != 'error') idCotizaciones.push(response.cotizacionId);
      }
    });
    if (idSolicitudes.length || idCotizaciones.length) {
      let response = this.stringSincronizarResponse(idSolicitudes, idCotizaciones);
      Swal.fire({
        icon: 'success',
        title: response,
        allowOutsideClick: false
      }).then(result => {
        if (result.isConfirmed){
          Swal.fire({
            allowOutsideClick: false,
            text: 'Actualizando informacion...'
          });
          Swal.showLoading();
          this.getOfflineData();
        }
      });
    } else {
      Swal.fire({
        allowOutsideClick: false,
        text: 'Actualizando informacion...'
      });
      Swal.showLoading();
      this.getOfflineData();
    }
  }

  stringSincronizarResponse(solicitudes: any[], cotizaciones: any[]): string {
    let stringSolicitudes = this.sincIterarRes(solicitudes, 's');
    let stringCotizaciones = this.sincIterarRes(cotizaciones, 'c');

    return stringSolicitudes + stringCotizaciones;
  }

  sincIterarRes(ids: any[], type: string) {
    let string = '';
    if (ids.length) {
      ids.forEach((element, idx, array) => {
        if (idx == 0) {
          switch (type) {
            case 's':
              string = "\nLas siguientes solicitudes se generaron: " + element;
              break;
          
            case 'c':
              string = "\nLas siguientes cotizaciones se generaron: " + element;
              break;

            default:
              break;
          }
        } else if (idx == array.length-1) {
          string = string + (idx == 0 ? '.' : (', ' + element + '.'));
        } else {
          string = string + ', ' + element;
        }
      });
    }
    return string;
  }

  getOfflineData(): void {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Actualizando informacion...'
    });
    Swal.showLoading();
    this.solicitudService.getOfflineData().subscribe((res:any) => {
      this.dexieService.clearDB().then(async() => {
        this.guardarProveedores(res);
      }).then(async() => {
        this.guardarSolicitudesList(res);
        this.guardarSolicitudesShow(res);
      }).then(async() => {
        $("#noEnviadosModal").modal('hide');
        Swal.fire({
          icon: 'success',
          text: 'Informacion actualizada',
          allowOutsideClick: false,
        }).then((result) => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/xAtender']);
          }); 
        });
      });
    }, err => {
      this.authService.logout();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error almacenando offline Data.'
      });
    });
  }

  guardarProveedores(res: any) {
    res.proveedores.forEach((el:any) => {
      let prov = {
        id: el.id, 
        nombre: el.nombre, 
        clientes: el.clientes}
      this.dexieService.addProveedor(prov);
    });
  }
  
  guardarSolicitudesList(res: any) {
    res.solicitudesList.forEach((solicitud:any) => {
      this.dexieService.addSolicitudList(solicitud);
    });
  }

  guardarSolicitudesShow(res: any) {
    res.solicitudesShow.forEach((solicitud:any) => {
      this.dexieService.addSolicitudShow(solicitud);
    });
  }
}
