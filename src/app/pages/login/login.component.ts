import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { UsuarioModel } from 'src/app/interfaces/usuario.interface';
import { DexieSolicitudesService } from '../../services/dexie-solicitudes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  usuario: UsuarioModel;
  authSuscription: Subscription;
  tipoBotonPassword: string = 'password';

  constructor(
    private authService: AuthService,
    private solicitudService: SolicitudesService,
    private dexieSolicitudService: DexieSolicitudesService,
    private router: Router
  ) {
    this.usuario = {
      username: '',
      password: ''
    };
    this.authSuscription = new Subscription();
  }

  ngOnInit(): void {
    if (this.authService.isAuth()) {
      this.router.navigate(['']);
    }
  }

  onLogin(): void {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Validando información'
    });
    Swal.showLoading();

    this.authSuscription = this.authService.login(this.usuario)
      .subscribe(response => {
        if (response.status == 200) {
          Swal.fire({
            allowOutsideClick: false,
            text: 'Acceso correcto, cargando...'
          });
          Swal.showLoading();
          this.getOfflineData();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Usuario o contraseña incorrectos'
          });
        }
      }, (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Conexión inestable, intenta nuevamente.'
        });
      });
  }

  cambiarInputPassword(): void {

    if (this.tipoBotonPassword === 'password')
      this.tipoBotonPassword = 'text';

    else
      this.tipoBotonPassword = 'password';

  }

  getOfflineData(): void {
    this.solicitudService.getOfflineData().subscribe((res: any) => {
      this.dexieSolicitudService.clearDB().then(async () => {
        this.guardarClasificaciones(res);
      }).then(async () => {
        this.guardarProveedores(res);
      }).then(async () => {
        this.guardarSolicitudesList(res);
        this.guardarSolicitudesShow(res);
      }).then(async () => {
        Swal.fire({
          icon: 'success',
          text: 'Bienvenido ' + res.proveedores[0].nombre,
          showConfirmButton: false,
          timer: 2000
        }).then((result) => {
          this.router.navigate(['inicio']);
        });
      });
    }, err => {
      this.authService.logout();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error almacenando offline Data.'
      });
    });
  }

  guardarClasificaciones(res: any) {
    res.clasificacionesCirugia.forEach((el: any) => {
      let clas = {
        id: el.id,
        nombre: el.nombre,
        subclasificaciones: el.subclasificaciones
      }
      this.dexieSolicitudService.addClasificacion(clas);
    });
  }

  guardarProveedores(res: any) {
    res.proveedores.forEach((el: any) => {
      let prov = {
        id: el.id,
        nombre: el.nombre,
        clientes: el.clientes
      }
      this.dexieSolicitudService.addProveedor(prov);
    });
  }

  guardarSolicitudesList(res: any) {
    res.solicitudesList.forEach((solicitud: any) => {
      this.dexieSolicitudService.addSolicitudList(solicitud);
    });
  }

  guardarSolicitudesShow(res: any) {
    res.solicitudesShow.forEach((solicitud: any) => {
      this.dexieSolicitudService.addSolicitudShow(solicitud);
    });
  }
}