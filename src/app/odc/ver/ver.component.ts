import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs as importedSaveAs } from "file-saver";
import Swal from 'sweetalert2';
import moment from 'moment';
import { SolicitudesService } from '../../services/solicitudes.service';
import { Clasificacion } from '../../interfaces/clasificacion.interface';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Solicitud } from '../../interfaces/solicitud.interface';

declare var $: any;

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css']
})
export class VerComponent implements OnInit {

  dateUpdated: boolean = false;
  clasificacion: number = 0;
  subcategorias: any[] = [];
  @Input() solicitud: Solicitud | any;
  @Input() listasPrecios: ListaPrecio[] = [];
  @Input() clasificaciones: Clasificacion[] = [];
  @Output() updateSolicitud: EventEmitter<any> = new EventEmitter();
  @Output() previewPdf: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private solicitudService: SolicitudesService) { }

  ngOnInit(): void {
  }

  descargarArchivoSolicitud(): void {
    if (this.solicitud.archivoSolicitud) {
      if (!this.solicitud.solicitudPDFNombre.endsWith('pdf')) {
        this.previewPdf.emit('data:image/png;base64,' + this.solicitud.archivoSolicitud);
        return;
      }
      const byteCharacters = atob(this.solicitud.archivoSolicitud);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new Blob([byteArray], { type: 'application/pdf' });
      // this.solicitudService.downloadPDF(this.solicitud.idSolicitudPDF).subscribe(res => {
      // let file = new Blob([this.solicitud.archivoSolicitud], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      this.previewPdf.emit(fileURL);

      // importedSaveAs(file, this.solicitud.solicitudPDFNombre);
      // });
    } else {
      if (!this.solicitud.solicitudPDFNombre.endsWith('pdf')) {
        var reader = new FileReader();
        let base64 = this.previewPdf;
        reader.readAsDataURL(this.solicitud.solicitudPDF);
        reader.onload = function () {
          base64.emit(reader.result);
        };
        return;
      }
      var fileURL = URL.createObjectURL(this.solicitud.solicitudPDF);
      this.previewPdf.emit(fileURL);
    }
  }

  arrayBufferToBase64(buffer: any) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);

  }

  subirArchivo(e: any): void {
    this.solicitud.solicitudPDF = '';
    if (e.target.files.length) {
      this.solicitud.solicitudPDF = e.target.files[0];
    }
  }

  actualizarListaPrecios(e: any): void {
    let idLista = e.target.value;

    if (!idLista || idLista == null) return;

    let lista = this.listasPrecios.filter(function (lista) {
      return lista.idLista == idLista;
    });

    this.solicitud.idLista = lista[0].idLista;
    this.solicitud.noContrato = lista[0].noContratoList;
    this.solicitud.noFianza = lista[0].noFianzaList;
    this.solicitud.noProveedor = lista[0].noProveedorList;
  }

  actualizarSolicitud(): void {
    console.log(this.solicitud);
    if (this.validarSolicitud()) {
      this.updateSolicitud.emit({ solicitud: this.solicitud, procesar: false, dateUpdated: this.dateUpdated });
      this.dateUpdated = false;
    }
  }

  validarSolicitud(): boolean {
    let subclasificacion = this.subcategorias.find((e: any) => e.id == this.solicitud.subcategoria);
    let lista = this.listasPrecios.find((e: any) => e.idLista == this.solicitud.idLista);
    let fechaReq = moment(this.solicitud.fechaReq, "YYYY-MM-DD", true);
    let fechaCirugia = moment(this.solicitud.fechaCirugia, "YYYY-MM-DD", true);
    if (!subclasificacion) {
      this.mostrarAlert('Selecciona la subcategoria');
      return false;
    }
    if (!lista) {
      this.mostrarAlert('Selecciona la lista de precios.');
      return false;
    }
    if (this.solicitud.paciente.length <= 5 && (this.clasificacion == 1 || this.clasificacion == 5)) {
      this.mostrarAlert('Ingresa el nombre del paciente.');
      return false;
    }
    if (!this.solicitud.nss && (this.clasificacion == 1 || this.clasificacion == 5)) {
      this.mostrarAlert('Ingresa el NSS.');
      return false;
    }
    if (!this.solicitud.folioConsumo && (this.clasificacion == 1 || this.clasificacion == 5)) {
      this.mostrarAlert('Ingresa el folio de consumo.');
      return false;
    }

    if (!fechaReq.isValid()) {
      this.mostrarAlert('La fecha de requisicion es invalida.');
      return false;
    }
    if (!fechaCirugia.isValid() && (this.clasificacion == 1 || this.clasificacion == 5)) {
      this.mostrarAlert('La fecha de cirugia es invalida.');
      return false;
    }
    if (fechaReq.isAfter(fechaCirugia) && (this.clasificacion == 1 || this.clasificacion == 5)) {
      this.mostrarAlert('La fecha de cirugia no puede ser menor a la fecha de requisicion.');
      return false;
    }
    if (!this.solicitud.nombreDoctor && (this.clasificacion == 1 || this.clasificacion == 5)) {
      this.mostrarAlert('Ingresa el nombre del doctor.');
      return false;
    }
    return true;
  }

  procesarDisponible(): boolean {
    let fechaCirugia = moment(this.solicitud.fechaCirugia, "YYYY-MM-DD", true);
    let now = moment(moment(new Date()).format("YYYY-MM-DD"), "YYYY-MM-DD", true);
    if (fechaCirugia.isAfter(now)) {
      this.mostrarAlert('La fecha de cirugia no se ha concluido.');
      return false;
    }
    return true;
  }

  mostrarAlert(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

  procesar(): void {
    if (this.validarSolicitud() && this.procesarDisponible()) {
      this.updateSolicitud.emit({ solicitud: this.solicitud, procesar: true, dateUpdated: this.dateUpdated });
      this.dateUpdated = false;
    }
  }

  mostrarCamposCirugia(): boolean {
    let ids = ['1', '2', '3', '11', '12', '13'];
    let sub = this.solicitud.subcategoria;
    return ids.includes(sub ? sub.toString() : null);
  }

  updateSubclasificaciones(event: any): void {
    let clasificacion = event.target.value;
    if (!clasificacion || clasificacion == null) return;
    if (!((this.clasificacion == 5 || this.clasificacion <= 1) && (clasificacion == 5 || clasificacion == 1))) this.limpiarSolicitud();
    this.clasificacion = clasificacion;
    this.subcategorias = this.clasificaciones.find((e: any) => e.id == clasificacion)!.subclasificaciones!;
    this.solicitud.subcategoria = this.subcategorias[0].id.toString();
    $('.subclasificaciones option:eq(1)').prop('selected', true);
  }

  updateSubcategoria(event: any): void {
    this.solicitud.subcategoria = event.target.value;
  }

  limpiarSolicitud(): void {
    $('.clearDate').click();
    this.solicitud.paciente = '';
    this.solicitud.nss = '';
    this.solicitud.fechaCirugia = ''
    this.solicitud.nombreDoctor = '';
    this.solicitud.folioConsumo = '';
  }
}
