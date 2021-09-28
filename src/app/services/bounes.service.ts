import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { XRecibir } from '../interfaces/x-recibir.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BounesService {

  constructor(private http: HttpClient) { }

  ConsultarMxRecibir(isFromScimpla: boolean): Observable<XRecibir[]> {
    let param = isFromScimpla ? 'scimpla' : 'bounes';
    let endpoint = `https://inventario-bounes.truemedgroup.com:7004/movimientos/pending/${param}`
    return this.http.get<XRecibir[]>(endpoint);
  }
}
