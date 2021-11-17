import { Component, OnInit } from '@angular/core';
import { AlmacenesService } from '../../services/almacenes.service';
import { Almacen } from '../../interfaces/almacen.interface';
import almacenesJSON from '../../../assets/files/almacenes.json';

@Component({
  selector: 'app-almacenes',
  templateUrl: './almacenes.component.html',
  styleUrls: ['./almacenes.component.css']
})
export class AlmacenesComponent implements OnInit {

  almacenes: Almacen[] = [];

  constructor(private almacenesService: AlmacenesService) { }

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    return await this.almacenesService.getAlmacenes().then((data: any) => {
      if (data.length == 0) {
        this.almacenes = almacenesJSON.data;
      } else {
        this.almacenes = data;
      }
    });
  }

  sincronizar() {
    this.almacenesService.sincronizar().subscribe((res: Almacen[]) => {
      this.almacenesService.clearDB().then(async () => {
        res.forEach(almacen => {
          this.almacenesService.addAlmacen(almacen);
        });
      }).then(() => {
        this.getData();
      });
    }, () => {
      this.getData();
    });
  }
}
