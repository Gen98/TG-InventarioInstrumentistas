import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClienteDistribuidor } from '../../interfaces/cliente_distribuidor.interface';
import { SolicitudesService } from '../../services/solicitudes.service';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Solicitud } from 'src/app/interfaces/solicitud.interface';

declare var $: any;

@Component({
  selector: 'app-por-atender',
  templateUrl: './por-atender.component.html',
  styleUrls: ['./por-atender.component.css']
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

  constructor(private solicitudService: SolicitudesService, private router: Router) { 
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
    this.suscription = this.solicitudService.getProveedores().subscribe( res => {
      res.forEach(el => {
        let distribuidor = {
          id: el.id,
          nombre: el.nombre
        }
        this.distribuidores.unshift(distribuidor);
      });
      Swal.close();
      this.suscription.unsubscribe();
    }, err => {
      this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
    });
  }

  getSolicitudes(): void {
    this.mostrarAlertCarga();
    this.suscription = this.solicitudService.getXAtender().subscribe( (res: any) => {
      this.solicitudes = res;
      this.dtTrigger.next();
      Swal.close();
      this.suscription.unsubscribe();
      this.getProveedor();
    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error, si este persiste contacte a sistemas'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['']).then( () => {
            window.location.reload();
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  guardarSolicitud(solicitud: Solicitud): void {
    this.mostrarAlertCarga('Guardando, espere un momento...');
    this.solicitudService.storeSolicitud(solicitud).subscribe(res => {
      if (res.solicitudId) {
        $('#distribuidor option:eq(0)').prop('selected', true);
        $("#file").val(null);
        $('.clearDate').click();
        $('#closeNuevaSolicitudModal').click();
        Swal.fire({
          icon: 'success',
          title: 'Solicitud generada exitosamente. Id de la solicitud: ' + res.solicitudId,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      } else {
        window.location.reload();
      }
    }, err => {
      this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
    });
  }

  verSolicitud(solicitud: any): void {
    let idSolicitud = solicitud.idSolicitud;
    let proveedor = solicitud.nombreSolicitante;
    let cliente = solicitud.nombreCliente;
    this.mostrarAlertCarga();
    this.suscription = this.solicitudService.showXAtender(idSolicitud).subscribe( res => {
      this.verSolicitudModel = res;
      this.verSolicitudModel.proveedorNombre = proveedor;
      this.verSolicitudModel.clienteNombre = cliente;
      this.verSolicitudListaPrecio = [];
      this.suscription2 = this.solicitudService.getListas(this.verSolicitudModel.idCliente).subscribe( listas => {
        listas.forEach((el: any) => {
          let lista = {
            id: el.idLista,
            desc: el.descripcion,
            noContratoList: el.noContratoList,
            noFianzaList: el.noFianzaList,
            noProveedorList: el.noProveedorList
          }
          this.verSolicitudListaPrecio.unshift(lista);
        });
        Swal.close();
        this.suscription2.unsubscribe();
        this.suscription.unsubscribe();
        $('#verSolicitudModal').modal('show');
      }, err => {
        this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
      });
    }, err => {
      this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
    });
  }

  actualizarSolicitud(event: { solicitud: Solicitud, procesar: false }): void {
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
              this.router.navigate(['/xAtender/preparar', event.solicitud.id, event.solicitud.idLista]).then( () => {
                window.location.reload();
              });
            } else {
              window.location.reload();
            }
          }
        });
      } else {
        Swal.close();
        window.location.reload();
      }
    }, err => {
      this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
    });
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
}
