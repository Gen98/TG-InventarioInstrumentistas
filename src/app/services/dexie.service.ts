import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../interfaces/movimiento.interface';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DexieService {

  db: any;
  table: Dexie.Table<any>|any;
  tableSincronizados: Dexie.Table<any>|any;
  constructor(private http: HttpClient) { 
    this.initIndexedDB();
  }

  private initIndexedDB() {
    this.db = new Dexie('Inventario');
    this.db.version(1).stores({
      movimientos: '++idIndexed, almacen, registros, fechaCreacion, imagenes, firmas, tipoEntrada, comentario, folio',
      sincronizados: '++idIndexed, almacen, registros, fechaCreacion, fechaSincronizacion, imagenes, firmas, tipoEntrada, comentario, folio'
    });
    this.db.open().catch((err: any) => {
      console.log(err.stack || err);
    });

    this.table = this.db.table('movimientos');
    this.tableSincronizados = this.db.table('sincronizados');
  }

  async getMovimientos() {
    return await this.table.toArray();
  }

  async getSincronizados() {
    return await this.tableSincronizados.toArray();
  }

  async addMovimiento(movimiento: Movimiento) {
    try {
      movimiento.fechaCreacion = Date.now();
      await this.table.add(movimiento);
    } catch (error) {
      console.log('error');
    }
  }

  async updateMovimiento(movimiento: Movimiento) {
    try {
      await this.table.update(movimiento.idIndexed, { 'comentario': movimiento.comentario});
    } catch (error) {
      console.log(error);
    }
  }

  async deleteMovimiento(movimiento: Movimiento) {
    try {
      await this.table.delete(movimiento.idIndexed);
    } catch (error) {
      console.log(error);
    }
  }

  async sincronizarMovimientos(): Promise<Observable<any>> {
    let movimientos = await this.getMovimientos();
    movimientos = movimientos.sort(function(a: Movimiento, b: Movimiento){
      return (a.tipoEntrada === b.tipoEntrada)? 0 : a.tipoEntrada? -1 : 1; ;
    });
    return this.http.post<Observable<any>>('https://inventario-bounes.truemedgroup.com:7004/movimientos', movimientos);
  }

  async addSincronizado(sincronizado: any) {
    try {
      await this.tableSincronizados.add(sincronizado);
    } catch (error) {
      console.log('error');
    }
  }

  async deleteMovimientos() {
    await this.db.movimientos.clear();
  }

  async deleteSincronizados() {
    await this.db.sincronizados.clear();
  }
}
