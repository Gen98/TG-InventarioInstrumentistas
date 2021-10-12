import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { WifiStatusService } from '../../services/wifi-status.service';
import { AuthService } from '../../services/auth.service';

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
      case 'inventario':
        this.router.navigate(['inventario']);
        break;
      case 'catalogo':
        this.router.navigate(['catalogo']);
        break;
      case 'xRecibir':
        this.router.navigate(['xRecibir']);
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
    this.authService.logout();
  }
}
