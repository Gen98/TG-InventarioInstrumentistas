import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Movimiento } from '../../interfaces/movimiento.interface';
import { Registro } from '../../interfaces/registro.interface';
import almacenesJSON from '../../../assets/files/almacenes.json';


declare var $: any;


@Component({
  selector: 'app-no-sincronizados',
  templateUrl: './no-sincronizados.component.html',
  styleUrls: ['./no-sincronizados.component.css']
})
export class NoSincronizadosComponent implements OnInit {

  nuevoMovimiento: Movimiento = {
    almacen: 0,
    registros: [],
    fechaCreacion: 0,
    imagenes: [],
    firmas: [],
    tipoEntrada: true
  };
  actualizarMovimiento: Movimiento = {
    almacen: 0,
    registros: [],
    fechaCreacion: 0,
    imagenes: [],
    firmas: [],
    tipoEntrada: true
  };
  almacenes: any;
  isBounes: boolean = true;
  limpiarPad: boolean = false;
  camaraEvidencias: boolean = false;
  private innerWidth: number;

  @Input() movimientos: Movimiento[] = [];
  @Output() registrarMovimiento: EventEmitter<Movimiento> = new EventEmitter();
  @Output() actualizarMovimientoOutput: EventEmitter<Movimiento> = new EventEmitter();
  @Output() eliminarMovimientoOutput: EventEmitter<Movimiento> = new EventEmitter();
  @Output() sincronizarEmit :EventEmitter<Movimiento[]> = new EventEmitter();

  constructor() { 
    this.innerWidth = window.innerWidth;
    this.almacenes = almacenesJSON.data;
  }

  ngOnInit(): void {

  }

  movil(): boolean{
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent))
      return true;

    return this.innerWidth < 768;
  }

  registrarEscaneo(item: Registro) {
    let registros: Registro[] = this.nuevoMovimiento.registros;
    let duplicado = registros.findIndex(function(e) {
      return e.code == item.code && e.lote == item.lote
    });
    if (duplicado != -1) {
      registros[duplicado].cant = Number(registros[duplicado].cant) + item.cant;
      let actualizado = registros[duplicado];
      registros = registros.filter(function(el) {
        return !(el.lote === item.lote && el.code === item.code);
      });
      registros.unshift(actualizado);
    } else {
      registros.unshift(item);
    }
  }

  agregarImagen(imagen: any): void {
    let images = this.nuevoMovimiento.imagenes;
    let duplicado = images.findIndex(function(e) {
      return e.base64 == imagen.base64
    });
    if (duplicado != -1) {
      images[duplicado] = imagen;
    } else {
      images.unshift(imagen);
    }
    this.camaraEvidencias = false;
  }

  eliminarImagen(imagen: any): void {
    let images = this.nuevoMovimiento.imagenes;
    images = images.filter(function(image) {
      return image.base64 != imagen.base64;
    });
    this.nuevoMovimiento.imagenes = images;
  }

  agregarFirma(base64: any[]): void {
    this.nuevoMovimiento.firmas = base64;
    this.limpiarPad = false;
  }

  guardarMovimientoNuevo(): void {
    if (this.validarMovimiento()) {
      this.registrarMovimiento.emit(this.nuevoMovimiento);
      this.limpiarNuevoMovimiento();
      document.getElementById("closeAgregarModal")!.click();
      Swal.fire({
        icon: 'success',
        title: 'Movimiento creado exitosamente',
        timer: 2000
      });
      this.limpiarPad = true;
    }
  }

  detallesMovimiento(movimiento: Movimiento): void {
    this.actualizarMovimiento = movimiento;
    document.getElementById("openvisualizarModal")!.click();
  }

  actualizarMovimientoCreado(): void {
    this.actualizarMovimientoOutput.emit(this.actualizarMovimiento);
    document.getElementById("closeVisualizarModal")!.click();
    this.actualizarMovimiento = this.nuevoMovimiento;
  }

  eliminarMovimiento(movimiento: Movimiento): void {
    this.eliminarMovimientoOutput.emit(movimiento);
  }

  limpiarNuevoMovimiento(): void {
    this.nuevoMovimiento = {
      almacen: 0,
      registros: [],
      fechaCreacion: 0,
      imagenes: [],
      firmas: [],
      tipoEntrada: true
    };
  }

  validarMovimiento(): boolean {
    let almacen = this.almacenes.find((e: any) => e.value == this.nuevoMovimiento.almacen);
    if (!almacen) {
      this.mostrarAlert('Selecciona el almacen');
      return false
    }
    if (this.nuevoMovimiento.tipoEntrada == null) {
      this.mostrarAlert('Especifica el tipo de movimiento');
      return false;
    }
    if (this.nuevoMovimiento.registros.length == 0) {
      this.mostrarAlert('Ingresa por lo menos un registro');
      return false;
    }
    if (this.nuevoMovimiento.imagenes.length == 0) {
      this.mostrarAlert('Necesitas ingresar una imagen');
      return false;
    }
    if (!this.nuevoMovimiento.tipoEntrada && this.nuevoMovimiento.firmas.length == 0) {
      this.mostrarAlert('Necesitas ingresar la firma');
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

  mostrarModalCamara() {
    this.camaraEvidencias = true;
    $("#camaraEvidenciasModal").modal('show');
  }

  sincronizar(e: any): void {
    this.sincronizarEmit.emit();
  }
}
