import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'http://localhost:8080/api/clientes'; // URL base

  constructor(private http: HttpClient) {}

  enviarCorreo(cliente: Cliente): Observable<any> {
    // No concatenes /enviarCorreo aquí, ya está en el endpoint del backend
    return this.http.post(`${this.apiUrl}/enviarCorreo`, cliente);
  }

  cerrarMes(cliente: Cliente): Observable<any> {
    return this.http.post(`${this.apiUrl}/cerrarMes`, cliente);
  }

  verificarMantenciones(cliente: Cliente): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificarMantenciones`, cliente);
  }
}