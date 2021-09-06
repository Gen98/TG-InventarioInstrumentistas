import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Movimiento } from '../../interfaces/movimiento.interface';
import { Registro } from '../../interfaces/registro.interface';

@Component({
  selector: 'app-no-sincronizados',
  templateUrl: './no-sincronizados.component.html',
  styleUrls: ['./no-sincronizados.component.css']
})
export class NoSincronizadosComponent implements OnInit {

  nuevoMovimiento: Movimiento = {
    registros: [],
    fechaCreacion: 0,
    imagenes: [],
    firmas: [],
    tipoEntrada: true
  };
  actualizarMovimiento: Movimiento = {
    registros: [],
    fechaCreacion: 0,
    imagenes: [],
    firmas: [],
    tipoEntrada: true
  };
  isBounes: boolean = true;
  limpiarPad: boolean = false;
  camaraEvidencias: boolean = false;

  @Input() movimientos: Movimiento[] = [];
  @Output() registrarMovimiento: EventEmitter<Movimiento> = new EventEmitter();
  @Output() actualizarMovimientoOutput: EventEmitter<Movimiento> = new EventEmitter();
  @Output() eliminarMovimientoOutput: EventEmitter<Movimiento> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  
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

  agregarFirma(base64: string[]): void {
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
      registros: [],
      fechaCreacion: 0,
      imagenes: [],
      firmas: [],
      tipoEntrada: true
    };
  }

  validarMovimiento(): boolean {
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
    if (this.nuevoMovimiento.firmas.length == 0) {
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
}
