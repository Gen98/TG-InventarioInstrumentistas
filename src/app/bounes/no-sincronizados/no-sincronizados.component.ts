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
    folio: '',
    almacen: 0,
    registros: [],
    fechaCreacion: 0,
    imagenes: [],
    firmas: [],
    tipoEntrada: true
  };
  actualizarMovimiento: Movimiento = {
    folio: '',
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
  camaraFolio: boolean = false;
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

  eliminarRegistrosMov(item: Registro) {
    let registros: Registro[] = this.nuevoMovimiento.registros;

    if (item.deleteAll) {
      registros = registros.filter(function(el) {
        return !(el.lote === item.lote && el.code === item.code);
      });
    }
    this.nuevoMovimiento.registros = registros;
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

  folioEscaneado(e: String): void {
    let codigo = e.split('/');
    let almacen = e.split('/');
    if (this.validarFolio(codigo)) {
      this.nuevoMovimiento.folio = codigo[0];

      let buscarAlmacen: string[] = [];
      if (almacen[1].includes(',')) {
        buscarAlmacen = almacen[1].split(',');
      } else {
        buscarAlmacen.push(codigo[1]);
      }

      this.almacenes = this.almacenes.filter(function(el: any) {
        return buscarAlmacen.includes(el.value.toString());
      });
      if (this.almacenes.length == 0) {
        this.mostrarAlert('Tu folio no incluye inventario que pueda recibir.'); 
        this.almacenes = almacenesJSON.data;
      } else {
        if (almacen[1].includes(',')) {
          $('#almacen').prop("disabled", false);
          $('[name="folio"]').prop("disabled", true);
          $('.form-check-input').prop("disabled", true);
          this.nuevoMovimiento.tipoEntrada = true;
        } else {
          this.nuevoMovimiento.almacen = parseInt(codigo[1]);
          $('#almacen').prop("disabled", true);
          $('[name="folio"]').prop("disabled", true);
          $('.form-check-input').prop("disabled", true);
          this.nuevoMovimiento.tipoEntrada = true;
        }
        
      }
    }

    this.camaraFolio = false;
    $("#escanerFolioModal").modal('hide');
  }

  limpiarNuevoMovimiento(): void {
    this.nuevoMovimiento = {
      folio: '',
      almacen: 0,
      registros: [],
      fechaCreacion: 0,
      imagenes: [],
      firmas: [],
      tipoEntrada: true
    };
    $('#almacen').prop("disabled", false);
    $('[name="folio"]').prop("disabled", false);
    $('.form-check-input').prop("disabled", false);
    this.almacenes = almacenesJSON.data;
  }

  validarMovimiento(): boolean {
    // if(!this.nuevoMovimiento.folio) {
    //   this.mostrarAlert('Escanea el folio');
    //   return false
    // }
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
    // if (this.nuevoMovimiento.imagenes.length == 0) {
    //   this.mostrarAlert('Necesitas ingresar una imagen');
    //   return false;
    // }
    if (!this.nuevoMovimiento.tipoEntrada && this.nuevoMovimiento.firmas.length == 0) {
      this.mostrarAlert('Necesitas ingresar la firma');
      return false;
    }
    return true;
  }

  validarFolio(cadena: any[]): boolean {
    var pass = true;
    if (cadena.length == 1) {
      this.mostrarAlert('Tu folio no incluye inventario que pueda recibir.');
      return false;
    }
    if (cadena.length != 2) {
      this.mostrarAlert('Folio invalido');
      return false;
    }
    if (cadena[1].includes(',')) {
      cadena[1] = cadena[1].split(',');
      cadena[1].forEach((almacen: string) => {
        if (!(/^\d+$/.test(almacen))) {
          pass = false;
        }
      });
    } else {
      if (!(/^\d+$/.test(cadena[1]))) pass = false;
    }
    if (!pass) {
      this.mostrarAlert('El almacen de tu folio en invalido');
    }
    return pass;
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

  escanearFolioModal() {
    this.camaraFolio = true;
    this.almacenes = almacenesJSON.data;
    $("#escanerFolioModal").modal('show');
  }

  sincronizar(e: any): void {
    this.sincronizarEmit.emit();
  }
}
