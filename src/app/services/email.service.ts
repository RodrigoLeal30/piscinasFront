import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  // Cambiar a la URL del backend desplegado en Render
  private apiUrl = 'https://piscinasbackend.onrender.com/api/clientes';  // URL del backend en Render

  constructor(private http: HttpClient) {}

  enviarCorreo(cliente: Cliente): Observable<any> {
    // Llamada al backend en producción (Render)
    return this.http.post(`${this.apiUrl}/enviarCorreo`, cliente);
  }

  cerrarMes(cliente: Cliente): Observable<any> {
    return this.http.post(`${this.apiUrl}/cerrarMes`, cliente);
  }

  verificarMantenciones(cliente: Cliente): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificarMantenciones`, cliente);
  }
}