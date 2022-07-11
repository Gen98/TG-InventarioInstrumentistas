import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Solicitud } from '../../interfaces/solicitud.interface';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Clasificacion } from '../../interfaces/clasificacion.interface';
import { ClienteDistribuidor } from '../../interfaces/cliente_distribuidor.interface';
import { SolicitudesService } from '../../services/solicitudes.service';
import { DataTableDirective } from 'angular-datatables';

declare var $: any;

@Component({
  selector: 'app-por-atender-online',
  templateUrl: './por-atender-online.component.html',
  styleUrls: ['./por-atender-online.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class PorAtenderOnlineComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  solicitudes: any[] = [];
  clasificaciones: Clasificacion[] = [];
  distribuidores: ClienteDistribuidor[] = [];
  verSolicitudListaPrecio: ListaPrecio[] = [];
  verSolicitudModel: Solicitud;
  sourcePdf: SafeResourceUrl;
  sourceIsPDF: boolean = true;
  zoomPdf: number = 1;
  @ViewChild(DataTableDirective, {static: false})
  dtElement!: DataTableDirective;

  constructor(
    private solicitudService: SolicitudesService,
    private router: Router
  ) {
    this.sourcePdf = '';
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
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.solicitudService.getXAtenderDataTables(dataTablesParameters).subscribe(resp => {
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
    // this.dtOptions = {
    //   language: {
    //     url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
    //   },
    // };
    // this.getSolicitudes();
    this.mostrarAlertCarga();
    this.getProveedor();
  }

  reloadAjax() {
    this.mostrarAlertCarga()
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
      Swal.close();
    });
  }

  getSolicitudes(): void {
    this.mostrarAlertCarga();
    this.solicitudService.getXAtender().subscribe( (data) => {
      this.solicitudes = data;
      this.dtTrigger.next();
      this.getProveedor();
      
      // USAR SERVERSIDE SOLO EN EL FRONT, EN EL BACK VER QUE MANDA EN EL REQUEST E INTENTAR PAGINAR CON TOP, ASI COMO SE PAGINAN LOS MENSAJES DE 30 POR 30 EN EL CHAT
    });
  }

  getProveedor(): void {
    this.solicitudService.getProveedores().subscribe( (data) => {
      this.distribuidores = data;
      this.getClasificaciones();
    });
  }

  getClasificaciones(): void {
    this.solicitudService.getClasificaciones().subscribe( (data) => {
      this.clasificaciones = data;
      this.getClientes();
    })
  }

  getClientes(): void {
    this.distribuidores.forEach(element => {
      this.solicitudService.getClientes(element.id).subscribe( (data) => {
        element.clientes = data;
        element.clientes.forEach(cliente => {
          this.solicitudService.getListas(cliente.idCliente).subscribe( listas => {
            cliente.listas = listas;
          })
        })
      })
    });
    Swal.close();
  }

  guardarSolicitud(solicitud: Solicitud): void {
    this.mostrarAlertCarga('Guardando, espere un momento...');
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
            // this.getOfflineData();
            // Actualizar las solicitudes
            this.reloadAjax();
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
        title: 'Error.',
        text: 'Vuelve a intentar',
        allowOutsideClick: false,
      });
    });
  }

  actualizarSolicitud(event: { solicitud: Solicitud, procesar: false, dateUpdated: boolean }): void {
    // if (event.procesar && !event.dateUpdated) {
    if (event.procesar) {
      this.mostrarAlertCarga('Guardando, espero un momento...');
      this.solicitudService.updateSolicitud(event.solicitud).subscribe(res => {
        if (res.actualizado) {
          $('#verSolicitudModal').modal('hide');
          Swal.close();
          this.router.navigateByUrl(`/xAtender-online/preparar/${event.solicitud.id}/${event.solicitud.idLista}`, { skipLocationChange: true }).then(() => {
            this.router.navigate(['/xAtender-online/preparar', event.solicitud.id, event.solicitud.idLista]);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error.',
            text: 'Vuelve a intentar',
            allowOutsideClick: false,
          });
        }
      }, err => {
        Swal.fire({
          icon: 'error',
          title: 'Error.',
          text: 'Vuelve a intentar',
          allowOutsideClick: false,
        });
      })
    } else {
      this.actualizarSolicitudAhora(event);
    }
  }

  actualizarSolicitudAhora(event: { solicitud: Solicitud, procesar: false, dateUpdated: boolean }) {
    this.mostrarAlertCarga('Guardando, espero un momento...');
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
              this.router.navigateByUrl(`/xAtender-online/preparar/${event.solicitud.id}/${event.solicitud.idLista}`, { skipLocationChange: true }).then(() => {
                this.router.navigate(['/xAtender-online/preparar', event.solicitud.id, event.solicitud.idLista]);
              });
            } else {
              this.reloadAjax();
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
        title: 'Error.',
        text: 'Vuelve a intentar',
        allowOutsideClick: false,
      });
    });
  }

  verSolicitud(solicitud: any): void {
    this.mostrarAlertCarga();
    $('.verFooter').removeClass('d-none');
    let idSolicitud = parseInt(solicitud.idSolicitud);
    let proveedor = solicitud.nombreSolicitante;
    let cliente = solicitud.nombreCliente;
    this.solicitudService.showXAtender(idSolicitud).subscribe((data) => {
      console.log(data);
      this.verSolicitudModel = data;
      this.verSolicitudModel.proveedorNombre = proveedor;
      this.verSolicitudModel.clienteNombre = cliente;
      this.verSolicitudModel.curp = data.curpPaciente;

      this.verSolicitudModel.solicitudPDFNombre!.endsWith('pdf') ? this.sourceIsPDF = true : this.sourceIsPDF = false;
      let clientes = this.distribuidores.find((e: any) => e.id == data.idProveedor)!.clientes!;
      let listas = clientes?.find((e: any) => e.idCliente == data.idCliente)!.listas;

      this.verSolicitudListaPrecio = listas;
      $('.lista_precio option:eq(0)').prop('selected', true);
      $('.clasificaciones option:eq(0)').prop('selected', true);
      $('.subclasificaciones option:eq(0)').prop('selected', true);
      $('#verSolicitudModal').modal('show');
      Swal.close();
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error.',
        text: 'Vuelve a intentar',
        allowOutsideClick: false,
      });
    });
  }

  mostrarAlertCarga(text: string = 'Cargando...'): void {
    Swal.fire({
      allowOutsideClick: false,
      text: text
    });
    Swal.showLoading();
  }

  zoom(amount: number) {
    this.zoomPdf += amount;
  }

  previewPDF(e: any): void {
    this.sourcePdf = e;
    this.zoomPdf = 1;

    $('#verSolicitudModal').modal('hide');
    $('#previewPdfModal').modal('show');
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
