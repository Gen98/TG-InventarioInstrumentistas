import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Registro } from 'src/app/interfaces/registro.interface';
import Swal from 'sweetalert2';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements OnInit{

  dtOptions: DataTables.Settings = {};
  
  @Input() data: Registro[] = [];
  @Output() eliminarItem :EventEmitter<Registro> = new EventEmitter();

  constructor( private storageService: StorageService ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthMenu: [ 10, 20, 25, 50 ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      }
    };
  }

  eliminarRegistro( item: Registro ): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Deseas eliminar este registro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#02a3b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarItem.emit(item);
      }
    });
  }
}
