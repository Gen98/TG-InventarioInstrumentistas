import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {

  dtOptions: DataTables.Settings = {};

  constructor( ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      ajax: '../../../assets/files/data.json',
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      order: [],
      columns: [
        {
          title: 'Código',
          data: 'Codigo',
          className: 'text-center',
          width: '15%'
        },
        {
          title: 'Descripción',
          data: 'Descripcion'
        },
      ]
    };
  }
}
