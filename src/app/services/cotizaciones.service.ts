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
    this.endPoint = 'https://inventario-bounes.truemedgroup.com:7004/cotizaciones'
  }

  getInformacionCotizar(idCliente: number): Observable<InformacionCotizar> {
    let url = this.endPoint + `/info/${idCliente}`;

    return this.http.get<InformacionCotizar>(url);
  }

  storeCotizacion(data: any): Observable<any> {
    let url = this.endPoint;
    const formData: FormData = new FormData();

    formData.append('clienteId', data.informacion.idCliente!.toString());
    formData.append('metodoPago', data.request.formaPago);
    formData.append('tipoPago', data.request.tipoPago.toString());
    formData.append('numeroCta', data.request.noCuenta);
    formData.append('direccionEnvio', data.request.direccionEnvio);
    formData.append('usoCFDI', data.request.cfdi);
    formData.append('idLista', data.informacion.idLista!.toString());
    formData.append('archivoSolicitud', data.informacion.archivoSolicitud);
    formData.append('archivoConsumo', data.request.hojaConsumo);
    formData.append('subTotal', data.subtotal.toString());
    formData.append('iva', data.iva.toString());
    formData.append('total', data.total.toString());
    formData.append('pedido', data.pedido);
    formData.append('idSolicitud', data.informacion.idSolicitud!.toString());

    let idAsociado = localStorage.getItem('cliente');
    if (!idAsociado) {
      url = 'inexistente';
    }
    formData.append('idAsociado', idAsociado!);
    return this.http.post<any>(url, formData);
  }
}
