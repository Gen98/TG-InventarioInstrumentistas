import { Component, Input, OnInit } from '@angular/core';
import { Movimiento } from '../../interfaces/movimiento.interface';
import { Registro } from 'src/app/interfaces/registro.interface';
import almacenesJSON from '../../../assets/files/almacenes.json';
import data from '../../../assets/files/data.json';

@Component({
  selector: 'app-sincronizados',
  templateUrl: './sincronizados.component.html',
  styleUrls: ['./sincronizados.component.css']
})
export class SincronizadosComponent implements OnInit {

  sincronizado: Movimiento = {
    folio: '',
    almacen: 0,
    registros: [],
    fechaCreacion: 0,
    imagenes: [],
    firmas: [],
    tipoEntrada: true
  };
  almacenes: any;
  private innerWidth: number;

  @Input() movimientos: any[] = [];

  constructor() { 
    this.innerWidth = window.innerWidth;
    this.almacenes = almacenesJSON.data;
  }

  ngOnInit(): void {
  }

  movil(): boolean{
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent))
      return true;

    return this.innerWidth < 768;
  }

  detallesMovimiento(movimiento: Movimiento): void {
    this.sincronizado = movimiento;
    let productos = this.sincronizado.registros;
    productos.forEach((registro: Registro) => {
      let producto = data.data.find((e: any) => e.Codigo == registro.code);
      registro.desc = producto!.Descripcion||'NA';
    });
    document.getElementById("openSincronizadoModal")!.click();
  }
}
