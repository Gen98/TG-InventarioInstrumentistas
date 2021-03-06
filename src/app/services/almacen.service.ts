import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {

  constructor( private http: HttpClient ) { }

  sincronizar(): Observable<any> {
    return this.http.get<Observable<any>>('https://inventario-bounes.truemedgroup.com:7004/movimientos/almacenes');
  }
}
