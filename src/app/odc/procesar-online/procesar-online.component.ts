import { Component, OnInit } from '@angular/core';
import { InformacionCotizar } from '../../interfaces/informacion_cotizar.interface';
import { Solicitud } from '../../interfaces/solicitud.interface';
import { ProductoPartida } from '../../interfaces/producto_partida.interface';
import Swal from 'sweetalert2';
import { SolicitudesService } from '../../services/solicitudes.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionesService } from '../../services/cotizaciones.service';

declare var $: any;

@Component({
  selector: 'app-procesar-online',
  templateUrl: './procesar-online.component.html',
  styleUrls: ['./procesar-online.component.css']
})
export class ProcesarOnlineComponent implements OnInit {

  idSolicitud: number;
  idListaPrecio: number;
  solicitud: Solicitud|any;
  partidasPedido: any[] = [];
  totalesPedido: any;
  codigoIMSS: string;
  codigosPartidas: string[] = [];
  cantidad: number;
  informacionCotizar: InformacionCotizar;
  partidaActual: any;
  faltantesActual: number;
  sumatoriaPedido: number;
  productosPartidas: ProductoPartida[] = [];
  listaPrecio: any;
  sumatoriaActual: number;
  suscription: Subscription;
  suscription2: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudesService,
    private cotizacionService: CotizacionesService,
    private router: Router,
  ) {
    this.suscription = new Subscription();
    this.suscription2 = new Subscription();
    this.idSolicitud = 0;
    this.idListaPrecio = 0;
    this.cantidad = 0;
    this.codigoIMSS = '';
    this.partidaActual = null;
    this.faltantesActual = 0;
    this.sumatoriaPedido = 0;
    this.sumatoriaActual = 0;
    this.informacionCotizar = {
      direccionEnvio: '',
      formasPago: [],
      nosCuenta: [],
      tiposPago: [],
      usosCFDI: []
    }
    this.solicitud = {
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
    this.route.paramMap.subscribe(paramMap => {
      this.idSolicitud = parseInt(paramMap.get('idSolicitud')!);
      this.idListaPrecio = parseInt(paramMap.get('idListaPrecio')!);
      this.getSolicitud();
    });
  }

  ngOnInit(): void {
  }

  getSolicitud(): void {
    this.mostrarAlertCarga();
    this.suscription = this.solicitudService.showXAtender(this.idSolicitud).subscribe( res => {
      if (res.estatus == '2') {
        this.solicitud = res;
        this.suscription.unsubscribe();
        this.getCodigosPartidas();
        Swal.close();
      } else {
        this.router.navigate(['']).then( () => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/']);
          }); 
        });
      }
    }, err => {
      this.mostrarAlertError();
    });
  }

  getCodigosPartidas(): void {
    this.suscription2 = this.solicitudService.getCodigosPartidas(this.idListaPrecio).subscribe(res => {
      this.codigosPartidas = res;
      this.suscription2.unsubscribe();
      this.getInformacionCotizar();
    }, err => {
      this.mostrarAlertError();
    });
  }

  getInformacionCotizar(): void {
    // Aqui
    this.suscription = this.cotizacionService.getInformacionCotizar(this.solicitud.idCliente).subscribe(res => {
      this.informacionCotizar = res;
      this.informacionCotizar.idCliente = this.solicitud.idCliente;
      this.informacionCotizar.idLista = this.idListaPrecio;
      this.informacionCotizar.idSolicitud = this.solicitud.id;
      this.informacionCotizar.archivoSolicitud = new File([this.transformarArchivoSolicitud(this.solicitud.archivoSolicitud)], this.solicitud.solicitudPDFNombre);

      this.suscription.unsubscribe();
      Swal.close();
    }, err => {
      this.mostrarAlertError();
    });
  }

  buscarProductos(): void {
    if (this.partidaActual && this.faltantesActual == 0 ) {
      let partidaExistente = this.partidasPedido.find((e: any) => e.partida === this.partidaActual.partida);
      if (!partidaExistente) {
        this.partidasPedido.unshift(this.partidaActual);
        this.sumatoriaPedido = this.sumarPropiedad(this.partidasPedido, 'cantidad');
      }
    }
    let cPartida = this.codigoIMSS;
    let cantidad = this.cantidad;

    if (this.validarBusqueda(cPartida, cantidad)) {
      this.mostrarAlertCarga();
      this.suscription = this.solicitudService.getProductosPartidas(this.idListaPrecio, cPartida).subscribe(res => {
        this.partidaActual = {
            partida: cPartida,
            cantidad: cantidad,
            productos: []
        };
        this.productosPartidas = res;
        this.faltantesActual = cantidad;
        Swal.close();
        this.suscription.unsubscribe();
      }, err => {
        this.mostrarAlertError();
      });
    }
  }

  sumarPropiedad(array: any[], propiedad: string): number {
    return array.reduce((sum: any, value: any) => ( sum + value[propiedad] ), 0);
  }

  validarBusqueda(cPartida: string, cantidad: number): boolean {
    if (!cPartida || !cantidad || cantidad <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Llena los campos correctamente.',
        timer: 3000
      });
      return false;
    }
    return true;
  }

  bloquearNuevaPartida(): boolean {
    let partida = this.partidasPedido.find((e: any) => e.partida === this.codigoIMSS);

    if (partida) return true;
    if (this.partidaActual && this.partidaActual.partida == this.codigoIMSS) return true;

    return false;
  }

  modificarCantidad(producto: ProductoPartida): void {
    let productoIndex = this.partidaActual.productos.findIndex(function(e: any) {
      return e.codigoProducto == producto.codigoProducto;
    });

    if (productoIndex != -1) {
      this.partidaActual.productos.splice(productoIndex,1);
    }

    if (!producto.cantidad || producto.cantidad <= 0) {
      producto.cantidad = 0;
    } else {
      this.partidaActual.productos.unshift(producto);
    }
    
    this.sumatoriaActual = this.sumarPropiedad(this.partidaActual.productos, 'cantidad');
    this.faltantesActual = this.partidaActual.cantidad - this.sumatoriaActual;
  }

  continuarPedido(): void {
    if (this.partidasPedido.length == 0 && this.partidaActual.productos) {
      Swal.fire({
        text: '¿Deseas continuar con una sola partida?',
        icon: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#02a3b5',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Me faltan partidas'
      }).then((result) => {
        if (result.isConfirmed) {
          this.partidasPedido.unshift(this.partidaActual);
          this.sumatoriaPedido = this.sumarPropiedad(this.partidasPedido, 'cantidad');
          this.cantidad = 0;
          const pedido = this.transformarPedido();
          let subtotal = pedido.reduce((sum: any, value: any) => ( sum + (value['cantidad'] * value['precio']) ), 0);
          let iva = subtotal * 0.16;
          let total = subtotal + iva;
          this.totalesPedido = {
            subtotal: subtotal,
            iva: iva,
            total: total
          };
          $('#detalleSolicitudModal').modal('show');
        }
      });
      return;
    }
    let partidaExistente = this.partidasPedido.find((e: any) => e.partida === this.partidaActual.partida);
    if (!partidaExistente) {
      this.partidasPedido.unshift(this.partidaActual);
    }
    this.sumatoriaPedido = this.sumarPropiedad(this.partidasPedido, 'cantidad');
    this.cantidad = 0;

    const pedido = this.transformarPedido();
    let subtotal = pedido.reduce((sum: any, value: any) => ( sum + (value['cantidad'] * value['precio']) ), 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;
    this.totalesPedido = {
      subtotal: subtotal,
      iva: iva,
      total: total
    };
    $('#detalleSolicitudModal').modal('show');
  }

  transformarPedido() {
    let detalle = [];
    let contador = 1;
    for (let x = 0; x < this.partidasPedido.length; x++) {
      let productos = this.partidasPedido[x].productos
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
    return detalle;
  }

  transformarArchivoSolicitud(data: any): Blob {
    let byte = this.base64ToArrayBuffer(data);
    var blob = new Blob([byte], {type: "application/pdf"});
    return blob;
  }

  base64ToArrayBuffer(base64: string) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
       var ascii = binaryString.charCodeAt(i);
       bytes[i] = ascii;
    }
    return bytes;
  }

  mostrarAlertCarga(text: string = 'Cargando...'): void {
    Swal.fire({
      allowOutsideClick: false,
      text: text
    });
    Swal.showLoading();
  }

  mostrarAlertError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error, si este persiste contacte a sistemas',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/']);
        }); 
      }
    });
  }

}
