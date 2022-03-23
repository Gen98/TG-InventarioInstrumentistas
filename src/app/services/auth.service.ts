import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioModel } from '../interfaces/usuario.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DexieSolicitudesService } from './dexie-solicitudes.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private cliente: string;

  constructor(private http: HttpClient, private router: Router, private dexieService: DexieSolicitudesService) {
    this.cliente = this.readToken();
  }

  /* Método que hace la solicitud al API para entrar en la aplicación
   Para el login, se pide un objeto de tupo UsuarioModel que contiene
   su username y password */
  login(usuario: UsuarioModel): Observable<any> {
    const urlEndpoint = 'https://inventario-bounes.truemedgroup.com:7004/security/oauth/token';
    const credenciales = btoa('tmapp' + ':' + 'Ag785.-4$795Tyui');

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales
    });

    let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);
    return this.http.post<any>(urlEndpoint, params.toString(), { headers: httpHeaders })
      .pipe(
        map(resp => {
          this.saveToken(resp['clienteId'], resp['expires_in'], resp['mostrarEncuesta']);
          return resp;
        })
      );
  }


  /* Método que se encarga de almacenar el token y la fecha de
   expiración del mismo en el localStorage*/
  saveToken(cliente: string, expiresIn: number, mostrarEnc: boolean): void {

    localStorage.setItem('showSurvey', mostrarEnc ? 'true' : 'false');
    this.cliente = cliente;
    localStorage.setItem('cliente', cliente);
    let date = new Date();
    date.setSeconds(expiresIn);
    localStorage.setItem('expiration', date.getTime().toString());
    this.cliente = this.readToken();
  }

  /* Método que se encarga de validar si ya hay un token existente
  e inicializa la variable local con el token o con una cadena vacia*/
  readToken(): string {

    let cliente = localStorage.getItem('cliente');
    this.cliente = cliente ? cliente : '';
    return this.cliente;
  }


  /* Método que verifica si hay un token existente y en caso que si lo haya,
  verifica que el mismo no haya expirado  */
  isAuth(): boolean {

    if (this.cliente.length < 2) {
      return false;
    }

    if (new Date(Number(localStorage.getItem('expiration')) - 310) <= new Date()) {
      return false;
    }

    return true;
  }

  /* Método que elimina el token y su fecha de expiración
  del localStorage */
  logout(): void {

    localStorage.removeItem('cliente');
    localStorage.removeItem('expiration');
    this.dexieService.clearDB();
    this.router.navigate(['login']);
  }

  mostrarEncuestas(): boolean {
    let showS = localStorage.getItem('showSurvey') || null;
    return showS && showS == 'true' ? true : false;
  }
}
