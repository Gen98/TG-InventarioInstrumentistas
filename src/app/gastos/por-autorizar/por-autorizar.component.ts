import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GastosService } from '../../services/gastos.service';
import { Producto, Solicitud } from 'src/app/interfaces/gastos.interface';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-por-autorizar',
  templateUrl: './por-autorizar.component.html',
  styleUrls: ['./por-autorizar.component.css']
})
export class PorAutorizarComponent implements OnInit {

  verSolicitudModel: Solicitud;
  dtOptions: DataTables.Settings = {};
  solicitudes: any[] = [];

  constructor(private gastosService: GastosService,
    private router: Router) {
    this.verSolicitudModel = {
      observaciones : '',
      precioTotal: 0,
      importeTotal: 0,
      productos: [],
      idPedido: 0
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.gastosService.getXAutorizarDataTables(dataTablesParameters).subscribe(resp => {
          this.solicitudes = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      // columns: [{ data: 'idSolicitud' }, { data: 'paciente' }],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
    };
  }

  verSolicitud(idPedido: number): void {
    this.verSolicitudModel = {
      observaciones : '',
      precioTotal: 0,
      importeTotal: 0,
      productos: [],
      idPedido: 0
    }
    this.mostrarAlertCarga();
    this.gastosService.getSolicitud(idPedido).subscribe(res => {
      this.transformResponsePedido(res);
      $('#verSolicitudModal').modal('show');
      Swal.close();
    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Vuelve a intentarlo.'
      });
    });
  }

  transformResponsePedido(res: any) {
    this.verSolicitudModel.observaciones = res.solicitud.observaciones;
    this.verSolicitudModel.fecha = res.solicitud.fecha.split(' ')[0];
    this.verSolicitudModel.idPedido = res.solicitud.idPedido;
    this.verSolicitudModel.rutaId = res.solicitud.rutaId;
    this.verSolicitudModel.ruta = res.solicitud.ruta.split('\\').slice(-1)[0];

    res.detalle.forEach((partida: any) => {
      let producto: Producto = {
        idPedido: partida.idPedido,
        codigo: partida.codigo,
        descripcion: partida.descripcion,
        cantidad: partida.cantidad,
        precio: partida.precio,
        importe: partida.importe,
        idDetalle: partida.idDetallle,
        rutaId: partida.rutaId,
        ruta: partida.ruta.split('\\').slice(-1)[0]
      }
      this.verSolicitudModel.precioTotal = this.verSolicitudModel.precioTotal + producto.precio;
      this.verSolicitudModel.importeTotal = this.verSolicitudModel.importeTotal + producto.importe;
      this.verSolicitudModel.productos.push(producto);
    });
  }

  mostrarAlertCarga(text: string = 'Cargando...'): void {
    Swal.fire({
      allowOutsideClick: false,
      text: text
    });
    Swal.showLoading();
  }

  cancelarSolicitud(idPedido: number): void {
    Swal.fire({
      text: `¿Cancelar la solicitud ${idPedido.toString()}?`,
      icon: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#02a3b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then(value => {
      if (value.isConfirmed) {
        this.mostrarAlertCarga();
        this.gastosService.cancelarSolicitud(idPedido).subscribe(res => {
          Swal.fire({
            icon: 'success',
            title: 'Solicitud CANCELADA exitosamente.',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/gastos']);
              });
            }
          });
        }, err => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Vuelve a intentarlo.'
          });
        });
      }
    });
  }

}
