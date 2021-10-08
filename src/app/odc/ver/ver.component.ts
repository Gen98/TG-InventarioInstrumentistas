import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import {saveAs as importedSaveAs} from "file-saver";
import Swal from 'sweetalert2';
import moment from 'moment';
import { SolicitudesService } from '../../services/solicitudes.service';
import { ListaPrecio } from '../../interfaces/lista_precio.interface';
import { Solicitud } from '../../interfaces/solicitud.interface';

declare var $: any;

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css']
})
export class VerComponent implements OnInit {

  @Input() solicitud: Solicitud|any;
  @Input() listasPrecios: ListaPrecio[] = [];
  @Output() updateSolicitud: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private solicitudService: SolicitudesService) { }

  ngOnInit(): void {
  }

  descargarArchivoSolicitud(): void {
    this.solicitudService.downloadPDF(this.solicitud.idSolicitudPDF).subscribe(res => {
      let file = new Blob([res], { type: 'application/pdf' });
      importedSaveAs(file, this.solicitud.solicitudPDFNombre);
    });
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

    let lista = this.listasPrecios.filter(function(lista) {
      return lista.id == idLista;
    });

    this.solicitud.idLista = lista[0].id;
    this.solicitud.noContrato = lista[0].noContratoList;
    this.solicitud.noFianza = lista[0].noFianzaList;
    this.solicitud.noProveedor = lista[0].noProveedorList;
  }

  actualizarSolicitud(): void {
    if (this.validarSolicitud()) {
      this.updateSolicitud.emit({solicitud: this.solicitud, procesar: false});
    }
  }

  validarSolicitud(): boolean {
    let lista = this.listasPrecios.find((e: any) => e.id == this.solicitud.idLista);
    let fechaReq = moment(this.solicitud.fechaReq, "YYYY-MM-DD", true);
    let fechaCirugia = moment(this.solicitud.fechaCirugia, "YYYY-MM-DD", true);
    if (!lista) {
      this.mostrarAlert('Selecciona la lista de precios.');
      return false;
    }
    if (this.solicitud.paciente.length <= 5) {
      this.mostrarAlert('Ingresa el nombre del paciente.');
      return false;
    }
    if (!this.solicitud.nss) {
      this.mostrarAlert('Ingresa el NSS.');
      return false;
    }
    if (!this.solicitud.folioConsumo) {
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
    if (!this.solicitud.nombreDoctor) {
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
      this.updateSolicitud.emit({solicitud: this.solicitud, procesar: true});
    }
  }

}
