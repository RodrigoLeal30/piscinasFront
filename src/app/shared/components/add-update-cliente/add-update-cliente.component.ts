import { Component, inject, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';
import { Cliente } from 'src/app/models/cliente.model';

@Component({
  selector: 'app-add-update-cliente',
  templateUrl: './add-update-cliente.component.html',
  styleUrls: ['./add-update-cliente.component.scss'],
})
export class AddUpdateClienteComponent implements OnInit {
  @Input() cliente?: Cliente; // Recibir datos del cliente para edición

  // Lista de comunas
  comunas: string[] = [
    'La Reina',
    'La Florida',
    'Las Condes',
    'Peñalolen',
    'Macul',
  ];

  form = new FormGroup({
    id: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    telefono: new FormControl('', [Validators.required, Validators.minLength(9)]),
    direccion: new FormControl('', [Validators.required, Validators.minLength(4)]),
    comuna: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(4)]),
    mantenciones: new FormControl(0, [Validators.required, Validators.min(0)]), // Nuevo campo
    total: new FormControl(0, [Validators.required, Validators.min(0)]), // Nuevo campo
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user = {} as User;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');

    // Si se pasa un cliente, cargar sus datos en el formulario
    if (this.cliente) {
      this.form.patchValue({
        id: this.cliente.id || '',
        email: this.cliente.email || '',
        name: this.cliente.name || '',
        telefono: this.cliente.telefono || '',
        direccion: this.cliente.direccion || '',
        comuna: this.cliente.comuna || '',
        apellido: this.cliente.apellido || '',
        mantenciones: this.cliente.mantenciones || 0, // Cargar mantenciones
        total: this.cliente.total || 0, // Cargar total
      });
    }
  }

  async submit() {
    // Transformar campos antes de guardar
    this.capitalizeField('name');
    this.capitalizeField('apellido');
    this.capitalizeField('direccion'); // Aplicar capitalización a la dirección
    this.prependPhonePrefix();
    this.addHashToAddress();

    if (this.form.valid) {
      const path = `users/${this.user.uid}/clientes`;
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const clienteData = this.form.value;

        if (clienteData.id) {
          // Actualizar cliente existente
          await this.firebaseSvc.updateDocument(`${path}/${clienteData.id}`, clienteData);
          this.utilsSvc.presentToast({
            message: 'Cliente actualizado con éxito',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
        } else {
          // Crear nuevo cliente
          await this.firebaseSvc.addDocument(path, clienteData);
          this.utilsSvc.presentToast({
            message: 'Cliente creado con éxito',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
        }

        this.utilsSvc.dismissModal({ success: true });
      } catch (error) {
        console.error('Error al guardar el cliente:', error);
        this.utilsSvc.presentToast({
          message: 'Hubo un error al guardar el cliente.',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  // Transformar primera letra a mayúscula
  capitalizeField(field: string): void {
    const value = this.form.get(field)?.value || '';
    this.form.get(field)?.setValue(
      value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  }

  // Agregar el prefijo +569 al teléfono
  prependPhonePrefix(): void {
    let telefono = this.form.get('telefono')?.value || '';
    if (!telefono.startsWith('+569')) {
      telefono = '+569' + telefono.replace(/^\+?569/, ''); // Quita prefijos incorrectos
      this.form.get('telefono')?.setValue(telefono);
    }
  }

  // Agregar # antes de la numeración en la dirección
  addHashToAddress(): void {
    const direccion = this.form.get('direccion')?.value || '';
    const regex = /(.*?)(#?\d+)/; // Captura texto y numeración con o sin #

    if (!direccion.includes('#')) { // Solo agrega '#' si no está presente
      const match = regex.exec(direccion);
      if (match) {
        // Crear la nueva dirección con espacio después del '#'
        const nuevaDireccion = `${match[1].trim()} #${match[2].replace(' #', '').trim()}`;
        this.form.get('direccion')?.setValue(nuevaDireccion);
      }
    }
  }
}