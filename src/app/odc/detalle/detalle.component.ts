import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {

  @Input() pedido: any[] = [];
  @Input() totales: any;

  constructor() { }

  ngOnInit(): void {
  }

  click() {
    document.getElementById("refreshInfo")!.click();
  }
}
