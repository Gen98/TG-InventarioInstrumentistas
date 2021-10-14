import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { UsuarioModel } from 'src/app/interfaces/usuario.interface';
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

  constructor(private authService: AuthService, private router: Router) { 
    this.usuario = {
      username: '',
      password: ''
    };
    this.authSuscription = new Subscription();
  }

  ngOnInit(): void {
    if ( this.authService.isAuth() ){
      this.router.navigate(['']);
    }
  }

  onLogin( ): void{
    Swal.fire({
      allowOutsideClick: false,
      text: 'Validando información'
    });
    Swal.showLoading();

    this.authSuscription = this.authService.login( this.usuario )
    .subscribe(response => {
      if (response.status == 200) {
        Swal.fire({
          icon: 'success',
          text: 'Acceso Correcto',
          showConfirmButton: false,
          timer: 1500
        }).then((result) => {
          this.router.navigate([ 'inicio' ]);
        });
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

  cambiarInputPassword():void{
  
    if ( this.tipoBotonPassword === 'password' )
      this.tipoBotonPassword = 'text';
      
    else
      this.tipoBotonPassword = 'password';
  
  }
}