import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
  
    // if (file) {
      var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let imagen = {
            name: file.name,
            base64: reader.result
          }
          this.agregarImagen.emit(imagen);
        };
      // this.uploadService.upload(file).subscribe(
      //   (event: any) => {
      //     if (event.type === HttpEventType.UploadProgress) {
      //       this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
      //     } else if (event instanceof HttpResponse) {
      //       const msg = 'Uploaded the file successfully: ' + file.name;
      //       this.message.push(msg);
      //       this.fileInfos = this.uploadService.getFiles();
      //     }
      //   },
      //   (err: any) => {
      //     this.progressInfos[idx].value = 0;
      //     const msg = 'Could not upload the file: ' + file.name;
      //     this.message.push(msg);
      //     this.fileInfos = this.uploadService.getFiles();
      //   });
    // }
  }

  eliminarImagen(imagen: any): void {
    this.quitarImagen.emit(imagen);
  }
}
