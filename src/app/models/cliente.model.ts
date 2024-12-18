export interface Cliente {
        id: string;
        name: string;
        apellido: string;
        email: string;
        telefono: string;
        direccion: string;
        comuna: string;
        mantenciones: number;
        total: number;
        descripcion: string;
        fotoMantencion?: string; // Nueva propiedad para la foto en formato base64
        fechaHora?: string; // Nueva propiedad para la fecha y hora
      }
        
        
    
