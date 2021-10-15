import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-add-images',
  templateUrl: './add-images.component.html',
  styleUrls: ['./add-images.component.css']
})
export class AddImagesComponent implements OnInit {

  selectedFiles?: FileList;
  imgSelect: string = '';
  @Input() archivosSubidos: any[] = [];
  @Input() soloVisualizar: boolean = false;
  @Output() agregarImagen: EventEmitter<any> = new EventEmitter();
  @Output() quitarImagen: EventEmitter<any> = new EventEmitter();

  constructor( ) { }

  ngOnInit(): void {
  }

  visualizarImagen(base64: string): void {
    this.imgSelect = base64;
    $("#visualizarImagenModal").modal("show");
  }

  seleccionarArchivos(event:any): void {
    this.selectedFiles = event.target.files;
  }

  guardarImagenes(): void {
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
    $("#multiplefile").val('');
  }

  upload(idx: number, file: File): void {
  
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let imagen = {
        name: file.name,
        base64: reader.result
      }
      this.agregarImagen.emit(imagen);
    };
  }

  eliminarImagen(imagen: any): void {
    this.quitarImagen.emit(imagen);
  }
}
