import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';
import { Producto, Solicitud } from 'src/app/interfaces/gastos.interface';
import { GastosService } from '../../services/gastos.service';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css']
})
export class NuevoComponent implements OnInit {

  productos: any[] = []
  @Input() solicitud: Solicitud;
  nuevoProducto: Producto;
  sourcePdf: SafeResourceUrl;
  sourceIsPDF: boolean = true;
  zoomPdf: number = 1;

  @Input() esNuevo: boolean = true;

  constructor(private gastosService: GastosService,
    private router: Router
  ) { 
    this.sourcePdf = '';
    this.solicitud = {
      observaciones: '',
      productos: [],
      precioTotal: 0,
      importeTotal: 0
    };
    this.nuevoProducto = {
      codigo: '',
      descripcion: '',
      precio: 0,
      cantidad: 1,
      importe: 0
    }
  }

  ngOnInit(): void {
    this.getProductos();
  }

  getProductos(): void {
    this.mostrarAlertCarga();
    this.gastosService.getProductos().subscribe(res => {
      this.productos = res;
      Swal.close();
    });
  }

  selectProd(e: any): void {
    let prod = this.productos.find(item => item.id == e.target.value)!;
    this.nuevoProducto.codigo = prod.codigo;
    this.nuevoProducto.descripcion = prod.descripcion;
  }

