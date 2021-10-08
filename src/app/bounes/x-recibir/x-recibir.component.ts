import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { XRecibir } from 'src/app/interfaces/x-recibir.interface';
import Swal from 'sweetalert2';
import { BounesService } from '../../services/bounes.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-x-recibir',
  templateUrl: './x-recibir.component.html',
  styleUrls: ['./x-recibir.component.css']
})
export class XRecibirComponent implements OnInit {

  @ViewChild(DataTableDirective, {static: false}) dtElement: DataTableDirective|any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  data: XRecibir[] = [];
  isFromScimpla: boolean = true;

  constructor( private bounesService: BounesService, private router: Router ) { }

  ngOnInit(): void {
    this.loadData();
    this.dtOptions = {
      lengthMenu: [ 10, 20, 25, 50 ],
      responsive: true,
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      columnDefs: [
        { "width": "5%", "targets": 0 },
        { "width": "5%", "targets": 1 },
        { "width": "10%", "targets": 2 }
      ]
    };
  }

  loadData(): void {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Cargando'
    });
    Swal.showLoading();
    this.bounesService.ConsultarMxRecibir(this.isFromScimpla).subscribe( resp => {
      this.esconderColumna();
      setTimeout(() => {
        this.data = resp;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
        Swal.close();
      }, 1000);
    }, err => {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Servicio no disponible por el momento, intentalo más tarde.',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['']).then( () => {
            window.location.reload();
          });
        }
      });
    });
  }

  cambiarTab(tab: boolean): void {
    this.isFromScimpla = tab;
    this.loadData();
  }

  esconderColumna(): void {
    if (!this.isFromScimpla) {
      this.dtOptions = {
        lengthMenu: [ 10, 20, 25, 50 ],
        responsive: true,
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
        },
        columnDefs: [
          { "width": "5%", "targets": 0, "visible": false },
          { "width": "5%", "targets": 1 },
          { "width": "10%", "targets": 2 }
        ]
      };
    } else {
      this.dtOptions = {
        lengthMenu: [ 10, 20, 25, 50 ],
        responsive: true,
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
        },
        columnDefs: [
          { "width": "5%", "targets": 0 },
          { "width": "5%", "targets": 1 },
          { "width": "10%", "targets": 2 }
        ]
      };
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
