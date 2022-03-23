import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DexieSolicitudesService {


  db: any;
  tableClasificaciones: Dexie.Table<any> | any;
  tableProveedores: Dexie.Table<any> | any;
  tableSolicitudesList: Dexie.Table<any> | any;
  tableSolicitudesShow: Dexie.Table<any> | any;
  tableSolicitudesOffline: Dexie.Table<any> | any;

  constructor() {
    this.initIndexedDB();
  }

  private initIndexedDB() {
    this.db = new Dexie('ODC');
    this.db.version(2).stores({
      clasificaciones: '++idIndexed, id, nombre, subclasificaciones',
      proveedores: '++idIndexed, id, nombre, clientes',
      solicitudesList: '++idIndexed, idSolicitud, nombreCliente, nombreSolicitante, paciente, fechaCirugia, fechaReq',
      solicitudesShow: '++idIndexed, id, idCliente, idProveedor, idSolicitudPDF, idUsuarioGenera, estatus, archivoSolicitud, folioConsumo, solicitudPDFNombre, noFianza, noContrato, noProveedor, nombreDoctor, paciente, observacionesPrefactura, nss, fechaReq, fechaCirugia, fechaEmision',
      solicitudesOffline: '++idIndexed, id, idSolicitud, idProveedor, idCliente, solicitudPDF, idUsuarioGenera, idLista, folioConsumo, noFianza, noContrato, noProveedor, nombreDoctor, paciente, observacionesPrefactura, nss, fechaReq, fechaCirugia, cotizacion',
    });

    this.db.open().catch((err: any) => {
      console.log(err.stack || err);
    });

    this.tableProveedores = this.db.table('proveedores');
    this.tableClasificaciones = this.db.table('clasificaciones');
    this.tableSolicitudesList = this.db.table('solicitudesList');
    this.tableSolicitudesShow = this.db.table('solicitudesShow');
    this.tableSolicitudesOffline = this.db.table('solicitudesOffline');
  }

  async addClasificacion(item: { id: number, nombre: string, subclasificaciones: any[] }) {
    this.initIndexedDB();
    try {
      await this.tableClasificaciones.add(item);
    } catch (error) {
      console.log(error);
    }
  }

  async addProveedor(item: { id: number, nombre: string, clientes: any[] }) {
    try {
      await this.tableProveedores.add(item);
    } catch (error) {
      console.log('error');
    }
  }

  async addSolicitudList(item: any) {
    try {
      await this.tableSolicitudesList.add(item);
    } catch (error) {
      console.log('error');
    }
  }

  async addSolicitudShow(item: any) {
    try {
      await this.tableSolicitudesShow.add(item);
    } catch (error) {
      console.log('error');
    }
  }

  async addSolicitudOffline(item: any) {
    try {
      if (item.id || item.idSolicitud) {
        if (item.id) item.idSolicitud = item.id;
        this.tableSolicitudesOffline.where({ idSolicitud: item.idSolicitud }).first().then(async (old: any) => {
          if (old) this.tableSolicitudesOffline.delete(old.idIndexed);
          await this.tableSolicitudesOffline.add(item);
        });
      } else {
        this.tableSolicitudesOffline.add(item);
      }
    } catch (error) {
      console.log('error');
    }
  }

  async clearDB() {
    this.db.close();
    await Dexie.delete('ODC');
  }

  async getNoEnviados() {
    return await this.tableSolicitudesOffline.toArray();
  }

  async deleteNoEnviado(idIndexed: number) {
    try {
      await this.tableSolicitudesOffline.delete(idIndexed);
    } catch (error) {
      console.log(error);
    }
  }

  async getSolicitudesList() {
    return await this.tableSolicitudesList.toArray();
  }

  async getClasificaciones() {
    return await this.tableClasificaciones.toArray();
  }

  async getProveedores() {
    return await this.tableProveedores.toArray();
  }

  async getSolicitudShow(idSolicitud: number) {
    return await this.tableSolicitudesShow.where({ id: idSolicitud }).first();
  }
  async checkIfExists(idSolicitud: number) {
    return await this.tableSolicitudesOffline.where({ idSolicitud: idSolicitud ? idSolicitud : 0 }).count();
  }
}
