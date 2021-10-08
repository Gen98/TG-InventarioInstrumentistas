import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InformacionCotizar } from '../../interfaces/informacion_cotizar.interface';
import { CotizacionesService } from '../../services/cotizaciones.service';

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
  @Input() informacion: InformacionCotizar;
  @Input() pedido: any[] = [];

  constructor(private cotizacionService: CotizacionesService, private router: Router) { 
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
  }

  ngOnInit(): void {
    this.request.direccionEnvio = this.informacion.direccionEnvio;
    this.request.formaPago = this.informacion.formasPago.length ? this.informacion.formasPago[0].clave : '';
    this.request.noCuenta = this.informacion.nosCuenta.length ? this.informacion.nosCuenta[0] : '';
    this.request.tipoPago = this.informacion.tiposPago.length ? this.informacion.tiposPago[0].idx : 0;
    this.request.cfdi = this.informacion.usosCFDI.length ? this.informacion.usosCFDI[0].clave : '';
  }

  subirArchivo(e: any): void {
    this.request.hojaConsumo = '';
    if (e.target.files.length) {
      this.request.hojaConsumo = e.target.files[0];
    }
  }

  guardarCotizacion(): void {
    const pedido = this.transformarPedido();
    let subtotal = JSON.parse(pedido).reduce((sum: any, value: any) => ( sum + (value['cantidad'] * value['precio']) ), 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;

    const formData: FormData = new FormData();

    formData.append('clienteId', this.informacion.idCliente!.toString());
    formData.append('metodoPago', this.request.formaPago);
    formData.append('tipoPago', this.request.tipoPago.toString());
    formData.append('numeroCta', this.request.noCuenta);
    formData.append('direccionEnvio', this.request.direccionEnvio);
    formData.append('usoCFDI', this.request.cfdi);
    formData.append('idLista', this.informacion.idLista!.toString());
    formData.append('archivoSolicitud', this.informacion.archivoSolicitud);
    formData.append('archivoConsumo', this.request.hojaConsumo);
    formData.append('subTotal', subtotal.toString());
    formData.append('iva', iva.toString());
    formData.append('total', total.toString());
    formData.append('pedido', pedido);
    formData.append('idSolicitud', this.informacion.idSolicitud!.toString());

    Swal.fire({
      allowOutsideClick: false,
      text: 'Guardando, espero un momento...'
    });
    Swal.showLoading();
    this.cotizacionService.storeCotizacion(formData).subscribe(res => {
      if (res.cotizacionId) {
        Swal.fire({
          icon: 'success',
          title: 'Cotizacion generada exitosamente. Folio de la cotizació: ' + res.cotizacionId,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['']).then( () => {
              window.location.reload();
            });
          }
        });
      }
    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error, si este persiste contacte a sistemas',
        allowOutsideClick: false
      });
    });
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
}
