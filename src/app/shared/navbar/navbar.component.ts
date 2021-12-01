import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WifiStatusService } from '../../services/wifi-status.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public isConnected: boolean = false;
  @Output() showBar: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthService,
    private router: Router,
    private wifiStatusService: WifiStatusService) {
    wifiStatusService.createOnline().subscribe(isOnline => {
      this.isConnected = isOnline;
    });
  }

  ngOnInit(): void {
  }

  menu(): void {
    this.showBar.emit();
  }

  mostrarEncuesta(): boolean {
    if (this.authService.isAuth() && this.authService.mostrarEncuestas()) {
      return true;
    }
    return false;
  }

  iniciarEncuesta() {
    Swal.fire({
      icon: 'question',
      title: '¿Iniciar encuesta?',
      showCancelButton: true,
      cancelButtonText: 'No',
      cancelButtonColor: 'red',
      confirmButtonText: 'Si',
      confirmButtonColor: 'green'
    }).then(res => {
      if (res.isConfirmed) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/encuesta']);
        });
      }
    });
  }
}
