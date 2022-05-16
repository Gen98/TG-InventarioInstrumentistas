import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';

declare let window: any;

declare let $: any;

@Component({
  selector: 'app-escaner-movil',
  templateUrl: './escaner-movil.component.html',
  styleUrls: ['./escaner-movil.component.css']
})
export class EscanerMovilComponent implements OnInit {

  loaded: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX];
  camarasDispositivo: MediaDeviceInfo[] = [];
  camaraSeleccionada: MediaDeviceInfo | undefined;
  errors: WebcamInitError[] = [];
  private trigger: Subject<void> = new Subject<void>();
  @Input() escanerActivo: boolean = false;
  @Input() evidencias: boolean = false;
  @Input() mostrarCamara: boolean = false;
  @Input() esFolio: boolean = false;
  @Input() emitirEscaneos: boolean = true;
  @Output() codigoEscaneado: EventEmitter<string> = new EventEmitter();
  @Output() fotoTomada: EventEmitter<any> = new EventEmitter();

  @ViewChild('scanner', { static: false }) scanner: ZXingScannerComponent = new ZXingScannerComponent();

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const permissions = window.cordova.plugins.permissions;

    permissions.checkPermission('android.permission.CAMERA', (status: any) => {
      if (!status.hasPermission) {
        $("#camaraEvidenciasModal").modal('hide');
        $("#camaraModal").modal('hide');
        permissions.requestPermission('android.permission.CAMERA', (request: any) => {
          console.log('Success requesting CAMERA permission:', request);
        }, (error: any) => {
          console.log('Failed to set permission:', error);
        });
        this.scanner.askForPermission().then(permission => {
          console.log(permission);
          if (permission) {
            this.scanner.getAnyVideoDevice().then(devices => {
              console.log(devices);
            });
          }
        });
      }
    });
  }

  camarasEncontradas(e: MediaDeviceInfo[]): void {
    this.camarasDispositivo = e;
  }

  seleccionarCamara(e: any): void {
    this.loaded = false;
    let camara = this.camarasDispositivo.filter(function (el: MediaDeviceInfo) {
      return el.deviceId == e.target.value;
    });
    this.camaraSeleccionada = camara[0];
    setTimeout(() => {
      this.loaded = true;
    }, 2000);
  }

  scanSuccessHandler(e: any): void {
    // console.log(e);
    if (this.emitirEscaneos) {
      this.codigoEscaneado.emit(e);
    }
    if (this.esFolio) {
      this.loaded = false;
    }
  }

  camaraCambiada(e: any): void {
    setTimeout(() => {
      this.loaded = true;
    }, 2000);
  }

  tomarFoto(): void {
    this.triggerSnapshot();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  evidenciaTomada(e: WebcamImage): void {
    let imagen = {
      name: (Math.random() + 1).toString(36).substring(7),
      base64: e.imageAsDataUrl
    }
    this.fotoTomada.emit(imagen);
    $("#camaraEvidenciasModal").modal('hide');
  }

  handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    console.log(error)
    let message: string;
    if (error.message === 'Permission denied') {
      message = 'Por favor da acceso a la camara y reintenta'
    } else if (error.message == 'Could not start video source') {
      message = 'No se pudo iniciar video, es probable que otra app este utilizandola o que no cuentes con una'
    } else {
      message = error.message;
    }
    Swal.fire({
      icon: 'error',
      title: 'Un error a ocurrido',
      text: message,
      showConfirmButton: true,
      confirmButtonText: 'Reintentar',
      allowOutsideClick: false
    }).then(result => {
      if (result.isConfirmed) {
        $("#camaraEvidenciasModal").modal('hide');
      }
    });
  }

  handleZxingPermission(event: any) {
    console.log(event);
    setTimeout(() => {
      this.loaded = true;
    }, 2000);
    // if (event) {
    //   setTimeout(() => {
    //     this.loaded = true;
    //   }, 2000);
    // } else {
    //   if (!event) {
    //     Swal.fire({
    //       icon: 'info',
    //       title: 'La aplicacion necesita acceder a tu camara, dirigete a la informacion de esta aplicacion y concede los permisos.',
    //       showConfirmButton: true,
    //       confirmButtonText: 'Reintentar',
    //       allowOutsideClick: false
    //     }).then(result => {
    //       if (result.isConfirmed) {
    //         $("#camaraModal").modal('hide');
    //       }
    //     });
    //   } else if (!event) {
    //     this.scanner.askForPermission();
    //   }
    // }
  }
}
