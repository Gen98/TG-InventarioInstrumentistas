import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Almacen } from '../interfaces/almacen.interface';
import Dexie from 'dexie';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlmacenesService {

  db: any;
  tableAlmacenes: Dexie.Table<Almacen> | any;

  constructor(private http: HttpClient) {
    this.initIndexedDB();
  }

  initIndexedDB() {
    this.db = new Dexie('Warehouses');
    this.db.version(1).stores({
      almacenes: '++idIndexed, id, codigo, nombre',
    });

    this.db.open().catch((err: any) => {
      console.log(err.stack || err);
    });

    this.tableAlmacenes = this.db.table('almacenes');
  }

  getAlmacenes() {
    return this.tableAlmacenes.toArray().then(async (table: any) => {
      return table;
    });
  }

  sincronizar(): Observable<Almacen[]> {
    let idProveedor = localStorage.getItem('clienteAlmacenes') || '0';

    return this.http.get<Observable<any>>('https://inventario-bounes.truemedgroup.com:7004/movimientos/almacenes/' + idProveedor)
      .pipe(
        map(resp => {
          let newArray: any[] = [];
          resp.forEach(almacen => {
            newArray.push({
              codigo: almacen.idSync,
              nombre: almacen.nombre
            });
          });
          return newArray;
        })
      );
  }

  async clearDB() {
    this.db.close();
    await Dexie.delete('Warehouses');
  }

  async addAlmacen(item: any) {
    this.initIndexedDB();
    try {
      await this.tableAlmacenes.add(item);
    } catch (error) {
      console.log('error');
    }
  }

}
