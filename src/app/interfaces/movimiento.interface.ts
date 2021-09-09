import { Registro } from './registro.interface';

export interface Movimiento{
    index?: number;
    registros: Registro[];
    fechaCreacion: number;
    imagenes: any[];
    firmas: string[];
    tipoEntrada: boolean;
    fechaSincronizacion?: string;
    comentario?: string;
    folioRecepcion?: string;
}