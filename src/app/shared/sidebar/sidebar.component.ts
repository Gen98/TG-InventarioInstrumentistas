import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private innerWidth: number;
  private ban: boolean;
  public url: string;

  constructor( private router: Router, private location: Location ) {
    this.ban = false;
    this.innerWidth = window.innerWidth;
    this.url = location.path();
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
      case 'sincronizados':
        this.router.navigate(['sincronizados']);
        break;
      case 'movimientos':
        this.router.navigate(['movimientos']);
        break;
      case 'almacenes':
        this.router.navigate(['almacenes']);
        break;
    }
    setTimeout(() => {
      this.url = this.location.path();
    }, 1000);
    this.showBar();
  }

  movil(): boolean{
    return this.innerWidth < 768;
  }
}
