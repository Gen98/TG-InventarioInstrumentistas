import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteDistribuidor } from '../interfaces/cliente_distribuidor.interface';
import { ListaPrecio } from '../interfaces/lista_precio.interface';
import { Solicitud } from '../interfaces/solicitud.interface';
import { ProductoPartida } from '../interfaces/producto_partida.interface';
import { InformacionCotizar } from '../interfaces/informacion_cotizar.interface';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {

  private endPoint: string = '';
  private cliente: string;

  constructor(private http: HttpClient) { 
    this.cliente = this.readToken();
    this.endPoint = 'https://inventario-bounes.truemedgroup.com:7004/solicitudes'
  }

  readToken(): string{
    let cliente = localStorage.getItem('cliente');
    return  cliente ? cliente : '';
  }

  getXAtender() {
    this.cliente = this.readToken();
    let url = this.endPoint + `/xAtender/${this.cliente}`;
    return this.http.get(url);
  }

  showXAtender(idSolicitud: number): Observable<Solicitud> {
    let url = this.endPoint + `/xAtender/show/${idSolicitud}`;
    return this.http.get<Solicitud>(url);
  }

  downloadPDF(idRutaImagen: number): Observable<any> {
    let url = this.endPoint + `/pdf/${idRutaImagen}`;
    const requestOptions: Object = {
        responseType: 'arrayBuffer'
    }
    return this.http.get(url, requestOptions );
  }

  getProveedores(): Observable<ClienteDistribuidor[]> {
    this.cliente = this.readToken();
    let url = this.endPoint + `/proveedor/${this.cliente}`;

    return this.http.get<ClienteDistribuidor[]>(url);
  }

  getClientes(proveedor: number): Observable<ClienteDistribuidor[]> {
    let url = this.endPoint + `/clientes/${proveedor}`;

    return this.http.get<ClienteDistribuidor[]>(url);
  }

  getListas(cliente: number): Observable<ListaPrecio[]> {
    let url = this.endPoint + `/listas/${cliente}`;

    return this.http.get<ListaPrecio[]>(url);
  }

  getCodigosPartidas(idLista: number): Observable<string[]> {
    let url = this.endPoint + `/listas/cPartidas/${idLista}`;

    return this.http.get<string[]>(url);
  }

  getProductosPartidas(idLista: number, cPartida: string): Observable<ProductoPartida[]> {
    let url = this.endPoint + `/listas/productos/${idLista}/${cPartida}`;

    return this.http.get<ProductoPartida[]>(url);
  }

  storeSolicitud(solicitud: Solicitud): Observable<any> {
    let url = this.endPoint;

    const formData: FormData = new FormData();

    formData.append('file', solicitud.solicitudPDF);
    formData.append('idProveedor',solicitud.idProveedor.toString());
    formData.append('idUsuarioGenera', solicitud.idUsuarioGenera.toString());
    formData.append('idCliente', solicitud.idCliente.toString());
    formData.append('noContrato', solicitud.noContrato);
    formData.append('noFianza', solicitud.noFianza);
    formData.append('noProveedor', solicitud.noProveedor);
    formData.append('paciente', solicitud.paciente);
    formData.append('nss', solicitud.nss);
    formData.append('fechaReq', solicitud.fechaReq!);
    formData.append('fechaCirugia', solicitud.fechaCirugia!);
    formData.append('nombreDoctor', solicitud.nombreDoctor);
    formData.append('observacionesPrefactura', solicitud.observacionesPrefactura);
    formData.append('folioConsumo', solicitud.folioConsumo);

    return this.http.post<any>(url, formData);
  }

  updateSolicitud(solicitud: Solicitud): Observable<any> {
    let url = this.endPoint;

    const formData: FormData = new FormData();
    formData.append('file', solicitud.solicitudPDF ? solicitud.solicitudPDF : null);
    formData.append('id', solicitud.id!.toString());
    formData.append('idProveedor',solicitud.idProveedor.toString());
    formData.append('idUsuarioGenera', solicitud.idUsuarioGenera.toString());
    formData.append('fechaEmision', solicitud.fechaEmision!);
    formData.append('estatus', solicitud.estatus!);
    formData.append('idCliente', solicitud.idCliente.toString());
    formData.append('idSolicitudPDF', solicitud.idSolicitudPDF!);
    formData.append('noContrato', solicitud.noContrato);
    formData.append('noFianza', solicitud.noFianza);
    formData.append('noProveedor', solicitud.noProveedor);
    formData.append('paciente', solicitud.paciente);
    formData.append('nss', solicitud.nss);
    formData.append('fechaReq', solicitud.fechaReq!);
    formData.append('fechaCirugia', solicitud.fechaCirugia!);
    formData.append('nombreDoctor', solicitud.nombreDoctor);
    formData.append('observacionesPrefactura', solicitud.observacionesPrefactura);
    formData.append('folioConsumo', solicitud.folioConsumo);

    return this.http.put<any>(url, formData);
  }
}
