import { Component, OnInit } from '@angular/core';
import { AlmacenService } from '../../services/almacen.service';

@Component({
  selector: 'app-almacenes',
  templateUrl: './almacenes.component.html',
  styleUrls: ['./almacenes.component.css']
})
export class AlmacenesComponent implements OnInit {

  dtOptions: DataTables.Settings = {};

  constructor(private almacenService: AlmacenService) { }

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
  
  sincronizar(): void {
    this.almacenService.sincronizar().subscribe(res => {
      console.log(res);
    });
  }

}
