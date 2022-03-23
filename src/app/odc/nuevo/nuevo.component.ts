import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SolicitudesService } from '../../services/solicitudes.service';
import { ClienteDistribuidor } from '../../interfaces/cliente_distribuidor.interface';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Solicitud } from '../../interfaces/solicitud.interface';
import { Clasificacion } from '../../interfaces/clasificacion.interface';
import Swal from 'sweetalert2';
import moment from 'moment';

declare var $: any;

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css']
})
export class NuevoComponent implements OnInit {

  nuevaSolicitud: Solicitud;
  clientes: ClienteDistribuidor[] = [];
  listasPrecios: ListaPrecio[] = [];
  subcategorias: any[] = [];
  clasificacion: number = 0;

  @Input() clasificaciones: Clasificacion[] = [];
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
      folioConsumo: '',
      subcategoria: 0
    }
  }

  ngOnInit(): void {
  }

  updateSubclasificaciones(event: any): void {
    this.limpiarNuevaSolicitud('subcategoria');
    let clasificacion = event.target.value;
    if (!clasificacion || clasificacion == null) return;
    this.clasificacion = clasificacion;
    this.subcategorias = this.clasificaciones.find((e: any) => e.id == clasificacion)!.subclasificaciones!;
    this.nuevaSolicitud.subcategoria = this.subcategorias[0].id;
  }

  updateSubcategoria(event: any): void {
    this.nuevaSolicitud.subcategoria = event.target.value;
  }

  getClientes(event: any): void {
    this.limpiarNuevaSolicitud('proveedor');
    let proveedor = event.target.value;
    if (!proveedor || proveedor == null) return;

    this.nuevaSolicitud.idProveedor = parseInt(proveedor);

    let clientes = this.distribuidores.find((e: any) => e.id == proveedor)!.clientes!;

    this.clientes = clientes;
  }

  getListas(event: any): void {
    this.limpiarNuevaSolicitud('cliente');
    let cliente = event.target.value;

    if (!cliente || cliente == null) return;

    this.nuevaSolicitud.idCliente = parseInt(cliente);

    let listas = this.clientes.find((e: any) => e.idCliente == cliente)!.listas!;
    this.listasPrecios = listas;
  }

  actualizarListaPrecios(e: any): void {
    this.limpiarNuevaSolicitud();
    let idLista = e.target.value;

    if (!idLista || idLista == null) return;

    let lista = this.listasPrecios.filter(function (lista) {
      return lista.idLista == idLista;
    });

    this.nuevaSolicitud.idLista = lista[0].idLista;
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
    let subclasificacion = this.subcategorias.find((e: any) => e.id == this.nuevaSolicitud.subcategoria);
    let proveedor = this.distribuidores.find((e: any) => e.id == this.nuevaSolicitud.idProveedor);
    let cliente = this.clientes.find((e: any) => e.idCliente == this.nuevaSolicitud.idCliente);
    let lista = this.listasPrecios.find((e: any) => e.idLista == this.nuevaSolicitud.idLista);
    let fechaReq = moment(this.nuevaSolicitud.fechaReq, "YYYY-MM-DD", true);
    let fechaCirugia = moment(this.nuevaSolicitud.fechaCirugia, "YYYY-MM-DD", true);
    if (!subclasificacion) {
      this.mostrarAlert('Selecciona la subcategoria');
      return false;
    }
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
    } else {
      var sizeInMB = parseFloat((this.nuevaSolicitud.solicitudPDF.size / (1024 * 1024)).toFixed(2));
      if (sizeInMB >= 10) {
        this.mostrarAlert('Tu archivo debe pesar menos de 10 MB.');
        return false;
      }
    }
    if (this.nuevaSolicitud.paciente.length <= 5 && this.clasificacion == 1) {
      this.mostrarAlert('Ingresa el nombre del paciente.');
      return false;
    }
    if (!this.nuevaSolicitud.nss && this.clasificacion == 1) {
      this.mostrarAlert('Ingresa el NSS.');
      return false;
    }
    if (!this.nuevaSolicitud.folioConsumo && this.clasificacion == 1) {
      this.mostrarAlert('Ingresa el folio de consumo.');
      return false;
    }

    if (!fechaReq.isValid()) {
      this.mostrarAlert('La fecha de requisicion es invalida.');
      return false;
    }
    if (!fechaCirugia.isValid() && this.clasificacion == 1) {
      this.mostrarAlert('La fecha de cirugia es invalida.');
      return false;
    }
    if (fechaReq.isAfter(fechaCirugia) && this.clasificacion == 1) {
      this.mostrarAlert('La fecha de cirugia no puede ser menor a la fecha de requisicion.');
      return false;
    }
    if (!this.nuevaSolicitud.nombreDoctor && this.clasificacion == 1) {
      this.mostrarAlert('Ingresa el nombre del doctor.');
      return false;
    }
    return true;
  }

  limpiarNuevaSolicitud(tipo: string = 'lista'): void {
    if (tipo == 'completo') {
      $('#distribuidor option:eq(0)').prop('selected', true);
      $("#file").val(null);
      $('.clearDate').click();
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
    if (tipo == 'cliente' || tipo == 'proveedor' || tipo == 'completo') {
      this.listasPrecios = [];
      this.nuevaSolicitud.idCliente = 0;
    }
    if (tipo == 'subcategoria' || tipo == 'completo') {
      this.nuevaSolicitud.subcategoria = 0;
      $('.clearDate').click();
      this.nuevaSolicitud.idUsuarioGenera = 0;
      this.nuevaSolicitud.paciente = '';
      this.nuevaSolicitud.nss = '';
      this.nuevaSolicitud.fechaCirugia = ''
      this.nuevaSolicitud.nombreDoctor = '';
      this.nuevaSolicitud.folioConsumo = '';
    }
    if (tipo != 'subcategoria') {
      this.nuevaSolicitud.idLista = 0;
      this.nuevaSolicitud.noContrato = '';
      this.nuevaSolicitud.noFianza = '';
      this.nuevaSolicitud.noProveedor = '';
    }
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