  cargarArchivoPdf(e: any, esGral: boolean = false): void {
    if (e.target.files.length) {
      if (esGral) {
        this.solicitud.archivoGral = e.target.files[0];
      } else {
        this.nuevoProducto.archivo = e.target.files[0];
      }
      Swal.fire({
        text: '¿Este archivo pdf contiene XML?',
        icon: 'question',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonColor: '#02a3b5',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then( value => {
        if (value.isConfirmed) {
          if (esGral) {
            $("#archivo-gral-xml").click();
          } else {
            $('#archivo-xml').click();
          }
        } else {
          if (!esGral) {
            this.agregarProducto();
          }
        }
      })
    }
  }

  cargarArchivoXml(e: any, esGral: boolean = false): void {
    if (e.target.files.length) {
      if (!e.target.files[0].name.endsWith('.xml')) {
        Swal.fire({
          icon: 'error',
          title: 'Debe ser un archivo xml',
          allowOutsideClick: false
        }).then(res => {
          $('#archivo-xml').val(null);
          $('#archivo-gral-xml').val(null);
          if (esGral) {
            $("#archivo-gral-xml").click();
          } else {
            $('#archivo-xml').click();
          }
          return;
        })
      } else {
        if (esGral) {
          this.solicitud.archivoGralXml = e.target.files[0];
        } else {
          this.nuevoProducto.archivoXml = e.target.files[0];
          this.leerXml();
        }
      }
    }
  }

  leerXml(): void {
    var reader = new FileReader();
    reader.readAsText(this.nuevoProducto.archivoXml!);
    reader.onloadend = () => {
      // console.log(reader.result);
      var parser = new DOMParser();
      var doc = parser.parseFromString( reader.result!.toString(), "application/xml");
      // console.log(doc.documentElement);
      // console.log(doc.documentElement.getAttribute("Total"));
      // console.log(doc.documentElement.getElementsByTagName("cfdi:Complemento")[0].getElementsByTagName("tfd:TimbreFiscalDigital")[0].getAttribute("UUID"));
      let uuid = doc.documentElement.getElementsByTagName("cfdi:Complemento")[0].getElementsByTagName("tfd:TimbreFiscalDigital")[0].getAttribute("UUID");
      let total = doc.documentElement.getAttribute("Total");
      if (total != null && parseFloat(total) != 0 && uuid != null) {
        this.nuevoProducto.precio = parseFloat(total);
        this.nuevoProducto.uuid = uuid;
        this.agregarProducto();
      }
    };

  }

  mostrarInputFile(): boolean {
    let prod = this.nuevoProducto;
    if (!prod.codigo.length || !prod.precio || !prod.cantidad) {
      return false;
    } else {
      return true;
    }
  }

  agregarProducto(): void {
    this.nuevoProducto.importe = this.nuevoProducto.cantidad * this.nuevoProducto.precio;
    this.solicitud.precioTotal = this.solicitud.precioTotal + this.nuevoProducto.precio;
    this.solicitud.importeTotal = this.solicitud.importeTotal + this.nuevoProducto.importe;

    if (this.esNuevo) {
      this.solicitud.productos.unshift(this.nuevoProducto);
      this.limpiarProductoNuevo();
    } else {
      this.nuevoProducto.idPedido = this.solicitud.idPedido?.toString();
      this.gastosService.postDetalleSolicitud(this.nuevoProducto).subscribe(res => {
        this.solicitud.productos.unshift(this.nuevoProducto);
        this.limpiarProductoNuevo();
        Swal.fire({
          icon: 'success',
          title: 'Actualizada correctamente.',
          allowOutsideClick: false,
          timer: 3000
        });
      }, err => {
        this.mostrarAlert('Intentalo nuevamente.');
        this.solicitud.precioTotal = this.solicitud.precioTotal - this.nuevoProducto.precio;
        this.solicitud.importeTotal = this.solicitud.importeTotal - this.nuevoProducto.importe;
        this.limpiarProductoNuevo();
      });
    }

  }

  limpiarProductoNuevo(): void {
    $('#producto option:eq(0)').prop('selected', true);
    $('#archivo-pdf').val(null);
    $('#archivo-xml').val(null);
    this.nuevoProducto = {
      codigo: '',
      descripcion: '',
      precio: 0,
      cantidad: 1,
      importe: 0,
    }
  }

  validarSolicitud(): boolean {
    let observaciones = this.solicitud.observaciones;
    let archivoGral = this.solicitud.archivoGral;
    let productos = this.solicitud.productos;

    if (!observaciones) {
      this.mostrarAlert('Agrega las observaciones');
      return false;
    }
    if (!archivoGral || archivoGral == null) {
      this.mostrarAlert('Agrega el Archivo General');
      return false;
    }
    if (productos.length == 0) {
      this.mostrarAlert('Agrega minimo un producto');
      return false;
    }
    return true;
  }

  guardarSolicitud(): void {
    this.mostrarAlertCarga();
    if (this.validarSolicitud()) {
      this.gastosService.postSolicitud(this.solicitud).subscribe(res => {
        if (res.actualizado) {
          let observables = [];
          for (const partida of this.solicitud.productos) {
            partida.idPedido = res.actualizado;
            observables.push(this.gastosService.postDetalleSolicitud(partida));
          }

          from(observables).pipe(
            concatMap((key) => key),
            map((item) => {
              return item;
            })
          ).pipe(toArray()
          ).subscribe(
            (val) => {
              Swal.fire({
                icon: 'success',
                title: 'Solicitud generada exitosamente. Id de la solicitud: ' + res.actualizado,
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  $("#nuevaSolicitudModal").modal('hide');
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/gastos']);
                  });
                }
              });
            },
            (err) => {
              Swal.fire({
                icon: 'warning',
                text: 'Ha ocurrido un error, intenta nuevamente',
              });
            }
          )
        }
      }, err => this.mostrarAlert('Vuelve a intentar'));
    }
  }

  eliminarPartida(idx: number): void {
    if (this.esNuevo) {
      Swal.showLoading();
      let producto = this.solicitud.productos[idx];
      this.solicitud.precioTotal = this.solicitud.precioTotal - producto.precio;
      this.solicitud.importeTotal = this.solicitud.importeTotal - producto.importe;
      this.solicitud.productos.splice(idx, 1);
      Swal.close();
    } else {
      Swal.fire({
        text: '¿Estas seguro de eliminar esta partida?',
        icon: 'question',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonColor: '#02a3b5',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then(value => {
        if (value.isConfirmed) {
          this.mostrarAlertCarga();
          let producto = this.solicitud.productos[idx];
          this.gastosService.deletePartida(producto.idDetalle!).subscribe(res => {
            this.solicitud.precioTotal = this.solicitud.precioTotal - producto.precio;
            this.solicitud.importeTotal = this.solicitud.importeTotal - producto.importe;
            this.solicitud.productos.splice(idx, 1);
            Swal.fire({
              icon: 'success',
              title: 'Actualizada correctamente.',
              allowOutsideClick: false,
            });
          });
        }
      })
    }
  }

  mostrarAlertCarga(text: string = 'Cargando...'): void {
    Swal.fire({
      allowOutsideClick: false,
      text: text
    });
    Swal.showLoading();
  }

  mostrarAlert(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

  limpiarModal(): void {
    $('#archivo-gral').val(null);
    $('#archivo-gral-xml').val(null);
    this.solicitud = {
      observaciones: '',
      productos: [],
      precioTotal: 0,
      importeTotal: 0
    }
    this.limpiarProductoNuevo();
  }

  zoom(amount: number) {
    this.zoomPdf += amount;
  }

  descargarArchivo(idRuta: number): void {
    this.mostrarAlertCarga();
    this.gastosService.getArchivo(idRuta).subscribe(res => {
      let file = new Blob([res], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      this.sourcePdf = fileURL;
      this.zoomPdf = 1;

      $('#verSolicitudModal').modal('hide');
      $('#previewPdfModal').modal('show');
      Swal.close();
    })
  }
}
