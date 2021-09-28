import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Movimiento } from '../../interfaces/movimiento.interface';
import { WifiStatusService } from '../../services/wifi-status.service';

@Component({
  selector: 'app-sincronizar',
  templateUrl: './sincronizar.component.html',
  styleUrls: ['./sincronizar.component.css']
})
export class SincronizarComponent implements OnInit {

  isConnected = false;  

  @Output() sincronizarEmit :EventEmitter<Movimiento[]> = new EventEmitter();

  constructor(private wifiStatusService: WifiStatusService) { 
    // Para el telefono se necesito comentar la linea webView.setNetworkAvailable(value) en SystemWebViewEngine AndroidStudio
    // this.createOnline$().subscribe(isOnline => this.isConnected = isOnline);
    this.wifiStatusService.createOnline().subscribe((isOnline) => {
      this.isConnected = isOnline;
    });
  }

  ngOnInit(): void {
  }

  sincronizar(): void {
    Swal.fire({
      title: 'Sincronizar',
      text: '¿Deseas sincronizar la información y eliminar los movimientos del sistema?',
      icon: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#02a3b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sincronizarEmit.emit();
      }
    });
  }

  // createOnline$() {
  //   return merge<boolean>(
  //     fromEvent(window, 'offline').pipe(map(() => false)),
  //     fromEvent(window, 'online').pipe(map(() => true)),
  //     new Observable((sub: Observer<boolean>) => {
  //       sub.next(navigator.onLine);
  //       sub.complete();
  //     }));
  //   }
}
