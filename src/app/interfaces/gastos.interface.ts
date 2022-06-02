export interface Producto {
    idPedido?: string;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    importe: number;
    archivo?: File;
    archivoXml?: File;
    uuid?: string;

    idDetalle?: number;
    rutaId?: number;
    ruta?: string;
}

export interface Solicitud {
    observaciones: string;
    productos: Producto[];
    archivoGral?: File;
    archivoGralXml?: File;
    precioTotal: number;
    importeTotal: number;

    fecha?: string;
    idPedido?: number;
    rutaId?: number;
    ruta?: string;
}