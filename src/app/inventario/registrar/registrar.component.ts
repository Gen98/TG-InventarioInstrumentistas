import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Registro } from '../../interfaces/registro.interface';
import data from '../../../assets/files/data.json';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class RegistrarComponent implements OnInit {

  productos: any;
  nuevoRegistro: Registro = {
    code: "",
    desc: "",
    lote: "",
    cant: 0
  };
  tipoEscaner: string = "";
  qr: string = "";
  codigo: string = "";
  lote: string = "";
  cantidad: number = 0;
  barcodePaso: number = 1;
  escanerActivo: boolean = false;

  private innerWidth: number;

  @Input() isBounes: boolean = false;
  @Input() dentroRango: boolean = true;
  @Output() registrarNuevo: EventEmitter<Registro> = new EventEmitter();

  @ViewChildren('txtQr') qrInputs!: QueryList<ElementRef>;
  @ViewChildren('txtCodigo') codigoInputs!: QueryList<ElementRef>;
  @ViewChildren('txtLote') loteInputs!: QueryList<ElementRef>;
  @ViewChildren('txtCantidad') cantidadInputs!: QueryList<ElementRef>;

  constructor() { 
    this.innerWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.productos = data.data;
  }

  public ngAfterViewInit(): void
    {
      this.qrInputs.changes.subscribe((comps: QueryList <any>) => {
        if (this.tipoEscaner == 'qr') comps.first.nativeElement.focus();
      });
      this.codigoInputs.changes.subscribe((comps: QueryList <any>) => {
        if (this.barcodePaso == 1 && this.tipoEscaner == 'barcode') comps.first.nativeElement.focus();
      });
      this.loteInputs.changes.subscribe((comps: QueryList <any>) => {
        if (this.barcodePaso == 2) comps.first.nativeElement.focus();
      });
      this.cantidadInputs.changes.subscribe((comps: QueryList <any>) => {
        if (this.barcodePaso == 3) comps.first.nativeElement.focus();
      });
    }

  movil(): boolean{
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent))
      return true;

    return this.innerWidth < 768;
  }

  seleccionarTipo( tipo:string ): void {
    if (this.dentroRango) {
      this.resetearVariables();
      this.tipoEscaner = tipo;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Alerta',
        text: 'Haz llegado al limite, necesitas exportar la informaci??n para continuar.'
      });
    }
  }

  registrar(): void {
    if (this.tipoEscaner == 'qr') {
      this.registrarQr();
    } else {
      this.registrarBarcode();
    }
  }

  resetearVariables(): void {
    // this.tipoEscaner = "";
    this.qr = "";
    this.codigo = "";
    this.lote = ""
    this.cantidad = 0;
    this.barcodePaso = 1;
    this.nuevoRegistro = {
      code: "",
      desc: "",
      lote: "",
      cant: 0
    }
  }

  validarQr(cadena: any[]): boolean {
    if ($('#camaraModal').is(':visible')) $("#camaraModal").modal('hide');
    if (cadena.length != 3) return false;
    if (!(/^\d+$/.test(cadena[0])) || !(/^([a-zA-Z0-9-]+)$/.test(cadena[1])) || !(/^\d+$/.test(cadena[2]))) return false;
    return true;
  }

  validarBarcode(): boolean {
    if ($('#camaraModal').is(':visible')) $("#camaraModal").modal('hide');
    if (this.barcodePaso == 3 && parseInt(this.cantidad.toString(), 10) <= 0) return false;
    if (this.barcodePaso == 2 && !(/^([a-zA-Z0-9-/]+)$/.test(this.lote))) return false;
    if (this.barcodePaso == 1 && !(/^\d+$/.test(this.codigo))) return false;
    return true;
  }

  registrarQr(): void {
    let cadena = this.qr.includes('/') ? this.qr.split('/') : this.qr.split('-');
    let producto = this.productos.find((e: any) => e.Codigo == cadena[0]);

    if (this.validarQr(cadena) && producto) {
      this.nuevoRegistro = {
        code: producto.Codigo,
        desc: producto.Descripcion,
        lote: cadena[1],
        cant: parseInt(cadena[2], 10)
      }

      this.registrarNuevo.emit(this.nuevoRegistro);

      Swal.fire({
        icon: 'success',
        text: 'Registro exitoso',
        showCloseButton: true,
        showConfirmButton: false,
        timer: 500
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'C??digo inv??lido, intenta nuevamente o realiza el registro manual.'
      });
    }
    this.resetearVariables();
  }

  registrarBarcode(): void {
    let producto = this.productos.find((e: any) => e.Codigo == this.codigo);
    if (this.validarBarcode() && producto) {
      if (this.barcodePaso == 3) {
        this.nuevoRegistro = {
          code: this.codigo,
          desc: producto.Descripcion,
          lote: this.lote,
          cant: parseInt(this.cantidad.toString(), 10)
        }

        Swal.fire({
          title: 'Confirma los datos',
          text: `Producto: ${this.nuevoRegistro.desc} - Lote: ${this.lote} - Cantidad: ${this.nuevoRegistro.cant}`,
          icon: 'info',
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: '#02a3b5',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirmar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.registrarNuevo.emit(this.nuevoRegistro);
            this.resetearVariables();
          } else {
            this.resetearVariables();
          }
        });
      } else {
        this.barcodePaso++;
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'C??digo inv??lido'
      });
    }
  }

  mostrarModalCamara(): void {
    // $("#exampleModal").modal('hide');
    // setTimeout(() => {
      this.escanerActivo = true;
      $("#camaraModal").modal('show');
    // }, 1000);
  }

  codigoEscaneado(codigo: string): void {
    if (this.tipoEscaner == 'qr') {
      this.qr = codigo
    } else if (this.barcodePaso == 1) {
      this.codigo = codigo;
    } else if (this.barcodePaso == 2) {
      this.lote = codigo;
    }
    this.escanerActivo = false;
    this.registrar();
  }
}
