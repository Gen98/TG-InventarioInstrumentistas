import { Registro } from './registro.interface';

export interface Movimiento{
    index?: number;
    almacen: number;
    registros: Registro[];
    fechaCreacion: number;
    imagenes: any[];
    firmas: any[];
    tipoEntrada: boolean;
    fechaSincronizacion?: string;
    comentario?: string;
    folio?: string;
}