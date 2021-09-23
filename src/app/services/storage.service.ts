import { Injectable } from '@angular/core';
import { Registro } from '../interfaces/registro.interface';
import { Movimiento } from '../interfaces/movimiento.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private http: HttpClient) { }

  getItems():Registro[]{
    return JSON.parse(localStorage.getItem('inventariado')!) || [];
  }

  getMovimientos(): Movimiento[] {
    return JSON.parse(localStorage.getItem('movimientos')!) || [];
  }

  getSincronizados(): any[] {
    return JSON.parse(localStorage.getItem('sincronizados')!) || [];
  }

  addItem( item: Registro ) {
    let storage: Registro[] = this.getItems();
    let duplicado = storage.findIndex(function(e) {
      return e.code == item.code && e.lote == item.lote
    });
    if (duplicado != -1) {
      storage[duplicado].cant = Number(storage[duplicado].cant) + item.cant;
      let actualizado = storage[duplicado];
      storage = storage.filter(function(el) {
        return !(el.lote === item.lote && el.code === item.code);
      });
      storage.unshift(actualizado);
    } else {
      storage.unshift(item);
    }
    localStorage.setItem('inventariado', JSON.stringify(storage))
  }

  addMovimiento(movimiento: Movimiento): void {
    movimiento.fechaCreacion = Date.now();
    let movimientos: Movimiento[] = this.getMovimientos();
    movimientos.unshift(movimiento);
    localStorage.removeItem('movimientos');
    localStorage.setItem('movimientos', JSON.stringify(movimientos));
  }

  updateMovimiento(movimiento: Movimiento): boolean {

    let movimientos: Movimiento[] = this.getMovimientos();
    let response: boolean = false;
    if (movimientos[movimiento.index!].folio != movimiento.folio || movimientos[movimiento.index!].comentario != movimiento.comentario) {
      movimientos[movimiento.index!].folio = movimiento.folio;
      movimientos[movimiento.index!].comentario = movimiento.comentario;
  
      localStorage.setItem('movimientos', JSON.stringify(movimientos));
      response = true;
    }
    return response;
  }

  sincronizarMovimientos(): Observable<any> {
    let movimientos = this.getMovimientos();
    movimientos = movimientos.sort(function(a,b){
      return (a.tipoEntrada === b.tipoEntrada)? 0 : a.tipoEntrada? -1 : 1; ;
    });
    return this.http.post<Observable<any>>('https://inventario-bounes.truemedgroup.com:7004/movimientos', movimientos);
  }

  addSincronizado(sincronizado: any): void {
    let movimientos = this.getSincronizados();
    movimientos.unshift(sincronizado);
    localStorage.setItem('sincronizados', JSON.stringify(movimientos));
  }

  deleteMovimientos(): void {
    localStorage.removeItem('movimientos');
  }

  deleteSincronizados(): void {
    localStorage.removeItem('sincronizados');
  }

  deleteItems(isBounes: boolean = false): void {
    localStorage.removeItem('inventariado');
  }

  deleteItem( item: Registro ): void{
    let storage: Registro[] = this.getItems();

    let index = storage.findIndex(function(e) {
      return e.code == item.code && e.lote == item.lote
    });

    if (storage[index].cant - item.cant <= 0 || item.cant == 0) {
      storage = storage.filter(function(el) {
        return !(el.lote === item.lote && el.code === item.code);
      });
    } else {
      storage[index].cant = item.cant;
    }
    localStorage.setItem('inventariado', JSON.stringify(storage))
  }

  deleteMovimiento(movimiento: Movimiento): void {
    let movimientos = this.getMovimientos();
    movimientos = movimientos.filter(function(el, i) {
      return i != movimiento.index;
    });
    localStorage.setItem('movimientos', JSON.stringify(movimientos))
  }

  verificarLimiteRegistros(): boolean {
    let total = this.getItems();
    if (total.length <= 199) return true;
    return false;
  }  
}
