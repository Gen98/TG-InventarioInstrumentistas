import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-almacenes',
  templateUrl: './almacenes.component.html',
  styleUrls: ['./almacenes.component.css']
})
export class AlmacenesComponent implements OnInit {

  dtOptions: DataTables.Settings = {};

  constructor( ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      ajax: '../../../assets/files/almacenes.json',
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      order: [],
      columns: [
        {
          title: 'Código',
          data: 'value',
          className: 'text-center',
          width: '15%'
        },
        {
          title: 'Nombre',
          data: 'nombre'
        }
      ]
    };
  }
}
