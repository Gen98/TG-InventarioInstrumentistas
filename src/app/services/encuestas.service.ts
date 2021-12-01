import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { EncuestaSatisfaccion } from '../interfaces/encuesta_satisfaccion';

@Injectable({
  providedIn: 'root'
})
export class EncuestasService {

  private endPoint: string = 'https://inventario-bounes.truemedgroup.com:7004/encuestas';

  constructor(private authService: AuthService, private http: HttpClient) { }

  enviarEncuesta(encuesta: EncuestaSatisfaccion, idCliente: number) {
    let formData: FormData = new FormData();

    formData.append("idProveedor", this.authService.readToken());
    formData.append("idCliente", idCliente.toString());
    formData.append("q1", encuesta.q1);
    formData.append("q2", encuesta.q2);
    formData.append("q3", encuesta.q3);
    formData.append("q4", encuesta.q4);
    formData.append("q5", encuesta.q5);
    formData.append("q6", encuesta.q6);
    formData.append("q7", encuesta.q7);
    encuesta.c1 ? formData.append("c1", encuesta.c1) : '';
    encuesta.c2 ? formData.append("c2", encuesta.c2) : '';
    encuesta.c3 ? formData.append("c3", encuesta.c3) : '';
    encuesta.c4 ? formData.append("c4", encuesta.c4) : '';
    encuesta.c5 ? formData.append("c5", encuesta.c5) : '';
    encuesta.c6 ? formData.append("c6", encuesta.c6) : '';
    formData.append("firma", encuesta.firma);
    formData.append("evidencia", encuesta.evidencia!);

    return this.http.post(this.endPoint, formData);
  }
}
