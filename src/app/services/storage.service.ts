import { Injectable } from '@angular/core';
import { Registro } from '../interfaces/registro.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getItems():Registro[]{
    return JSON.parse(localStorage.getItem('inventariado')!) || [];
  }

  addItem( item: Registro ) {
    let storage: Registro[] = this.getItems();
    let duplicado = storage.findIndex(function(e) {
      return e.code == item.code && e.lote == item.lote
    });
    if (duplicado != -1) {
      storage[duplicado].cant = storage[duplicado].cant + item.cant;
    } else {
      storage.push(item);
    }
    localStorage.setItem('inventariado', JSON.stringify(storage))
  }

  deleteItems(): void {
    localStorage.removeItem('inventariado');
  }

  verificarLimiteRegistros(): boolean {
    let total = this.getItems();
    if (total.length <= 30) return true;
    return false;
  }  
}
