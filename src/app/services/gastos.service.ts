import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, Solicitud } from '../interfaces/gastos.interface';

@Injectable({
  providedIn: 'root'
})
export class GastosService {

  private endPoint: string = environment.api + 'gastos';
  private cliente: string;

  constructor(private http: HttpClient) {
    this.cliente = this.readToken();
  }

  readToken(): string {
    let cliente = localStorage.getItem('cliente');
    return cliente ? cliente : '';
  }

  getXAutorizarDataTables(dataTablesParameters: any): Observable<any> {
    this.cliente = this.readToken();
    let url = this.endPoint + `/${this.cliente}/datatables`;
    return this.http.post<any>(url, dataTablesParameters);
  }

  getProductos(): Observable<any[]> {
    this.cliente = this.readToken();
    let url = this.endPoint + `/${this.cliente}/productos`;
    return this.http.get<any>(url);
  }

  postSolicitud(solicitud: Solicitud): Observable<any> {
    this.cliente = this.readToken();
    let url = this.endPoint + `/solicitud`;

    const formData: FormData = new FormData();

    formData.append('observaciones', solicitud.observaciones);
    formData.append('archivoGral', solicitud.archivoGral!);
    formData.append('archivoGralXml', solicitud.archivoGralXml ? solicitud.archivoGralXml : '');
    formData.append('proveedor', this.cliente);

    return this.http.post<any>(url, formData);
  }

  postDetalleSolicitud(producto: Producto): Observable<any> {
    this.cliente = this.readToken();
    let url = this.endPoint + `/solicitud/detalle`;

    const formData: FormData = new FormData();

    formData.append('idPedido', producto.idPedido!.toString());
    formData.append('codigo', producto.codigo);
    formData.append('descripcion', producto.descripcion);
    formData.append('precio', producto.precio.toString());
    formData.append('cantidad', producto.cantidad.toString());
    formData.append('importe', producto.importe.toString());
    formData.append('archivo', producto.archivo!);
    formData.append('archivoXml',  producto.archivoXml ? producto.archivoXml : '');
    formData.append('uuid', producto.uuid ? producto.uuid : '');
    formData.append('proveedor', this.cliente);

    return this.http.post<any>(url, formData);
  }

  getSolicitud(idPedido: number): Observable<any> {
    let url = this.endPoint + `/solicitud/${idPedido}`;
    return this.http.get<any>(url);
  }

  deletePartida(idDetalle: number): Observable<any> {
    let url = this.endPoint + `/detalle/${idDetalle}`;
    return this.http.delete<any>(url);
  }

  getArchivo(idRuta: number): Observable<any> {
    let url = this.endPoint + `/archivo/${idRuta}`;
    const requestOptions: Object = {
      responseType: 'arrayBuffer'
    }
    return this.http.get<any>(url, requestOptions);
  }

  cancelarSolicitud(idPedido: number): Observable<any> {
    let url = this.endPoint + `/solicitud/${idPedido}`;
    return this.http.delete<any>(url);
  }
}
