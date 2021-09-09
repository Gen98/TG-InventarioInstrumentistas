import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-escaner-movil',
  templateUrl: './escaner-movil.component.html',
  styleUrls: ['./escaner-movil.component.css']
})
export class EscanerMovilComponent implements OnInit {

  allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX ];
  camarasDispositivo: MediaDeviceInfo[] = [];
  camaraSeleccionada: MediaDeviceInfo | undefined;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  @Input() escanerActivo: boolean = false;
  @Input() evidencias: boolean = false;
  @Input()mostrarCamara: boolean = false;
  @Output() codigoEscaneado: EventEmitter<string> = new EventEmitter();
  @Output() fotoTomada: EventEmitter<any> = new EventEmitter();
  
  @ViewChild('scanner', { static: false }) scanner: ZXingScannerComponent = new ZXingScannerComponent();

  constructor() { }

  ngOnInit(): void {
  }

  // ngAfterViewInit(): void {
  //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //   //Add 'implements AfterViewInit' to the class.
  //   this.scanner.askForPermission().then(permission => {
  //     console.log(permission);
  //     if (permission) {
  //       this.scanner.getAnyVideoDevice().then(devices => {
  //         console.log(devices);
  //       });
  //     }
  //   });
  // }

  camarasEncontradas(e: MediaDeviceInfo[]): void {
    this.camarasDispositivo = e;
  }

  seleccionarCamara(e:any): void {
    let camara = this.camarasDispositivo.filter(function(el:MediaDeviceInfo) {
      return el.deviceId == e.target.value;
    });
    this.camaraSeleccionada = camara[0];
  }

  scanSuccessHandler(e:any): void {
    console.log(e);
    this.codigoEscaneado.emit(e);
  }

  scanErrorHandler(e:any): void {
    console.log(e);
  }

  scanFailureHandler(e:any): void {
    // console.log(e);
  }

  scanCompleteHandler(e:any): void {
    // console.log(e);
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

  evidenciaTomada(e:WebcamImage): void {
    let imagen = {
      name: (Math.random() + 1).toString(36).substring(7),
      base64: e.imageAsDataUrl
    }
    this.fotoTomada.emit(imagen);
  }
}
