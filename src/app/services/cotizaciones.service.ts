import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InformacionCotizar } from '../interfaces/informacion_cotizar.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {

  private endPoint: string = environment.api + 'cotizaciones';

  constructor(private http: HttpClient) {

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
    formData.append('archivoConsumo2', data.request.hojaConsumo2);
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

  validarRegistroSeguimiento(idSolicitud: string, idLista: string): Observable<any> {
    let url = this.endPoint + '/validarSeguimiento';
    const formData: FormData = new FormData();

    formData.append('idSolicitud', idSolicitud);
    formData.append('idLista', idLista);

    return this.http.post<any>(url, formData)
  }

  validarTurcos(json: any): Observable<any>{
    let url = 'https://bounes.truemedgroup.com/api/imagen_consumo';
    // let url = 'http://localhost:8000/api/imagen_consumo';
    const formData: FormData = new FormData();
    
    formData.append('access_key', json.access_key);
    formData.append('id', json.id);
    formData.append('archivo', json.archivo.split('base64,')[1]);
    formData.append('nombre_archivo', json.nombre_archivo);
    formData.append('carpeta', json.carpeta);

    return this.http.post<any>(url, formData);
  }
}
