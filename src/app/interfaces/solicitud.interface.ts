export interface Solicitud{
    idProveedor: number;
    idUsuarioGenera: number;
    idCliente: number;
    solicitudPDF: any;
    idLista: number;
    noContrato: string;
    noFianza: string;
    noProveedor: string;
    paciente: string;
    nss: string;
    fechaReq: string|undefined;
    fechaCirugia: string|undefined;
    nombreDoctor: string;
    observacionesPrefactura: string;
    folioConsumo: string

    id?: number;
    fechaEmision?: string;
    estatus?: string;
    idSolicitudPDF?: string;
    solicitudPDFNombre?: string;
    proveedorNombre?: string;
    clienteNombre? :string;
    archivoSolicitud?: any;
    cotizacion?: any
}