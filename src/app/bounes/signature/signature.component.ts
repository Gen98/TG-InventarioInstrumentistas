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

  signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 5,
    canvasWidth: 500,
    canvasHeight: 200,
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
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
}

