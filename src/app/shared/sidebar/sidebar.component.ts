import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { WifiStatusService } from '../../services/wifi-status.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private innerWidth: number;
  private ban: boolean;
  public url: string;
  public isAuth: boolean;
  public isConnected: boolean = false;

  constructor( private router: Router, private location: Location, private authService: AuthService, private wifiStatusService: WifiStatusService ) {
    this.ban = false;
    this.innerWidth = window.innerWidth;
    this.url = location.path();
    wifiStatusService.createOnline().subscribe(isOnline => {
      this.isConnected = isOnline;
    });
    this.isAuth = authService.isAuth();
  }

  ngOnInit(): void {
  }

  /* Método oculta o muestra la barra en su versión móvil */
  showBar(): void{
    if (this.innerWidth < 768){
      if  (!this.ban){
        $('#mySidebar').animate({
              left: 0
          });
        $('#sidebarcontainer').css('visibility', 'visible');
        this.ban = true;
      }else{
        $('#mySidebar').animate({
          left: -250
        });
        $('#sidebarcontainer').css('visibility', 'hidden');
        this.ban = false;
      }
    }
  }

  /* Método que redirecciona dependiendo de la opción enviada */
  ruta( ruta: string ): void{
    switch ( ruta ){
      case '':
        this.router.navigate(['']);
        break;
      case 'catalogo':
        this.router.navigate(['catalogo']);
        break;
      case 'movimientos':
        this.router.navigate(['movimientos']);
        break;
      case 'almacenes':
        this.router.navigate(['almacenes']);
        break;
      case 'xAtender':
        this.router.navigate(['xAtender']);
        break;
    }
    setTimeout(() => {
      this.url = this.location.path();
    }, 1000);
    this.showBar();
    this.isAuth = this.authService.isAuth();
  }

  movil(): boolean{
    return this.innerWidth < 768;
  }

  logout(): void{
  Swal.fire({
    title: 'Cerrar Sesión',
    text: '¿Esta seguro de cerrar sesión? Se perderán las solicitudes que no hayas enviado.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#02a3b5',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.logout();
    }
  });
  }
}
