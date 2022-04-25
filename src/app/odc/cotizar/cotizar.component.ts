import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InformacionCotizar } from '../../interfaces/informacion_cotizar.interface';
import { DexieSolicitudesService } from '../../services/dexie-solicitudes.service';
import { CotizacionesService } from '../../services/cotizaciones.service';
import { WifiStatusService } from '../../services/wifi-status.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';
import { concatMap, map, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-cotizar',
  templateUrl: './cotizar.component.html',
  styleUrls: ['./cotizar.component.css']
})
export class CotizarComponent implements OnInit {

  request: {
    direccionEnvio: string;
    formaPago: string;
    noCuenta: string
    tipoPago: number;
    cfdi: string;
    hojaConsumo: any;
  };
  isConnected: boolean = false;
  noEnviados: any[] = [];
  @Input() informacion: InformacionCotizar;
  @Input() pedido: any[] = [];

  constructor(
    private cotizacionService: CotizacionesService, 
    private dexieService: DexieSolicitudesService,
    private solicitudService: SolicitudesService,
    private wifiStatusService: WifiStatusService,
    private authService: AuthService, 
    private router: Router
  ) { 
    this.informacion  = {
      direccionEnvio: '',
      formasPago: [],
      nosCuenta: [],
      tiposPago: [],
      usosCFDI: []
    };
    this.request = {
      direccionEnvio: '',
      formaPago: '',
      noCuenta: '',
      tipoPago: 0,
      cfdi: '',
      hojaConsumo: null,
    }
    wifiStatusService.createOnline().subscribe(isOnline => {
      this.isConnected = isOnline;
    });
      this.getNoEnviados();
  }

  ngOnInit(): void {
    this.request.direccionEnvio = this.informacion.direccionEnvio;
    this.request.formaPago = this.informacion.formasPago.length ? this.informacion.formasPago[0].clave : '';
    this.request.noCuenta = this.informacion.nosCuenta.length ? this.informacion.nosCuenta[0] : '';
    this.request.tipoPago = this.informacion.tiposPago.length ? this.informacion.tiposPago[1].idx : 0;
    this.request.cfdi = this.informacion.usosCFDI.length ? this.informacion.usosCFDI[0].clave : '';
  }

  subirArchivo(e: any): void {
    this.request.hojaConsumo = '';
    if (e.target.files.length) {
      this.request.hojaConsumo = e.target.files[0];
    }
  }

  getNoEnviados() {
    this.dexieService.getNoEnviados().then(async(data) => {
      this.noEnviados = data;
    });
  }

  guardarCotizacion(): void {
    const pedido = this.transformarPedido();
    let subtotal = JSON.parse(pedido).reduce((sum: any, value: any) => ( sum + (value['cantidad'] * value['precio']) ), 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;

    let data = {
      informacion: this.informacion,
      request: this.request,
      subtotal: subtotal,
      iva: iva,
      total: total,
      pedido: pedido
    }
    if (this.isConnected) {
      this.enviarAhora(data);
    } else {
      this.checkIfExists(data);
    }
  }

  validarCotizacion(): boolean {
    if (!this.request.direccionEnvio.trim()) return false;
    if (!this.request.formaPago) return false;
    if (!this.request.noCuenta) return false;
    if (!this.request.tipoPago) return false;
    if (!this.request.cfdi) return false;
    if (!this.request.hojaConsumo) return false;
    if (!this.pedido.length) return false;
    return true;
  }

  transformarPedido(): string {
    let detalle = [];
    let contador = 1;
    for (let x = 0; x < this.pedido.length; x++) {
      let productos = this.pedido[x].productos
      for (let y = 0; y < productos.length; y++) {
        let producto = productos[y];
        let item = {
          partida: contador,
          cantidad: producto.cantidad,
          codigo: producto.codigoProducto,
          descripcion: producto.descripcion,
          precio: producto.precio,
          codigoPartida: producto.codigoPartida
        };
        detalle.push(item);
        contador++;
      }
    }
    return JSON.stringify(detalle);
  }

  enviarAhora(data: any) {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Guardando, espero un momento...'
    });
    Swal.showLoading();
    this.sincronizarNoEnviados(true);
    setTimeout(() => {
      this.cotizacionService.storeCotizacion(data).subscribe(res => {
        if (res.cotizacionId) {
          Swal.fire({
            icon: 'success',
            title: 'Cotización generada exitosamente. Folio de la cotización: ' + res.cotizacionId,
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              $('#detalleSolicitudModal').modal('hide');
              $('#cotizarModal').modal('hide');
              // this.getOfflineData();
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/xAtender-online']);
              }); 
            }
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
            this.enviarAhora(data);
          } else if (result.isDenied) {
            this.checkIfExists(data);
          }
        });
      });
    }, 3000);
  }

  checkIfExists(data: any) {
    let solicitud = {
      idSolicitud: this.informacion.idSolicitud,
      cotizacion: data
    }
    this.dexieService.checkIfExists(solicitud.idSolicitud!).then(async(count) => {
      if (count) {
        Swal.fire({
          icon: 'question',
          title: 'Ya existe un registro con esta solicitud, si continuas se va a sobreescribir. ¿Deseas continuar?',
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            this.enviarACola(solicitud);
          }
        });
      } else {
        this.enviarACola(solicitud);
      }
    });
  }

  enviarACola(solicitud: any) {
    this.dexieService.addSolicitudOffline(solicitud).then(async() => {
      Swal.fire({
        icon: 'success',
        title: 'Cotización guardada exitosamente. No olvides sincronizarla',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          $('#detalleSolicitudModal').modal('hide');
          $('#cotizarModal').modal('hide');
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/xAtender']);
          }); 
        }
      });
    });
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

  sincronizarNoEnviados(noMostrar: boolean = false) {
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
      },
      (err) => { 
        console.log(err);
      }
    )
  }
}
