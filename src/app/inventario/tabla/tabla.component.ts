import { Component, Input, OnInit } from '@angular/core';
import { Registro } from 'src/app/interfaces/registro.interface';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements OnInit{

  dtOptions: DataTables.Settings = {};
  
  @Input() data: Registro[] = [];

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
}
