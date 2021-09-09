import { Component, EventEmitter, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Output() showBar :EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  ngOnInit(): void {
  }

  menu(): void{
    this.showBar.emit();
  }
}
