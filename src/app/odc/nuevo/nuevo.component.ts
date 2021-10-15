import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SolicitudesService } from '../../services/solicitudes.service';
import { ClienteDistribuidor } from '../../interfaces/cliente_distribuidor.interface';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Solicitud } from '../../interfaces/solicitud.interface';
import Swal from 'sweetalert2';
import moment from 'moment';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css']
})
export class NuevoComponent implements OnInit {

  nuevaSolicitud: Solicitud;
  clientes: ClienteDistribuidor[] = [];
  listasPrecios: ListaPrecio[] = [];
  
  @Input() distribuidores: ClienteDistribuidor[] = [];
  @Output() storeSolicitud: EventEmitter<Solicitud> = new EventEmitter();

  constructor(private solicitudService: SolicitudesService) {
    this.distribuidores = []; 
    this.nuevaSolicitud = {
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
  }

  getClientes(event: any): void {
    this.limpiarNuevaSolicitud('proveedor');
    let proveedor = event.target.value;
    if (!proveedor || proveedor == null) return;

    this.nuevaSolicitud.idProveedor = parseInt(proveedor);

    this.mostrarAlertCarga();
    this.solicitudService.getClientes(proveedor).subscribe( res => {
      res.forEach((el: any) => {
        let cliente = {
          id: el.idCliente,
          nombre: el.nombre
        }
        this.clientes.unshift(cliente);
      });
      Swal.close();
    }, err => {
      this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
    });
  }

  getListas(event: any): void {
    this.limpiarNuevaSolicitud('cliente');
    let cliente = event.target.value;

    if (!cliente || cliente == null) return;

    this.nuevaSolicitud.idCliente = parseInt(cliente);

    this.mostrarAlertCarga();
    this.solicitudService.getListas(cliente).subscribe( res => {
      res.forEach((el: any) => {
        let lista = {
          id: el.idLista,
          desc: el.descripcion,
          noContratoList: el.noContratoList,
          noFianzaList: el.noFianzaList,
          noProveedorList: el.noProveedorList
        }
        this.listasPrecios.unshift(lista);
      });
      Swal.close();
    }, err => {
      this.mostrarAlert('Ocurrió un error, si este persiste contacte a sistemas');
    });
  }

  actualizarListaPrecios(e: any): void {
    this.limpiarNuevaSolicitud();
    let idLista = e.target.value;
    
    if (!idLista || idLista == null) return;

    let lista = this.listasPrecios.filter(function(lista) {
      return lista.id == idLista;
    });

    this.nuevaSolicitud.idLista = lista[0].id;
    this.nuevaSolicitud.noContrato = lista[0].noContratoList;
    this.nuevaSolicitud.noFianza = lista[0].noFianzaList;
    this.nuevaSolicitud.noProveedor = lista[0].noProveedorList;
  }

  subirArchivo(e: any): void {
    this.nuevaSolicitud.solicitudPDF = '';
    if (e.target.files.length) {
      this.nuevaSolicitud.solicitudPDF = e.target.files[0];
    }
  }

  guardarSolicitud(): void {
    this.nuevaSolicitud.idUsuarioGenera = parseInt(this.solicitudService.readToken());
    if (this.validarSolicitud()) {
      this.storeSolicitud.emit(this.nuevaSolicitud);
    }
  }

  validarSolicitud(): boolean {
    let proveedor = this.distribuidores.find((e: any) => e.id == this.nuevaSolicitud.idProveedor);
    let cliente = this.clientes.find((e: any) => e.id == this.nuevaSolicitud.idCliente);
    let lista = this.listasPrecios.find((e: any) => e.id == this.nuevaSolicitud.idLista);
    let fechaReq = moment(this.nuevaSolicitud.fechaReq, "YYYY-MM-DD", true);
    let fechaCirugia = moment(this.nuevaSolicitud.fechaCirugia, "YYYY-MM-DD", true);
    if (!proveedor) {
      this.mostrarAlert('Selecciona el distribuidor.');
      return false;
    }
    if (!cliente) {
      this.mostrarAlert('Selecciona el cliente.');
      return false;
    }
    if (!lista) {
      this.mostrarAlert('Selecciona la lista de precios.');
      return false;
    }
    if (this.nuevaSolicitud.solicitudPDF.length == 0) {
      this.mostrarAlert('Es necesario subir el archivo.');
      return false;
    }
    if (this.nuevaSolicitud.paciente.length <= 5) {
      this.mostrarAlert('Ingresa el nombre del paciente.');
      return false;
    }
    if (!this.nuevaSolicitud.nss) {
      this.mostrarAlert('Ingresa el NSS.');
      return false;
    }
    if (!this.nuevaSolicitud.folioConsumo) {
      this.mostrarAlert('Ingresa el folio de consumo.');
      return false;
    }
    
    if (!fechaReq.isValid()) {
      this.mostrarAlert('La fecha de requisicion es invalida.');
      return false;
    }
    if (!fechaCirugia.isValid()) {
      this.mostrarAlert('La fecha de cirugia es invalida.');
      return false;
    }
    if (fechaReq.isAfter(fechaCirugia)) {
      this.mostrarAlert('La fecha de cirugia no puede ser menor a la fecha de requisicion.');
      return false;
    }
    if (!this.nuevaSolicitud.nombreDoctor) {
      this.mostrarAlert('Ingresa el nombre del doctor.');
      return false;
    }
    return true;
  }

  limpiarNuevaSolicitud(tipo: string = 'lista'): void {
    if (tipo == 'completo') {
      this.nuevaSolicitud.idUsuarioGenera = 0;
      this.nuevaSolicitud.solicitudPDF = '';
      this.nuevaSolicitud.paciente = '';
      this.nuevaSolicitud.nss = '';
      this.nuevaSolicitud.fechaReq = '';
      this.nuevaSolicitud.fechaCirugia = ''
      this.nuevaSolicitud.nombreDoctor = '';
      this.nuevaSolicitud.observacionesPrefactura = '';
      this.nuevaSolicitud.folioConsumo = '';
    }
    if (tipo == 'proveedor' || tipo == 'completo') {
      this.listasPrecios = [];
      this.clientes = [];
      this.nuevaSolicitud.idProveedor = 0;
    }
    if (tipo == 'cliente' || tipo == 'proveedor' || tipo =='completo') {
      this.listasPrecios = [];
      this.nuevaSolicitud.idCliente = 0;
    }
    this.nuevaSolicitud.idLista = 0;
    this.nuevaSolicitud.noContrato = '';
    this.nuevaSolicitud.noFianza = '';
    this.nuevaSolicitud.noProveedor = '';
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
