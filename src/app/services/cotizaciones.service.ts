import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InformacionCotizar } from '../interfaces/informacion_cotizar.interface';

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {
  
  private endPoint: string = '';

  constructor(private http: HttpClient) { 
    this.endPoint = 'http://localhost:8084/cotizaciones'
  }

  getInformacionCotizar(idCliente: number): Observable<InformacionCotizar> {
    let url = this.endPoint + `/info/${idCliente}`;

    return this.http.get<InformacionCotizar>(url);
  }

  storeCotizacion(data: FormData): Observable<any> {
    let url = this.endPoint;
    let idAsociado = localStorage.getItem('cliente');
    if (!idAsociado) {
      url = 'inexistente';
    }
    data.append('idAsociado', idAsociado!);
    return this.http.post<any>(url, data);
  }
}
