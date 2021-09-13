import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css']
})
export class SignatureComponent implements OnInit {

  firmas: any[] = [];
  @ViewChild('signature') signaturePad!: SignaturePadComponent;
  @Output() base64: EventEmitter<string[]> = new EventEmitter();
  @Input() limpiar: boolean = false;

  signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
    minWidth: 5,
    canvasWidth: 500,
    canvasHeight: 200,
    // backgroundColor: 'rgba(218, 214, 214, 0.5)',
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes.limpiar && changes.limpiar.currentValue) {
      this.signaturePad.clear();
    }
    
  }

  drawComplete(event: MouseEvent | Touch) {
    this.firmas = [];
    let firma = {
      base64: this.signaturePad.toDataURL()
    };
    this.firmas.unshift(firma);
    this.base64.emit(this.firmas);
  }

  limpiarFirma(): void {
    this.firmas = [];
    this.base64.emit(this.firmas);
    this.signaturePad.clear();
  }

  agregarFirma(): void {
    this.signaturePad.clear();
  }
}

