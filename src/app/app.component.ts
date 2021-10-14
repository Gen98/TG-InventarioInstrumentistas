import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Inventario';
  url: string = '';

  constructor( private location: Location ) {
    location.onUrlChange(val => {
      this.url = val;
    });
  }
}
