interface formaPago {
    clave: string;
    descripcion: string;
}

interface tipoPago {
    idx: number;
    descripcion: string;
}

interface usoCFDI {
    clave: string;
    descripcion: string;
}

export interface InformacionCotizar {
    idSolicitud?: number;
    idCliente?: number;
    idLista?: number;
    archivoSolicitud?: any;
    idAsociado?: number;
    direccionEnvio: string;
    formasPago: formaPago[];
    nosCuenta: string[];
    tiposPago: tipoPago[];
    usosCFDI: usoCFDI[];
    esTipoCirugia?: boolean;
}